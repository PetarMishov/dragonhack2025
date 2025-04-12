const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const historicalPersonas = require('../config/personas');
const Chat = require('../models/Chat');
const Character = require('../models/Character');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chatSessions = new Map();

router.post('/:personaId', async (req, res) => {
    try {
        const { personaId } = req.params;
        const { message, sessionId } = req.body;

        // Find the persona from our config or from the database
        let persona = historicalPersonas.find(p => p.id === personaId);
        if (!persona) {
            // Try to get from database if not in config
            const dbCharacter = await Character.findOne({ id: personaId });
            if (!dbCharacter) {
                return res.status(404).json({ error: 'Historical persona not found' });
            }
            persona = {
                id: dbCharacter.id,
                name: dbCharacter.name,
                context: dbCharacter.baseContext
            };
        }

        // Find or create chat session
        let chat = chatSessions.get(sessionId);
        
        if (!chat) {
            const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
            
            // Retrieve chat history from database
            const chatHistory = await Chat.findById(sessionId);
            
            // Build history for the model
            let history = [];
            
            if (chatHistory) {
                // Add persona context first
                history.push({
                    role: 'user',
                    parts: `You are ${persona.name}. ${persona.context} Always stay in character.`
                });
                
                // Add message history
                chatHistory.messages.forEach(msg => {
                    history.push({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: msg.content
                    });
                });
            } else {
                // If no chat history, just add the persona context
                history.push({
                    role: 'user',
                    parts: `You are ${persona.name}. ${persona.context} Always stay in character.`
                });
            }
            
            // Start the chat with the history
            chat = model.startChat({ history });
            chatSessions.set(sessionId, chat);
        }

        // Send the message to the AI
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const responseText = response.text();

        // Save the chat message to the database
        await updateChatHistory(sessionId, message, responseText, personaId);

        return res.json({
            message: responseText,
            personaId,
            sessionId
        });
    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({ error: 'Failed to process chat message' });
    }
});

// Function to update or create chat history
async function updateChatHistory(sessionId, userMessage, aiResponse, characterId) {
    try {
        let chat = await Chat.findById(sessionId);
        
        if (!chat) {
            // Create a new chat if it doesn't exist
            chat = new Chat({
                _id: sessionId,
                title: `Chat with ${characterId}`,
                characterId: characterId,
                messages: []
            });
        }
        
        // Add the new messages
        chat.messages.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: aiResponse }
        );
        
        // Update lastInteraction timestamp
        chat.lastInteraction = Date.now();
        
        await chat.save();
    } catch (error) {
        console.error('Error updating chat history:', error);
        // We'll just log this error but continue with the response
        // to keep the chat working even if saving fails
    }
}

router.get('/personas', (req, res) => {
    res.json(historicalPersonas);
});

module.exports = router;
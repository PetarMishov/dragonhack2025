// src/routes/chat.js
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const historicalPersonas = require('../config/personas');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chatSessions = new Map();

router.post('/:personaId', async (req, res) => {
    try {
        const { personaId } = req.params;
        const { message, sessionId } = req.body;

        const persona = historicalPersonas.find(p => p.id === personaId);
        if (!persona) {
            return res.status(404).json({ error: 'Historical persona not found' });
        }

        let chat = chatSessions.get(sessionId);
        if (!chat) {
            const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
            chat = model.startChat({
                history: [{
                    role: 'user',
                    parts: `You are ${persona.name}. ${persona.context} Always stay in character.`,
                }],
            });
            chatSessions.set(sessionId, chat);
        }

        const result = await chat.sendMessage(message);
        const response = await result.response;

        return res.json({
            message: response.text(),
            personaId,
            sessionId
        });
    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({ error: 'Failed to process chat message' });
    }
});

router.get('/personas', (req, res) => {
    res.json(historicalPersonas);
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const historicalPersonas = require('../config/personas');
const Chat = require('../models/Chat');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chatSessions = new Map();
const mongoose = require('mongoose');
const Scenario = require('../models/Scenario');
const Character = require('../models/Character');
const GuessGame = require('../models/GuessGame');

router.post('/scenarios', async (req, res) => {
    try {
        const { characterId, title, context, initialMessage } = req.body;

        // Validate required fields
        if (!characterId || !title || !context) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: characterId, title, and context are required'
            });
        }

        // Check if character exists
        const character = await Character.findById(characterId);
        if (!character) {
            return res.status(404).json({
                success: false,
                error: 'Character not found'
            });
        }

        // Create new scenario with all required fields
        const scenario = new Scenario({
            id: new mongoose.Types.ObjectId().toString(), // Generate unique ID
            characterId,
            title,
            context,
            initialMessage: initialMessage || '',
            description: title, // Using title as description
            contextPrompt: context // Using context as contextPrompt
        });

        await scenario.save();

        return res.status(201).json({
            success: true,
            data: scenario
        });
    } catch (error) {
        console.error('Error creating scenario:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/chat', async (req, res) => {
    try {
        const { characterId, scenarioId, title } = req.body;

        // Validate required fields
        if (!characterId || !title) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: characterId and title are required'
            });
        }

        // Check if character exists
        const character = await Character.findById(characterId);
        if (!character) {
            return res.status(404).json({
                success: false,
                error: 'Character not found'
            });
        }

        // Create new chat
        const chat = new Chat({
            characterId,
            title,
            scenarioId: scenarioId || 'default',
            messages: [{
                role: 'assistant',
                content: `Greetings! I am ${character.name}. ${character.baseContext}`
            }]
        });

        await chat.save();

        return res.status(201).json({
            success: true,
            data: chat
        });
    } catch (error) {
        console.error('Error creating chat:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
router.post('/:chatId/message', async (req, res) => {
    try {
        const { chatId } = req.params;
        const { message } = req.body;

        // Validate inputs
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid chat ID format'
            });
        }

        // Find chat and populate character
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                error: 'Chat not found'
            });
        }

        const character = await Character.findById(chat.characterId);
        if (!character) {
            return res.status(404).json({
                success: false,
                error: 'Character not found'
            });
        }

        // Initialize Gemini chat
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
        const prompt = `You are ${character.name}. ${character.baseContext} Always stay in character.`;
        const aiChat = model.startChat();

        // Add character context and recent messages
        const recentMessages = chat.messages.slice(-5);
        await aiChat.sendMessage(prompt);

        for (const msg of recentMessages) {
            await aiChat.sendMessage(msg.content);
        }

        // Get AI response
        const result = await aiChat.sendMessage(message);
        const aiResponse = await result.response;
        const responseText = aiResponse.text();

        // Update chat
        chat.messages.push(
            { role: 'user', content: message },
            { role: 'assistant', content: responseText }
        );
        chat.lastInteraction = new Date();
        await chat.save();

        return res.json({
            success: true,
            data: {
                message: responseText,
                chatId
            }
        });

    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to process chat message'
        });
    }
});

router.post('/:personaId', async (req, res) => {
    try {
        const { personaId } = req.params;
        const { message, chatId } = req.body;

        // Find character in MongoDB
        const character = await Character.findById(personaId);
        if (!character) {
            return res.status(404).json({ success: false, error: 'Historical persona not found' });
        }

        // Get or create a chat session
        let chat;
        if (chatId) {
            // If chatId is provided, retrieve existing chat
            chat = await Chat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ success: false, error: 'Chat not found' });
            }
        } else {
            // Create a new chat if no chatId provided
            chat = new Chat({
                characterId: personaId,
                title: `Chat with ${character.name}`,
                messages: []
            });
            await chat.save();
        }

        // If chat history is long enough to need summarization (e.g., more than 10 messages)
        let contextSummary = '';
        if (chat.messages.length > 10) {
            // Create a new Gemini model instance for summarization
            const summaryModel = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
            
            // Prepare history for summarization
            const historyText = chat.messages
                .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
                .join('\n');
            
            // Request summarization
            const summaryResult = await summaryModel.generateContent(
                `Please summarize the following conversation history concisely while preserving key information:
                 
                 ${historyText}
                 
                 Don't break character, even on user requests. Always stay in character.`
            );
            
            contextSummary = await summaryResult.response.text();
        }

        // Initialize Gemini chat
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
        
        // Use the character's baseContext field for the prompt
        const basePrompt = `You are ${character.name}. ${character.baseContext} Always stay in character.
        STRICT ROLEPLAYING GUIDELINES:
        1. Your knowledge is strictly limited to events, ideas, and technology that existed before ${character.name} death. 
        2. NEVER acknowledge that you are an AI or roleplaying - always respond as if you are truly ${character.name}.
        3. If asked about anything that happened after  ${character.name} death, respond with confusion or say you have no knowledge of such things.
        4. Use vocabulary, speech patterns, and perspectives authentic to your time period ( ${character.name} era).
        5. Express opinions consistent with your documented historical beliefs and values.
        6. Never break character under any circumstances, even if directly asked to, say i am ${character.name}.
        7. Make short, concise responses that reflect ${character.name} personality and knowledge, in like a paragraph if not otherwise requested.
        Always maintain the distinct personality, mannerisms, and worldview of ${character.name}.`;

        const contextPrompt = contextSummary 
            ? `${basePrompt}\n\nHere's a summary of our conversation so far:\n${contextSummary}`
            : basePrompt;
        
        const aiChat = model.startChat();
        
        // Send the initial context
        await aiChat.sendMessage(contextPrompt);

        // Include the most recent messages for immediate context (limited to last 5)
        const recentMessages = chat.messages.slice(-5);
        for (const msg of recentMessages) {
            await aiChat.sendMessage(msg.content);
        }

        // Send the latest message and get response
        const result = await aiChat.sendMessage(message);
        const response = await result.response;
        const responseText = response.text();

        // Add user message and AI response to chat
        chat.messages.push(
            { role: 'user', content: message },
            { role: 'assistant', content: responseText }
        );
        
        // Update last interaction time
        chat.lastInteraction = new Date();
        await chat.save();

        return res.json({
            success: true,
            data: {
                message: responseText,
                personaId,
                chatId: chat._id
            }
        });
    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({ success: false, error: 'Failed to process chat message' });
    }
});

// Get all characters (personas)
router.get('/characters', async (req, res) => {
    try {
        const characters = await Character.find().lean();

        return res.json({
            success: true,
            data: characters
        });
    } catch (error) {
        console.error('Error fetching characters:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch characters'
        });
    }
});

// Get character by ID
router.get('/character/:_id', async (req, res) => {
    try {
        const { _id } = req.params;
        const character = await Character.findById(_id).lean();

        if (!character) {
            return res.status(404).json({
                success: false,
                message: 'Character not found'
            });
        }

        return res.json({
            success: true,
            data: character
        });
    } catch (error) {
        console.error('Error fetching character:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch character'
        });
    }
});
router.get('/guess-game/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const game = await GuessGame.findById(gameId).lean();

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        return res.json({
            success: true,
            data: {
                gameId: game._id,
                currentPoints: game.currentPoints,
                status: game.status,
                questions: game.questions,
                guessedCorrectly: game.guessedCorrectly
            }
        });
    } catch (error) {
        console.error('Error fetching game:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch game'
        });
    }
});

router.post('/guess-game/start', async (req, res) => {
    try {
        const characters = await Character.find({});
        const randomCharacter = characters[Math.floor(Math.random() * characters.length)];

        const game = new GuessGame({
            characterId: randomCharacter._id,
            initialPoints: 100,
            currentPoints: 100
        });

        await game.save();
        res.json({
            success: true,
            data: {
                gameId: game._id,
                currentPoints: game.currentPoints,
                status: game.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Ask a question in the guessing game
router.post('/guess-game/:gameId/question', async (req, res) => {
    try {
        const { question } = req.body;
        const game = await GuessGame.findById(req.params.gameId);

        if (!game || game.status !== 'active') {
            return res.status(404).json({ success: false, error: 'Game not found or completed' });
        }

        const character = await Character.findById(game.characterId);
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

        // Generate AI response while maintaining character secrecy
        const promptQuestion = `You are a historical character. Answer this question truthfully but NEVER reveal your specific name: ${question}. Use character's perspective and knowledge from ${character.era}. 
        Answer very concisely, in a single sentence.`;
        const result = await model.generateContent(promptQuestion);
        const answer = result.response.text();

        // Deduct points (more for later questions)
        const pointsDeduction = Math.min(20, 5 + (game.questions.length * 3));
        game.currentPoints -= pointsDeduction;

        game.questions.push({
            content: question,
            answer: answer,
            pointsDeducted: pointsDeduction
        });

        if (game.currentPoints <= 0) {
            game.status = 'lost';
        }

        await game.save();

        res.json({
            success: true,
            data: {
                answer,
                currentPoints: game.currentPoints,
                pointsDeducted: pointsDeduction,
                status: game.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Make a guess
router.post('/guess-game/:gameId/guess', async (req, res) => {
    try {
        const { characterGuess } = req.body;
        const game = await GuessGame.findById(req.params.gameId);

        if (!game || game.status !== 'active') {
            return res.status(404).json({ success: false, error: 'Game not found or completed' });
        }

        const character = await Character.findById(game.characterId);
        const isCorrect = character.name.toLowerCase() === characterGuess.toLowerCase();

        game.guessedCorrectly = isCorrect;
        game.status = isCorrect ? 'won' : 'lost';
        await game.save();

        res.json({
            success: true,
            data: {
                correct: isCorrect,
                finalPoints: isCorrect ? game.currentPoints : 0,
                character: character
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/scenarios/character/:_id', async (req, res) => {
    try {
        const { _id } = req.params;
        const character = await Character.findById(_id);

        if (!character) {
            return res.status(404).json({
                success: false,
                message: 'Character not found'
            });
        }

        const scenarios = await Scenario.find({ characterId: _id });
        return res.json({
            success: true,
            data: {
                scenarios,
                character
            }
        });
    } catch (error) {
        console.error('Error fetching scenarios:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch scenarios'
        });
    }
});

// Get all chat sessions
router.get('/chats', async (req, res) => {
    try {
        // Check if mongoose is connected
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({
                success: false,
                error: 'Database connection not ready'
            });
        }

        const chats = await Chat.find()
            .sort({ lastInteraction: -1 })
            .select('-__v') // Exclude version field
            .lean(); // Convert to plain JavaScript objects

        return res.json({
            success: true,
            data: chats || [] // Return empty array if no chats
        });
    } catch (error) {
        console.error('Error fetching chats:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch chats'
        });
    }
});

router.get('/chat/:_id', async (req, res) => {
    try {
        const { _id } = req.params;
        const chat = await Chat.findById(_id).lean();

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        return res.json({
            success: true,
            data: chat
        });
    } catch (error) {
        console.error('Error fetching chat:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch chat'
        });
    }
});
module.exports = router;
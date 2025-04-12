// src/routes/chat.js
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const historicalPersonas = require('../config/personas');
const Chat = require('../models/chat');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chatSessions = new Map();
const mongoose = require('mongoose');
const Scenario = require('../models/Scenario');
const Character = require('../models/Character');
const GuessGame = require('../models/GuessGame');
router.post('/:personaId', async (req, res) => {
    try {
        const { personaId } = req.params;
        const { message } = req.body;

        const persona = historicalPersonas.find(p => p.id === personaId);
        if (!persona) {
            return res.status(404).json({ error: 'Historical persona not found' });
        }

        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
        const chat = model.startChat({
            history: [{
                role: 'user',
                parts: `You are ${persona.name}. ${persona.context} Always stay in character.`,
            }],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;

        return res.json({
            message: response.text(),
            personaId
        });
    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({ error: 'Failed to process chat message' });
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
        // Randomly select a character
        const characters = await Character.find({});
        const randomCharacter = characters[Math.floor(Math.random() * characters.length)];

        const game = new GuessGame({
            characterId: randomCharacter.id,
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

        const character = await Character.findOne({ id: game.characterId });
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

        // Generate AI response while maintaining character secrecy
        const promptQuestion = `You are a historical character. Answer this question truthfully but NEVER reveal your specific name: ${question}. Use character's perspective and knowledge from ${character.era}.`;
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

        const character = await Character.findOne({ id: game.characterId });
        const isCorrect = character.name.toLowerCase() === characterGuess.toLowerCase();

        game.guessedCorrectly = isCorrect;
        game.status = isCorrect ? 'won' : 'lost';
        await game.save();

        res.json({
            success: true,
            data: {
                correct: isCorrect,
                finalPoints: isCorrect ? game.currentPoints : 0,
                character: isCorrect ? character : null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/scenarios/character/:_id', async (req, res) => {
    try {
        const { _id } = req.params;

        // Find character by MongoDB _id
        const character = await Character.findById(_id);
        if (!character) {
            return res.status(404).json({
                success: false,
                message: 'Character not found'
            });
        }

        // Use character.id to find matching scenarios
        const scenarios = await Scenario.find({ characterId: character.id }).lean();

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
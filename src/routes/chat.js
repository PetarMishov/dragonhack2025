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
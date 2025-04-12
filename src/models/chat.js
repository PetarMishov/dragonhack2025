// src/models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    characterId: {
        type: String,
        required: true
    },
    scenarioId: {
        type: String,
        default: 'default'
    },
    messages: [{
        role: {
            type: String,
            required: true,
            enum: ['user', 'assistant']
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    lastInteraction: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Chat', chatSchema);
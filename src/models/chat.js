// src/models/Chat.js
const mongoose = require('mongoose');
const {Schema, Types} = mongoose;
const chatSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    characterId: {
        type: Types.ObjectId,
        ref: 'Character',
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
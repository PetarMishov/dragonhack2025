// src/models/GuessGame.js
const mongoose = require('mongoose');

const guessGameSchema = new mongoose.Schema({
    characterId: {
        type: String,
        required: true
    },
    initialPoints: {
        type: Number,
        default: 100
    },
    currentPoints: {
        type: Number,
        default: 100
    },
    questions: [{
        content: String,
        answer: String,
        pointsDeducted: Number,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'won', 'lost'],
        default: 'active'
    },
    guessedCorrectly: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GuessGame', guessGameSchema);
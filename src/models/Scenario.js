// src/models/Scenario.js
const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    alternateHistory: {
        type: String,
        required: true
    },
    contextPrompt: {
        type: String,
        required: true
    },
    characterId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Scenario', scenarioSchema);
// src/models/Character.js
const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    era: {
        type: String,
        required: true
    },
    baseContext: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Character', characterSchema);
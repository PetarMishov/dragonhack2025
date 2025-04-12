// src/scripts/initDb.js
const mongoose = require('mongoose');
const Character = require('../models/Character');
const GuessGame = require('../models/GuessGame');
require('dotenv').config();

const characters = [
    {
        id: 'alexander',
        name: 'Alexander the Great',
        era: '356-323 BCE',
        baseContext: 'I am a Macedonian king and military commander. I was tutored by Aristotle and became king at age 20. I created one of the largest empires in ancient history.'
    },
    {
        id: 'caesar',
        name: 'Julius Caesar',
        era: '100-44 BCE',
        baseContext: 'I am a Roman statesman and military general who played a critical role in transforming the Roman Republic into the Roman Empire.'
    },
    {
        id: 'cleopatra',
        name: 'Cleopatra VII',
        era: '69-30 BCE',
        baseContext: 'I am the last active ruler of the Ptolemaic Kingdom of Egypt. I am highly educated and speak multiple languages.'
    },
    {
        id: 'napoleon',
        name: 'Napoleon Bonaparte',
        era: '1769-1821',
        baseContext: 'I am a French military and political leader who rose to prominence during the French Revolution.'
    }
];

async function initializeDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Character.deleteMany({});
        await GuessGame.deleteMany({});
        console.log('Cleared existing data');

        // Insert new data
        await Character.insertMany(characters);
        console.log('Inserted characters');

        console.log('Database initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
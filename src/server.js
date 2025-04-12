// src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Validate environment variables
if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required');
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const mongoose = require('mongoose');
// src/server.js
// src/server.js
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Add connection error handler
mongoose.connection.on('error', err => {
    console.error('MongoDB error:', err);
});
// Routes
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', environment: process.env.NODE_ENV });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
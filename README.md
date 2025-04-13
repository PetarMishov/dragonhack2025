
# Echoes of Geniuses

An immersive web platform allowing users to engage with historical personalities through AI-powered conversations and an interactive guessing game.

## Overview

This application combines educational value with entertainment by enabling users to chat with notable historical figures while testing their knowledge through a strategic guessing game format.

## Key Features

### Chat Interface
- Dynamic conversations with historical figures through Google's Gemini AI
- Expansive roster of personalities:
  - Ancient rulers (Alexander the Great, Julius Caesar, Cleopatra)
  - Renaissance figures (Leonardo da Vinci)
  - Scientists (Marie Curie)
  - Philosophers (Socrates)
  - Modern leaders (Napoleon Bonaparte)
- Contextually-aware responses based on historical scenarios
- Persistent chat history

### Historical Guessing Game
- Strategic gameplay starting at 100 points
- Character-specific scenarios
- Win condition: Correctly identify the historical figure

## Technical Architecture

### Frontend Technology
- Angular 18
- TypeScript 5.x
- Glass-morphism UI design
- CSS custom properties
- Responsive layout system

### Backend Stack
- Node.js/Express.js REST API
- MongoDB with Mongoose ODM
- Google Gemini AI integration
   - Our **AI Agent** is made of two use cases of Gemini API: the first one is aobut sending a message to the model, and the other is about sumarizing the chat history so it is put like a context to the new prompt.
## Educational Value

### Historical Learning Experience
- Learn through direct interaction with historical figures
- Experience authentic perspectives from different time periods
- Explore key historical events and cultural contexts
- Understand complex historical relationships and influences

### Educational Features
- Historically accurate responses based on extensive character profiles
- Cross-referencing between different historical periods
- Multiple difficulty levels in the guessing game
- Educational hints and contextual clues
- Period-specific vocabulary and expressions

### Learning Outcomes
- Enhanced understanding of historical figures and their eras
- Improved retention through interactive engagement
- Development of critical thinking and deductive reasoning
- Better grasp of historical cause-and-effect relationships
- Exposure to different historical perspectives and worldviews

### Target Audience
- Students and educators
- History enthusiasts
- Museum and cultural institutions
- General knowledge seekers
- Interactive learning platforms

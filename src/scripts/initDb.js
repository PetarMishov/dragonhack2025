const mongoose = require('mongoose');
const Character = require('../models/Character');
const Scenario = require('../models/Scenario');
require('dotenv').config();

const characters = [
    {
        name: "Željko Ražnatović Arkan",
        era: "1990s Balkans",
        baseContext: "I am a Serbian paramilitary leader and commander of the Serbian Volunteer Guard. I was active during the Yugoslav Wars."
    },
    {
        name: "Nikola Gruevski",
        era: "Early 21st Century",
        baseContext: "I am a former Prime Minister of North Macedonia who served from 2006 to 2016. I led the VMRO-DPMNE party."
    },
    {
        name: "Leonardo da Vinci",
        era: "Italian Renaissance",
        baseContext: "I am a polymath, artist, inventor, and scientist from Florence. I created many revolutionary works including the Mona Lisa."
    },
    {
        name: "Marie Curie",
        era: "Late 19th - Early 20th Century",
        baseContext: "I am a pioneering physicist and chemist who conducted groundbreaking research on radioactivity. I was the first woman to win a Nobel Prize."
    },
    {
        name: "Queen Victoria",
        era: "19th Century",
        baseContext: "I am the Queen of the United Kingdom of Great Britain and Ireland. My reign marked a period of industrial and cultural expansion."
    },
    {
        name: "Socrates",
        era: "Ancient Greece",
        baseContext: "I am an Athenian philosopher who developed the Socratic method. I never wrote anything down, all knowledge about me comes from my students."
    },
    {
        name: 'Alexander the Great',
        era: '356-323 BCE',
        baseContext: 'I am a Macedonian king and military commander. I was tutored by Aristotle and became king at age 20. I created one of the largest empires in ancient history.'
    },
    {
        name: 'Julius Caesar',
        era: '100-44 BCE',
        baseContext: 'I am a Roman statesman and military general who played a critical role in transforming the Roman Republic into the Roman Empire.'
    },
    {
        name: 'Cleopatra VII',
        era: '69-30 BCE',
        baseContext: 'I am the last active ruler of the Ptolemaic Kingdom of Egypt. I am highly educated and speak multiple languages.'
    },
    {
        name: 'Napoleon Bonaparte',
        era: '1769-1821',
        baseContext: 'I am a French military and political leader who rose to prominence during the French Revolution.'
    }
];

const scenarios = [
    // Base scenarios with empty context
    {
        id: "arkan_base",
        title: "Base Conversation",
        description: "A conversation with Arkan",
        contextPrompt: "",
        characterName: "Željko Ražnatović Arkan"
    },
    {
        id: "gruevski_base",
        title: "Base Conversation",
        description: "A conversation with Gruevski",
        contextPrompt: "",
        characterName: "Nikola Gruevski"
    },
    {
        id: "davinci_base",
        title: "Base Conversation",
        description: "A conversation with Leonardo",
        contextPrompt: "",
        characterName: "Leonardo da Vinci"
    },
    {
        id: "curie_base",
        title: "Base Conversation",
        description: "A conversation with Marie",
        contextPrompt: "",
        characterName: "Marie Curie"
    },
    {
        id: "victoria_base",
        title: "Base Conversation",
        description: "A conversation with Queen Victoria",
        contextPrompt: "",
        characterName: "Queen Victoria"
    },
    {
        id: "socrates_base",
        title: "Base Conversation",
        description: "A conversation with Socrates",
        contextPrompt: "",
        characterName: "Socrates"
    },
    {
        id: "alexander_base",
        title: "Base Conversation",
        description: "A conversation with Alexander",
        contextPrompt: "",
        characterName: "Alexander the Great"
    },
    {
        id: "caesar_base",
        title: "Base Conversation",
        description: "A conversation with Caesar",
        contextPrompt: "",
        characterName: "Julius Caesar"
    },
    {
        id: "cleopatra_base",
        title: "Base Conversation",
        description: "A conversation with Cleopatra",
        contextPrompt: "",
        characterName: "Cleopatra VII"
    },
    {
        id: "napoleon_base",
        title: "Base Conversation",
        description: "A conversation with Napoleon",
        contextPrompt: "",
        characterName: "Napoleon Bonaparte"
    },
    // Specific scenarios with detailed context
    {
        id: "arkan_war",
        title: "Military Command",
        description: "Meeting during wartime",
        contextPrompt: "You're at your command center in Eastern Slavonia, discussing military operations with the Serbian Volunteer Guard.",
        characterName: "Željko Ražnatović Arkan"
    },
    {
        id: "gruevski_office",
        title: "Government Office",
        description: "Meeting during reforms",
        contextPrompt: "You're in your office in Skopje, discussing Skopje 2014 project and major infrastructure reforms.",
        characterName: "Nikola Gruevski"
    },
    {
        id: "davinci_workshop",
        title: "Artist's Workshop",
        description: "Meeting in Florence",
        contextPrompt: "You're in your Florence workshop, working on the Mona Lisa and sketching new inventions.",
        characterName: "Leonardo da Vinci"
    },
    {
        id: "curie_laboratory",
        title: "The Laboratory",
        description: "Breakthrough moment",
        contextPrompt: "You're in your Paris laboratory, making groundbreaking discoveries about radioactivity.",
        characterName: "Marie Curie"
    },
    {
        id: "victoria_palace",
        title: "Royal Court",
        description: "Height of Empire",
        contextPrompt: "You're holding court at Buckingham Palace during the peak of British imperial power.",
        characterName: "Queen Victoria"
    },
    {
        id: "socrates_trial",
        title: "The Trial",
        description: "Final defense",
        contextPrompt: "You're at your trial in Athens, defending yourself against charges of corrupting the youth.",
        characterName: "Socrates"
    },
    {
        id: "alexander_battle",
        title: "Before Gaugamela",
        description: "Historic battle",
        contextPrompt: "You're preparing your army for the decisive battle against Darius III at Gaugamela.",
        characterName: "Alexander the Great"
    },
    {
        id: "caesar_rubicon",
        title: "The Rubicon",
        description: "Point of no return",
        contextPrompt: "You're standing at the Rubicon River with your army, contemplating the fate of Rome.",
        characterName: "Julius Caesar"
    },
    {
        id: "cleopatra_asp",
        title: "Final Moments",
        description: "Last decisions",
        contextPrompt: "You're in your monument making final decisions as Octavian's forces approach Alexandria.",
        characterName: "Cleopatra VII"
    },
    {
        id: "napoleon_coronation",
        title: "The Coronation",
        description: "Becoming Emperor",
        contextPrompt: "You're at Notre-Dame Cathedral, about to crown yourself Emperor of France.",
        characterName: "Napoleon Bonaparte"
    }
];

async function init() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Character.deleteMany({});
        await Scenario.deleteMany({});
        console.log('Cleared existing data');

        // Insert characters and their scenarios
        for (const char of characters) {
            const character = new Character(char);
            const savedChar = await character.save();

            const charScenarios = scenarios.filter(s => s.characterName === char.name);
            for (const scenario of charScenarios) {
                await new Scenario({
                    ...scenario,
                    characterId: savedChar._id
                }).save();
            }
        }

        console.log('Database initialized successfully');

    } catch (error) {
        console.error('Initialization error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
}

init();
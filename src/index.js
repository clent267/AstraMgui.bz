const { Client, IntentsBitField, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');
const { mongodb, token } = require('../config.json');
const process = require('node:process')

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

(async () => {
  try {
    // Anti-Crash System
    process.on('unhandledRejection', (reason, promise) => {
      console.log('Unhandled Rejection at:', promise, 'reason:', reason)
      // Recommended: send the information to sentry.io
      // or whatever crash reporting service you use
    })

    // Connect to MongoDB
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongodb, { keepAlive: true });

    eventHandler(client);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();

client.on('ready', () => {
	client.user.setPresence({
    status: 'dnd',
    activities: [
      {
        name: 'with your mom',
        type: ActivityType.Playing
      }
    ]
  })
});

client.login(token);

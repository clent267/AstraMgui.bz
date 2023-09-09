const { Schema, model } = require('mongoose');

const gameSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  games: {
    type: String,
    default: 0,
  },
  apiKey: {
    type: String,
    default: 0,
  },
  lastUpdate: {
    type: String,
    default: 0,
  },
});

module.exports = model('Game', gameSchema);
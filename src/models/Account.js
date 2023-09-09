const { Schema, model } = require('mongoose');

const accountSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  valid: {
    type: String,
    default: 0,
  },
  lastUpdate: {
    type: String,
    default: 0,
  },
});

module.exports = model('Account', accountSchema);
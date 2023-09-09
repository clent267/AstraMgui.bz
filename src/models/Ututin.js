const { Schema, model } = require('mongoose');

const ututinSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  gameId: {
    type: String,
    required: true,
  },
  visit: {
    type: String,
    default: 0,
  },
  verifiednbc: {
    type: String,
    default: 0,
  },
  unverifiednbc: {
    type: String,
    default: 0,
  },
  verifiedprem: {
    type: String,
    default: 0,
  },
  unverifiedprem: {
    type: String,
    default: 0,
  },
  success: {
    type: String,
    default: 0,
  },
  failed: {
    type: String,
    default: 0,
  },
});

module.exports = model('Ututin', ututinSchema);
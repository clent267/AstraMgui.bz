const { Schema, model } = require('mongoose');

const webhookSchema = new Schema({
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
  webhooks: {
    'all-visits': { type: String, required: true },
    'unverified-nbc': { type: String, required: true },
    'unverified-premium': { type: String, required: true },
    'verified-nbc': { type: String, required: true },
    'verified-premium': { type: String, required: true },
    'success': { type: String, required: true },
    'failed': { type: String, required: true },
    'game-link': { type: String, required: true },
  },
});

module.exports = model('WebhookData', webhookSchema);
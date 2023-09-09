const { Schema, model } = require('mongoose');

const tokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: false,
    default: 'None'
  },
  status: {
    type: String,
    required: false,
    default: 'unclaimed',
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  claimedby: {
    type: String,
    required: false,
    default: 'None',
  },
});

module.exports = model('Token', tokenSchema);
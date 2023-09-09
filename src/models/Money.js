const { Schema, model } = require('mongoose');

const moneySchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  cash: {
    type: Number,
    required: false,
    default: '0'
  },
  bank: {
    type: Number,
    required: false,
    default: '0',
  },
  isProtected: {
    type: Boolean,
    required: false,
    default: false,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = model('Money', moneySchema);
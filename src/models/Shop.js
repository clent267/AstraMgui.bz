const { Schema, model } = require('mongoose');

const shopSchema = new Schema({
  item: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: false,
    default: '0'
  },
  status: {
    type: String,
    required: false,
    default: 'available',
  },
  max: {
    type: Number,
    required: true,
    default: '1',
  },
  ability: {
    type: String,
    required: true,
    default: 'none',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    required: true,
  }
});

module.exports = model('Shop', shopSchema);
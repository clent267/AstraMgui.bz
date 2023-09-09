const { Schema, model } = require('mongoose');

const voucherSchema = new Schema({
  createdBy: {
    type: String,
    required: true,
  },
  code: {
    type: Number,
    required: true,
    default: '0'
  },
  value: {
    type: Number,
    required: true,
    default: 0
  },
  uses: {
    type: Number,
    required: true,
  },
  maxUses: {
    type: Number,
    required: true,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = model('Voucher', voucherSchema);
const { Schema, model } = require('mongoose');

const inventorySchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  item: {
    type: String,
    required: true,
  },
  ability: {
    type: String,
    required: true,
  },
});

module.exports = model('Inventory', inventorySchema);
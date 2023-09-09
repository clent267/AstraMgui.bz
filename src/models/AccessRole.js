const { Schema, model } = require('mongoose');

const roleSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  roleId: {
    type: String,
    required: true,
  },
});

module.exports = model('AccessRole', roleSchema);
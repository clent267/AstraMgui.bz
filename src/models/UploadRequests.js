const { Schema, model } = require('mongoose');

const uploadrequestsSchema = new Schema({
  requestId: {
    type: String,
    required: true,
  },
  gameURL: {
    type: String,
    required: true,
  },
  pubType:{
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'failed',
  },
});

module.exports = model('UploadRequests', uploadrequestsSchema);
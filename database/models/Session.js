const mongoose = require('mongoose');

const { Schema } = mongoose;

const Session = new Schema(
  {
    sessionId: {
      type: String,
      index: {
        unique: true,
      },
      required: true,
    },
    pin: {
      type: String,
    },
    ownerUserId: {
      type: String,
      required: true,
    },
    members: {
      type: Object,
    },
    secret: {
      type: String,
      required: true,
    },
    created: Date,
  },
);


module.exports = mongoose.model('Session', Session);

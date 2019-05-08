const mongoose = require('mongoose');

const { Schema } = mongoose;

const User = new Schema(
  {
    userId: {
      type: String,
      index: {
        unique: true,
      },
      required: true,
    },
    created: Date,
  },
);


module.exports = mongoose.model('User', User);

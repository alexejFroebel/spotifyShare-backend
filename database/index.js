const mongoose = require('mongoose');

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  appname: 'sessions-for-spotify',
  reconnectTries: Number.MAX_VALUE,
  validateOptions: true,
  reconnectInterval: 1000,
};
const connectionString = 'mongodb://localhost:27017/sessions-for-spotify';

function initialize() {
  mongoose.connect(connectionString, options);
}

module.exports.initialize = initialize;
module.exports.User = require('./models/User');
module.exports.Session = require('./models/Session');

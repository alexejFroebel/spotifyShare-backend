const mongoose = require('mongoose');

const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    appname: 'spotifyShare',
    reconnectTries: Number.MAX_VALUE,
    validateOptions: true,
    reconnectInterval: 1000,
};
let connectionString = "mongodb://localhost:27017/spotifyShare"
mongoose.connect(connectionString(), options)
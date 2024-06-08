const mongoose = require('mongoose');

const config = require('../../config/index');

const MONGO_URL = `mongodb+srv://${config.dbUser}:${config.dbPassword}@cluster0.0zqlrco.mongodb.net/${config.dbName}?retryWrites=true&w=majority&appName=Cluster0`;


mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready');
});

mongoose.connection.once('error', (err) => {
    console.error(err);
});

async function mongoConnect() {
    await mongoose.connect(MONGO_URL);
};

async function mongoDisconnect() {
    await mongoose.disconnect();
};

module.exports = {
    mongoConnect,
    mongoDisconnect
};
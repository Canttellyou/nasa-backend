
const http = require('http');
const app = require('./app');

const { loadPlanetsData } = require('./models/planets.model');
const { mongoConnect } = require('./services/mongo');
const { loadLaunchesData } = require('./models/launches.model');
const config = require('../config');

const server = http.createServer(app);
const PORT = config.port;



async function startServer() {
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchesData();
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();

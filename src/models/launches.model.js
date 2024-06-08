const axios = require('axios');
const launchesDatabase = require('./launches.schema');

const DEFAULT_FLIGHT_NUMBER = 100;

// const launch = {
//     flightNumber: 100, //flight_number
//     mission: 'Kepler Exploration X', //name
//     rocket: 'Explorer IS1',  //rocket.name
//     launchDate: new Date('December 27, 2030'), // date_launch
//     target: 'Kepler-442 b', // not applicable
//     customers: ['ZTM', 'NASA'],
//     upcoming: true, //upcoming
//     success: true //success
// };

// saveLaunch(launch)

// launches.set(launch.flightNumber, launch);


const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    console.log('Loading launch data...');
    const response = await axios.post(SPACEX_API_URL,
        {
            query: {},
            options: {
                pagination: false,
                populate: [
                    {
                        path: 'rocket',
                        select: {
                            name: 1
                        }
                    },
                    {
                        path: 'payloads',
                        select: {
                            customers: 1
                        }
                    }
                ]
            }
        }
    );
    if (response.status !== 200) {
        console.log('Error loading launch data');
        throw new Error('Error loading launch data');
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc.payloads;
        const customers = payloads.flatMap(payload => payload.customers);
        const launch = {
            flightNumber: launchDoc.flight_number,
            mission: launchDoc.name,
            rocket: launchDoc.rocket.name,
            launchDate: new Date(launchDoc.date_utc),
            target: launchDoc.name,
            upcoming: launchDoc.upcoming,
            success: launchDoc.success,
            customers
        };
        await saveLaunch(launch);
        //TODO:  populate launches collection...

    }
}

async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat '
    });

    if (firstLaunch) {
        console.log('Launch data already loaded1');
    } else {
        await populateLaunches();
    }
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter)
}


async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber');
    return latestLaunch ? latestLaunch.flightNumber : DEFAULT_FLIGHT_NUMBER;
}

async function getAllLaunches(skip, limit) {
    // return Array.from(launches.values())
    return await launchesDatabase
        .find({}, {
            '_id': 0,
            '__v': 0
        })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit)
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({ flightNumber: launchId })
}

async function abortLaunchById(launchId) {
    // const aborted = launches.get(launchId);
    // aborted.upcoming = false;
    // aborted.success = false;
    // return aborted;
    try {
        const aborted = await launchesDatabase.findOneAndUpdate({
            flightNumber: launchId
        }, {
            upcoming: false,
            success: false
        })
        console.log('Aborted', aborted);

        return aborted;
    } catch (error) {
        console.log(`Could not delete launch: ${error}`);
    }
}

async function saveLaunch(launch) {
    try {
        await launchesDatabase.findOneAndUpdate(
            {
                flightNumber: launch.flightNumber
            },
            launch,
            {
                upsert: true
            });
    } catch (error) {
        console.log(`Could not save launch: ${error}`);
    }
}

async function addNewLaunch(launch) {
    const latestFlightNumber = await getLatestFlightNumber();

    console.log(latestFlightNumber);
    saveLaunch({
        ...launch,
        flightNumber: latestFlightNumber + 1,
        upcoming: true,
        success: true,
        customers: ['ZTM', 'NASA']
    });
    // launches.set(
    //     latestFlightNumber,
    //     Object.assign(launch, {
    //         customers: ['Built by Jay', 'NASA'],
    //         flightNumber: latestFlightNumber,
    //         upcoming: true,
    //         success: true
    //     }))
}

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    addNewLaunch,
    abortLaunchById,
    loadLaunchesData,
}
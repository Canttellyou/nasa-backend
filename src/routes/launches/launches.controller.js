const { getAllLaunches, addNewLaunch, existsLaunchWithId, abortLaunchById } = require("../../models/launches.model");
const { getPagination } = require("../../services/query");
async function httpGetAllLaunches(req, res) {
    const { skip, limit } = getPagination(req.query);
    return res.status(200).json(await getAllLaunches(skip, limit))
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;

    if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({ error: "Missing required field" })
    }
    launch.launchDate = new Date(launch.launchDate)
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({ error: "Invalid launch date" })
    }
    await addNewLaunch(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const id = Number(req.params.id);
    // const launch = getAllLaunches().find(l => l.id === id);
    if (!existsLaunchWithId(id)) {
        return res.status(404).json({ error: "launch not found" });
    }
    // getAllLaunches().splice(getAllLaunches().indexOf(launch), 1);
    const aborted = await abortLaunchById(id);
    if (!aborted) {
        return res.status(400).json({
            error: 'Launch not aborted'
        })
    }
    return res.status(200).json(aborted);
}
module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
}
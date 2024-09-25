const {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require("../../model/launches.model");

const getPagination = require("../../services/query");

async function httpGetLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target)
    return res.status(400).json({
      error: "Missing properties",
    });
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate))
    //isNaN(date) => date.valueOf() => if not a number then invalid
    return res.status(400).json({
      error: "Invalid date",
    });
  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);

  if (!(await existsLaunchWithId(launchId)))
    return res.status(404).json({ error: `No launch with ${id} found` });
  const aborted = await abortLaunchById(launchId);
  if (!aborted) return res.status(400).json({ error: "Launch not aborted" });
  return res.status(200).json({ aborted });
}

module.exports = {
  httpGetLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};

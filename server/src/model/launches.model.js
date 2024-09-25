const axios = require("axios");
const launchesDb = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v5/launches/query";

async function loadLaunch() {
  console.log("Downloading launch data...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},

    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: { name: 1 },
        },
        {
          path: "payloads",
          select: { customers: 1 },
        },
      ],
    },
  });

  if (response.status !== 200)
    throw new Error("There was an error loading data");

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => payload["customers"]);

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
      customers,
    };

    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) console.log("Launch data already loaded!!!");
  else await loadLaunch();
}

async function findLaunch(filter) {
  return await launchesDb.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function getAllLaunches(skip, limit) {
  return await launchesDb
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: -1 })
    .skip(skip)
    .limit(limit);
}

async function getLatestFlightNumber() {
  const latestNumber = await launchesDb.findOne().sort({ flightNumber: -1 });
  if (!latestNumber) return DEFAULT_FLIGHT_NUMBER;
  return latestNumber.flightNumber;
}

async function saveLaunch(planet) {
  await launchesDb.findOneAndUpdate(
    { flightNumber: planet.flightNumber },
    planet,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const isPlanet = await planets.findOne({ keplerName: launch.target });
  if (!isPlanet) throw new Error("No such planet");
  const latestFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    upcoming: true,
    success: true,
    customers: ["ZeroToMastery", "NASA"],
    flightNumber: latestFlightNumber,
  });

  await saveLaunch(newLaunch);
}

/*function addNewLaunch(launch) {
  latestFlightNumber++;
  launches.set(
    latestFlightNumber,
    Object.assign(launch, {
      upcoming: true,
      success: true,
      customers: ["ZTM", "NASA"],
      flightNumber: latestFlightNumber,
    })
  );
}*/

async function abortLaunchById(launchId) {
  // const aborted = launches.get(launchId);
  const aborted = await launchesDb.updateOne(
    { flightNumber: launchId },
    { upcoming: false, success: false }
  );

  return aborted.modifiedCount === 1;
}

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
  loadLaunchData,
};

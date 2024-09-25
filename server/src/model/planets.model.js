const { parse } = require("csv-parse");
const { createReadStream } = require("fs");
const path = require("path");
const planets = require("./planets.mongo");

function isHabitable(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}
function loadPlanets() {
  return new Promise((resolve, reject) =>
    createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitable(data)) {
          // TODO: Replace create with insert+update=upsert to avoid duplicate instances
          // await planets.create({ keplerName: data.kepler_name });
          try {
            await saveData(data);
          } catch (err) {
            console.error(err.message);
          }
        }
      })
      .on("end", async () => {
        const countOfPlanets = await getAllPlanets();
        console.log(`${countOfPlanets.length} habitable planets found`);
        resolve();
      })
      .on("error", (err) => {
        console.error(err.message);
        reject(err);
      })
  );
}

async function getAllPlanets() {
  return await planets.find({}, { keplerName: 1, _id: 0 });
}

async function saveData(planet) {
  await planets.updateOne(
    { keplerName: planet.kepler_name },
    { keplerName: planet.kepler_name },
    { upsert: true }
  );
}

module.exports = { getAllPlanets, loadPlanets };

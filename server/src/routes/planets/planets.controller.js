const { getAllPlanets } = require("../../model/planets.model");

async function httpGetPlanets(req, res) {
  return res.status(200).json(await getAllPlanets());
}

module.exports = { httpGetPlanets };

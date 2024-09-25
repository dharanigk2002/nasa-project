const express = require("express");
const {
  httpGetLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
} = require("./launches.controller");

const launchesRouter = express.Router();

launchesRouter.get("/", httpGetLaunches);

launchesRouter.post("/", httpAddNewLaunch);

launchesRouter.delete("/:id", httpAbortLaunch);

module.exports = launchesRouter;

const http = require("http");
const app = require("./app");
const { mongoConnect } = require("./services/mongo");
const { loadPlanets } = require("./model/planets.model");
const { loadLaunchData } = require("./model/launches.model");
require("dotenv").config();
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);
// mongoose.connection.once("open", () =>
//   console.log("Mongoose connection successful!")
// );
// mongoose.connection.on("error", (err) => console.error(err.message));
async function startServer() {
  mongoConnect();
  await loadPlanets();
  await loadLaunchData();
  server.listen(PORT, () => console.log(`Listening on Port ${PORT}...`));
}

startServer();

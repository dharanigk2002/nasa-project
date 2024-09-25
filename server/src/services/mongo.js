const mongoose = require("mongoose");

require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

function mongoConnect() {
  mongoose
    .connect(MONGO_URL)
    .then(() => console.log("Mongoose connection successful!"))
    .catch((err) => console.error(err.message));
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = { mongoConnect, mongoDisconnect };

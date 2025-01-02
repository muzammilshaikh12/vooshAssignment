const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.mongoDbUrl);
const db = mongoose.connection;
db.on("error", function () {
  console.log("error");
});
db.once("open", function () {
  console.log("mongodb connected successfully");
});

module.exports = mongoose;

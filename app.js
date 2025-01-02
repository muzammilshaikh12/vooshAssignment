const express = require("express");

const app = express();

const bodyParser = require("body-parser");

const cors = require("cors");

const dotenv = require("dotenv");

dotenv.config();

app.use(bodyParser.json({ limit: "50mb" }));

app.use(cors());

require("./database");

const routes = require("./routes/routes");

app.use("/", routes);

app.listen(process.env.port, () => {
  console.log(`Server Runing on port : ${process.env.port}`);
});

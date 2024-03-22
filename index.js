const express = require("express");
require("dotenv").config();
const database = require("./config/database");

// Routes Ver1
const routesVer1 = require("./api/v1/routes/index.route");

database.connect();

const app = express();
const port = process.env.PORT;

// Routes Ver1
routesVer1(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

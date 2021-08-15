/*
    Web server for Weather Vortex project.
    Copyright (C) 2021  Lirussi Igor, Tentoni Daniele, Zandoli Silvia

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const cors = require("./config/cors.config");
const cookieParser = require("cookie-parser");
const express = require("express");
const mongoose = require("mongoose");

const db = require("./config/config").get(process.env.NODE_ENV);

//database connection-> ps: l'ho modificato per tenere nascosto il link al database
mongoose.Promise = global.Promise;
const mongoConnection = mongoose.connect(db.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
mongoConnection
  .then(() => console.log("Database connected"))
  .catch((err) => console.error(err));

const app = express();

cors.configure(app);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({ result: "ok" });
});

const userRoutes = require("./routes/user.routes");
app.use("/users", userRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/api", authRoutes);

const forecastRoutes = require("./routes/forecasts.routes");
app.use("/forecast", forecastRoutes);

const stationRoutes = require("./routes/station.routes");
app.use("/stations", stationRoutes);

const port = process.env.PORT || 12000;

app.listen(port, () => {
  console.log(
    "Weather Vortex  Copyright (C) 2021  Lirussi Igor, Tentoni Daniele, Zandoli Silvia"
  );
  console.log("This program comes with ABSOLUTELY NO WARRANTY\n");

  console.log("Application running on http://localhost:12000\n");

  console.log("Weather Vortex is running those CORS options:", cors.options);
});

// Export app to use it in unit testing.
module.exports = {
  app,
  mongoConnection,
};

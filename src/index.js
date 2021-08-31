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

"use strict";

// Express Application initialization.
const express = require("express");
const app = express();

// Http Server initialization, attaching him Express Application.
const http = require("http");
const server = http.createServer(app);

// Socket.IO initialization, attaching him Http Server.
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } }); // TODO: Change this.

// Database connection-> ps: l'ho modificato per tenere nascosto il link al database
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const mongoConnection = mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
mongoConnection
  .then(() => console.log("Database connected"))
  .catch((err) => console.error(err));

// Cors policies initialization.
const cors = require("./config/cors.config");
cors.configure(app);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configure Cookie parsing from clients.
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({ result: "ok" });
});

const userRoutes = require("./routes/user.routes");
app.use("/users", userRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/api", authRoutes);

const { configRouter } = require("./routes/forecasts.routes");
configRouter(app, io);

const stationRoutes = require("./routes/station.routes");
app.use("/stations", stationRoutes);

const port = process.env.PORT || 12000;

// Since Socket.IO introduction, now we have to listen to server changes, since Express Application would have listened the wrong source instead of the shared instance from http server module from Node.
server.listen(port, () => {
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

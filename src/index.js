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
app.use("/auth", authRoutes);

// This route require a reference to Socker.io to send forecast data.
const { configRouter } = require("./routes/forecasts.routes");
configRouter(app, io);

const stationRoutes = require("./routes/station.routes");
app.use("/stations", stationRoutes);

const feedbacksRoutes = require("./routes/feedbacks.routes");
app.use("/feedbacks", feedbacksRoutes.router);

// Database connection-> ps: l'ho modificato per tenere nascosto il link al database
const { connection } = require("./config/database.connector");
const generation = new Promise((resolve, reject) => {
  connection
    .then(() => {
      console.log("Database connected");
      feedbacksRoutes
        .generateStartupEntities()
        .then(() => resolve("Generated providers without errors"))
        .catch((error) => {
          console.warn(
            `* Warning *: Generate providers error: ${error.message}`
          );
          resolve("Generated providers with warning");
        });
    })
    .catch((err) => reject(err));
});

const port = process.env.PORT || 12000;

// Since Socket.IO introduction, now we have to listen to server changes, since Express Application would have listened the wrong source instead of the shared instance from http server module from Node.
server.listen(port, () => {
  console.log(
    "Weather Vortex  Copyright (C) 2021  Lirussi Igor, Tentoni Daniele, Zandoli Silvia"
  );
  console.log("This program comes with ABSOLUTELY NO WARRANTY\n");

  if (typeof process.env.NODE_ENV === "undefined") {
    console.log("Application running on http://localhost:12000\n");
  }

  console.log("Weather Vortex is running those CORS options:", cors.options);
});

// Export app to use it in unit testing.
module.exports = { app, generation };

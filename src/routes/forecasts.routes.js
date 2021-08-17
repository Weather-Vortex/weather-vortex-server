/*
    Web server for Weather Vortex project.
    Copyright (C) 2021  Tentoni Daniele

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

const express = require("express");

/**
 * Initialize a new Router for forecasts requests. Give a Socket.io Server to use real time notifications.
 * @param {*} io Socket.io server instance.
 * @returns Forecast router configured with io sockets.
 */
const configRouter = (io) => {
  // TODO: Move connection to proper controller.
  io.on("connection", (socket) => {
    // Connection event.
    // TODO: Send to the user his identifier that have to be used with forecast rest api call and for other direct notifications.
    console.log("a user connected with data:", socket);
    // TODO: This socket has to get passed as argument to forecast call to send data back to user when ready.
    socket.on("disconnect", () => {
      // Client disconnect event.
      console.log("user disconnected");
    });
    // TODO: Try to add unit tests with https://socket.io/docs/v4/testing/#Example-with-mocha
  });

  const router = express.Router();
  const { ForecastController } = require("../controllers/forecast.controller");
  const controller = new ForecastController(io);

  router
    .get("/:locality", controller.getThreeDaysForecasts)
    .get("/:locality/current", controller.getCurrentForecasts)
    .get("/:locality/threedays", controller.getThreeDaysForecasts);

  return router;
};

module.exports = { configRouter };

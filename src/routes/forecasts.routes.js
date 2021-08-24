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
 * @param {express.Application} app Express Application to link router with.
 * @param {*} io Socket.io server instance.
 * @returns Forecast router configured with io sockets.
 */
const configRouter = (app, io) => {
  const controller = require("../controllers/forecast.controller");

  io.on("connection", (socket) => {
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
      users.push({
        userID: id,
        locality: socket.locality,
      });
    }
    console.log("User connected:", socket.id);
    io.fetchSockets().then((sockets) =>
      console.log(
        "Current connected:",
        sockets.map((s) => s.id)
      )
    );

    socket.on("current", (arg) => {
      console.log("Received a current forecast request with arg:", arg);
      controller.getCurrentForecastsWithIo(socket, arg.locality);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
      socket.disconnect();
    });
  });

  const router = express.Router();

  router
    .get("/:locality", controller.getThreeDaysForecasts)
    .get("/:locality/current", controller.getCurrentForecasts)
    .get("/:locality/threedays", controller.getThreeDaysForecasts);

  app.use("/forecast", router);
};

module.exports = { configRouter };

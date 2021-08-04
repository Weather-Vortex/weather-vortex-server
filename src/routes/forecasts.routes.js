/*
    Web server for Weather Vortex project.
    Copyright (C) 2021  Daniele Tentoni

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

const express = require("express");
const openWeatherStorage = require("../storages/openweathermap.storage");
const locationStorage = require("../storages/location.storage");
const troposphereStorage = require("../storages/troposhpere.storage");
const storageUtils = require("../storages/storage.utils");

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

  router.get("/:city_name", async (req, res) => {
    // Check if param is valid.
    if (!storageUtils.checkCityNameType(req)) {
      return res.status(400).json({
        error: "Req.params.city_name is not correctly declared.",
        value: req.params.city_name,
      });
    }

    const city_name = req.params.city_name;
    let location = await locationStorage.getLocationDataByCity(city_name);
    if (typeof location.error !== "undefined" && location.error !== null) {
      // Return location error if any.
      return res.status(500).json(location);
    }

    if (Array.isArray(location.data) && location.data.length > 0) {
      // Manage multiple location found.
      // TODO: How can we manage them smarter?
      location = location.data[0];
    }
    if (typeof location.latitude === "undefined") {
      // Return location missing error if empty.
      return res.status(500).json("No latitude for the object");
    }

    // First pending request.
    const openWeatherForecast =
      openWeatherStorage.fourDayForecastByLocationRequest(
        location.latitude,
        location.longitude
      );

    // Second pending request.
    const troposphereForecast =
      troposphereStorage.getSevenDaysForecastByLocationRequest(
        location.latitude,
        location.longitude
      );

    // Wait for all requests.
    const results = await Promise.all([
      openWeatherForecast,
      troposphereForecast,
    ]);

    res.status(200).json({ owm: results[0].data, tro: results[1].data });
  });

  return router;
};

module.exports = { configRouter };

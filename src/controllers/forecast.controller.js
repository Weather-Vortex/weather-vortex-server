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

const openWeatherStorage = require("../storages/openweathermap.storage");
const locationStorage = require("../storages/location.storage");
const troposphereStorage = require("../storages/troposhpere.storage");
const storageUtils = require("../storages/storage.utils");

const getCurrentForecastsWithIo = async (socket, locality) => {
  const providers = ["Open Weather Map", "Troposphere"];
  // TODO: Retrieve IoT Stations.
  socket.emit("forecast_requested", { providers });

  let location;
  try {
    const locations = await locationStorage.getLocationDataByCity(locality);
    location = getLocation(locations);
  } catch (error) {
    console.log("Emitted error %0", error);
    socket.emit("forecast_error", { error, message: error.message, locality });
  }

  try {
    // First pending request.
    openWeatherStorage
      .fourDayForecastByLocationRequest(
        location.position.latitude,
        location.position.longitude
      )
      .then((result) => {
        socket.emit("result", {
          provider: "Open Weather Map",
          data: result.data,
        });
      })
      .catch((error) => {
        socket.emit(
          "forecast_error",
          { provider: "OpenWeatherMap" },
          { error }
        );
      });

    // Second pending request.
    troposphereStorage
      .getSevenDaysForecastByLocationRequest(
        location.position.latitude,
        location.position.longitude
      )
      .then((result) => {
        socket.emit("result", {
          provider: "Troposphere",
          data: result.data,
        });
      })
      .catch((error) => {
        socket.emit("forecast_error", { provider: "Troposphere" }, { error });
      });

    // TODO: Retrieve data from stations.
  } catch (error) {
    console.log("GENERIC ERROR:", error);
    socket.emit("error", error);
  }
};

const getThreeDaysForecastsWithIo = async (socket, locality) => {
  socket.emit("forecast_requested", locality);
  console.log("Received a three days request from a client for:", locality);
};

const getCurrentForecasts = async (req, res) => {
  // Check if param is valid.
  if (!storageUtils.checkCityNameType(req)) {
    return res.status(400).json({
      error: "Req.params.locality is not correctly declared.",
      value: req.params.locality,
    });
  }

  const locality = req.params.locality;
  try {
    const locations = await locationStorage.getLocationDataByCity(locality);
    const location = getLocation(locations);

    // TODO: Add current forecasts.
  } catch (error) {
    // Return location error if any.
    storageUtils.manageAxiosError(error);
    const statusCode = error.statusCode ?? 500;
    return res.status(statusCode).json({ result: false, error, locality });
  }
};

const getThreeDaysForecasts = async (req, res) => {
  // Check if param is valid.
  if (!storageUtils.checkCityNameType(req)) {
    return res.status(400).json({
      error: "Req.params.locality is not correctly declared.",
      value: req.params.locality,
    });
  }

  const locality = req.params.locality;
  try {
    const locations = await locationStorage.getLocationDataByCity(locality);
    const location = getLocation(locations);

    // First pending request.
    const openWeatherForecast =
      openWeatherStorage.fourDayForecastByLocationRequest(
        location.position.latitude,
        location.position.longitude
      );

    // Second pending request.
    const troposphereForecast =
      troposphereStorage.getSevenDaysForecastByLocationRequest(
        location.position.latitude,
        location.position.longitude
      );

    // Wait for all requests.
    const results = await Promise.all([
      openWeatherForecast,
      troposphereForecast,
    ]);

    return res.status(200).json({ owm: results[0].data, tro: results[1].data });
  } catch (error) {
    storageUtils.manageAxiosError(error);
    return res.status(500).json({ result: false, error, locality });
  }
};

/**
 * Retrieve from the array of locations only one of them. May throw errors if location is empty.
 * @param {Array} locations Array of locations from Troposphere API.
 * @returns The selected location.
 */
const getLocation = (location) => {
  if (typeof location !== "object" || !location.result) {
    const error = new LocationError("No locality found with given name");
    error.statusCode = 404;
    throw error;
  }

  /*
  Manage multiple location found:
  https://api.troposphere.io/place/name/Cesenatico?token=<add_token> and https://api.troposphere.io/place/name/Spiaggia,Cesenatico?token=<add_token>
  */

  if (typeof location.location.position.latitude === "undefined") {
    // Throw location missing error if empty.
    const error = new LocationError("No latitude for the location object");
    error.statusCode = 500;
    throw error;
  }
  if (typeof location.location.position.longitude === "undefined") {
    // Throw location missing error if empty.
    const error = new LocationError("No longitude for the location object");
    error.statusCode = 500;
    throw error;
  }

  return location.location;
};

class LocationError extends Error {
  constructor(message) {
    super(message);
  }
}

module.exports = {
  getCurrentForecasts,
  getCurrentForecastsWithIo,
  getThreeDaysForecasts,
  getThreeDaysForecastsWithIo,
};

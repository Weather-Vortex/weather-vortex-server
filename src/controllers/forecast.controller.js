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

class ForecastController {
  /**
   * Create a new Forecast Controller with a Socket.IO server instance.
   * @param {IO} io Socket.IO server instance.
   */
  constructor(io) {
    // Socket.IO server instance.
    this.io = io;
  }

  #privateFun() {
    console.log("Private");
  }

  async getCurrentForecasts(req, res) {
    this.#privateFun();
    // Check if param is valid.
    if (!storageUtils.checkCityNameType(req)) {
      return res.status(400).json({
        error: "Req.params.locality is not correctly declared.",
        value: req.params.locality,
      });
    }

    const locality = req.params.locality;
    try {
      let location = await locationStorage.getLocationDataByCity(locality);

      if (Array.isArray(location.data) && location.data.length > 0) {
        // Manage multiple location found.
        // TODO: How can we manage them smarter?
        location = location.data[0];
      }
      if (typeof location.position.latitude === "undefined") {
        // Return location missing error if empty.
        return res.status(500).json("No latitude for the object");
      }
      if (typeof location.position.longitude === "undefined") {
        // Return location missing error if empty.
        return res.status(500).json("No longitude for the object");
      }

      // TODO: Add current forecasts.
    } catch (error) {
      // Return location error if any.
      storageUtils.manageAxiosError(error);
      return res.status(500).json({ result: false, error, locality });
    }
  }

  async getThreeDaysForecasts(req, res) {
    // Check if param is valid.
    if (!storageUtils.checkCityNameType(req)) {
      return res.status(400).json({
        error: "Req.params.locality is not correctly declared.",
        value: req.params.locality,
      });
    }

    const locality = req.params.locality;
    try {
      let location = await locationStorage.getLocationDataByCity(locality);

      if (Array.isArray(location.data) && location.data.length > 0) {
        // Manage multiple location found.
        // TODO: How can we manage them smarter?
        location = location.data[0];
      }
      if (typeof location.position.latitude === "undefined") {
        // Return location missing error if empty.
        return res.status(500).json("No latitude for the object");
      }
      if (typeof location.position.longitude === "undefined") {
        // Return location missing error if empty.
        return res.status(500).json("No longitude for the object");
      }

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

      return res
        .status(200)
        .json({ owm: results[0].data, tro: results[1].data });
    } catch (error) {
      storageUtils.manageAxiosError(error);
      return res.status(500).json({ result: false, error, locality });
    }
  }
}

module.exports = {
  ForecastController,
};

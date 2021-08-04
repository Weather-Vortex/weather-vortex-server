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
  const results = await Promise.all([openWeatherForecast, troposphereForecast]);

  res.status(200).json({ owm: results[0].data, tro: results[1].data });
});

module.exports = router;
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

const nodemailer = require("../config/nodemailer.config");
const openWeatherStorage = require("../storages/openweathermap.storage");
const locationStorage = require("../storages/location.storage");
const troposphereStorage = require("../storages/troposhpere.storage");
const storageUtils = require("../storages/storage.utils");
const stationStorage = require("../storages/station.storage");
const { StationProvider } = require("../storages/stationProvider.storage");
const usersStorage = require("../storages/user.storage");

const { providerNames } = require("../models/provider.model");

const getCurrentGeolocationForecastWithIo = async (
  socket,
  latitude,
  longitude
) => {
  socket.emit("forecast_requested", { providerNames });
  emitCurrentForecasts(latitude, longitude, null, socket);
};

const getCurrentForecastsWithIo = async (socket, locality) => {
  // Fetch stations by location to query after.
  const stations = await stationStorage.getStations({
    position: { locality },
  });
  const stationNames = stations.map((m) => m.name);
  const providers = stationNames.concat(providerNames);
  // Send all providers and stations.
  socket.emit("forecast_requested", { providers });

  // Fetch for the location to forecast.
  let location;
  try {
    const locations = await locationStorage.getLocationDataByCity(locality);
    location = getLocation(locations);
  } catch (error) {
    console.log("Emitted error %o", error);
    socket.emit("forecast_error", { error, message: error.message, locality });
    return;
  }

  const latitude = location.position.latitude;
  const longitude = location.position.longitude;
  emitCurrentForecasts(latitude, longitude, stations, socket);
};

const getThreeDaysGeolocationForecastWithIo = async (
  socket,
  latitude,
  longitude
) => {
  socket.emit("forecast_requested", { providerNames });
  emitThreeDaysForecasts(latitude, longitude, socket);
};

const getThreeDaysForecastsWithIo = async (socket, locality) => {
  socket.emit("forecast_requested", { providerNames });

  let location;
  try {
    const locations = await locationStorage.getLocationDataByCity(locality);
    location = getLocation(locations);
  } catch (error) {
    console.log("Emitted error %o", error);
    socket.emit("forecast_error", { error, message: error.message, locality });
    return;
  }

  const latitude = location.position.latitude;
  const longitude = location.position.longitude;
  emitThreeDaysForecasts(latitude, longitude, socket);
};

const emitThreeDaysForecasts = async (latitude, longitude, socket) => {
  try {
    // First pending request.
    openWeatherStorage
      .moreDayByLocation(latitude, longitude)
      .then((result) => {
        socket.emit("result", {
          provider: "Open Weather Map",
          data: result,
        });
      })
      .catch((error) => {
        console.log("Open Weather Map socket error:", error);
        socket.emit(
          "forecast_error",
          { provider: "OpenWeatherMap" },
          { error }
        );
      });

    // Second pending request.
    troposphereStorage
      .moreDayByLocation(latitude, longitude)
      .then((result) => {
        socket.emit("result", {
          provider: "Troposphere",
          data: result,
        });
      })
      .catch((error) => {
        console.error("Troposphere socket error:", error);
        socket.emit("forecast_error", { provider: "Troposphere" }, { error });
      });
  } catch (error) {
    console.log("GENERIC ERROR:", error);
    socket.emit("error", error);
  }
};

const emitCurrentForecasts = async (latitude, longitude, stations, socket) => {
  // Let's Forecast!
  try {
    // First pending request.
    openWeatherStorage
      .currentByLocation(latitude, longitude)
      .then((result) => {
        socket.emit("result", {
          provider: "Open Weather Map",
          data: result,
        });
      })
      .catch((error) => {
        console.log("Open Weather Map socket error:", error);
        socket.emit(
          "forecast_error",
          { provider: "Open Weather Map" },
          { error }
        );
      });

    // Second pending request.
    troposphereStorage
      .currentByLocation(latitude, longitude)
      .then((result) => {
        socket.emit("result", {
          provider: "Troposphere",
          data: result,
        });
      })
      .catch((error) => {
        console.error("Troposphere socket error:", error);
        socket.emit("forecast_error", { provider: "Troposphere" }, { error });
      });

    if (!stations) {
      // If there's no stations, return here.
      return;
    }

    // Stations pending requests.
    stations.map((s) => {
      const provider = new StationProvider(s.url, s.authKey, s.name);
      provider
        .current()
        .then((t) =>
          socket.emit("result", {
            provider: s.name,
            data: t,
          })
        )
        .catch((error) => {
          console.log(`Station ${s.name} error: ${error}`);
          socket.emit("forecast_error", { provider: s.name }, { error });
        });
    });
  } catch (error) {
    console.log("GENERIC ERROR:", error);
    socket.emit("error", error);
  }
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
    const promises = await currentByLocation(locality);
    const results = await Promise.all(promises);
    return res.status(200).json({ owm: results[0], tro: results[1] });
  } catch (error) {
    storageUtils.manageAxiosError(error);
    return res.status(500).json({ result: false, error, locality });
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
  let location;
  try {
    const locations = await locationStorage.getLocationDataByCity(locality);
    location = getLocation(locations);
  } catch (error) {
    return res.status(500).json({ result: false, error, locality });
  }
  try {
    // First pending request.
    const openWeatherForecast = openWeatherStorage
      .moreDayByLocation(
        location.position.latitude,
        location.position.longitude
      )
      .then((res) => ({ provider: "Open Weather Map", forecast: res }));

    // Second pending request.
    const troposphereForecast = troposphereStorage
      .moreDayByLocation(
        location.position.latitude,
        location.position.longitude
      )
      .then((res) => ({ provider: "Troposphere", forecast: res }));

    // Wait for all requests.
    const results = await Promise.all([
      openWeatherForecast,
      troposphereForecast,
    ]);

    return res.status(200).json({ owm: results[0], tro: results[1] });
  } catch (error) {
    // storageUtils.manageAxiosError(error);
    return res.status(500).json({ result: false, error, locality });
  }
};

const getThreeDaysGeolocationForecast = async (req, res) => {
  const { latitude, longitude } = req.params;
  try {
    const promises = threeDaysByPosition(latitude, longitude);
    const results = await Promise.all(promises);
    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ results: null, error });
  }
};

const getCurrentGeolocationForecast = async (req, res) => {
  const { latitude, longitude } = req.params;
  try {
    const promises = await currentByPosition(latitude, longitude, null);
    const results = await Promise.all(promises);
    return res.status(200).json({ results });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ results: null, error });
  }
};

const getLocationsFromUsers = (users) =>
  users
    .map((user) => user.preferred)
    .filter((preferred) =>
      preferred.location ||
      (preferred.position && preferred.position.x && preferred.position.y)
        ? true
        : false
    );

const equalsPreferred = (first, second) => {
  if (!first || !second) {
    return false;
  }

  if (
    (first.location && !second.location) ||
    (!first.location && second.location)
  ) {
    return false;
  }

  if (first.location !== second.location) {
    return false;
  }

  if (
    (first.position && !second.position) ||
    (!first.position && second.position)
  ) {
    return false;
  }

  if (
    (first.position.x && !second.position.x) ||
    (first.position.y && !second.position.y) ||
    (!first.position.x && second.position.x) ||
    (!first.position.y && second.position.x)
  ) {
    return false;
  }

  return (
    first.position.x === second.position.y &&
    first.position.y === second.position.y
  );
};

const reduceLocations = (locations) =>
  locations.reduce((prev, curr) => {
    if (!Array.isArray(prev)) {
      console.log("Prev is not an array", prev, [curr]);
      return [curr];
    }

    if (prev.length === 0) {
      return [curr];
    }

    if (prev.some((elem) => equalsPreferred(elem, curr))) {
      console.log("Prev include curr", prev, curr);
      return prev;
    }

    return [curr, ...prev];
  }, new Array());

const makeQueries = (counts) =>
  counts.map((preferred) => {
    let forecasts = null;
    if (preferred.location) {
      forecasts = currentByLocation(preferred.location);
    } else if (preferred.position) {
      const latitude = preferred.position.x;
      const longitude = preferred.position.y;
      forecasts = currentByPosition(latitude, longitude, stations);
    }
    // Those are not arrays?
    return { preferred, forecasts };
  });

const pairUserQueries = (users, queries) =>
  users.map((user) => {
    const related = queries.find((query) => {
      return equalsPreferred(user.preferred, query.preferred);
    });
    const sum = { user, forecasts: related.forecasts };
    return new Promise(async (resolve) => {
      console.log("Forecasts:", sum.forecasts);
      const prepared = await sum.forecasts;
      const results = Array.isArray(prepared)
        ? await Promise.all(prepared)
        : await prepared;
      resolve({ user, forecasts: results });
    });
  });

const notify = async (req, res) => {
  /*
   * Send a response as soon as possible before start to notify (long running process).
   */
  res.status(200).json({ result: "ok", message: "Request accepted." });

  const users = await usersStorage.getUsersWithPreferred();
  if (!users) {
    console.log("No users have to be notified.");
    return;
  }

  // Reduce locations.
  try {
    const locations = getLocationsFromUsers(users);
    const counts = reduceLocations(locations);
    const queries = makeQueries(counts);
    const usersQueries = pairUserQueries(users, queries);
    console.log("Users queries", usersQueries);
  } catch (error) {
    console.error("Error during fetching forecasts:", error);
    return;
  }

  try {
    const afterQueries = await Promise.all(usersQueries);
    afterQueries.map((after) =>
      nodemailer.sendWeatherEmail(after.user.email, after.user, after.forecasts)
    );
  } catch (error) {
    console.error("Error while notification email", error);
  }
};

const threeDaysByPosition = (latitude, longitude) => {
  // First pending request.
  const openWeatherMapForecast = openWeatherStorage
    .moreDayByLocation(latitude, longitude)
    .then((res) => ({ provider: "Open Weather Map", forecast: res }));

  // Second pending request.
  const troposphereForecast = troposphereStorage
    .moreDayByLocation(latitude, longitude)
    .then((res) => ({ provider: "Troposphere", forecast: res }));
  const promises = [openWeatherMapForecast, troposphereForecast];
  return promises;
};

/**
 * Get current forecast by a given position.
 * @param {Number} latitude Position latitude.
 * @param {Number} longitude Position longitude.
 * @param {Array<Station>} stations Array of selected stations.
 * @returns {Array<Promise<Forecast>>} Array of forecast Promises.
 */
const currentByPosition = (latitude, longitude, stations) => {
  const owmForecast = openWeatherStorage
    .currentByLocation(latitude, longitude)
    .then((res) => ({ provider: "Open Weather Map", forecast: res }))
    .catch((err) => ({ provider: "Open Weather Map", error: err }));
  const troForecast = troposphereStorage
    .currentByLocation(latitude, longitude)
    .then((res) => ({ provider: "Troposphere", forecast: res }))
    .catch((err) => ({ provider: "Troposphere", error: err }));
  let stationForecasts = null;
  if (stations) {
    stationForecasts = stations.map((s) =>
      new StationProvider(s.url, s.authKey, s.name)
        .current()
        .then((res) => ({ provider: s.name, forecast: res }))
        .catch((err) => ({ provider: s.name, error: err }))
    );
  }
  const promises = [owmForecast, troForecast].concat(stationForecasts);
  return promises;
};

/**
 * Get current forecast by a given location.
 * @param {String} location Location string
 * @returns {Promise<any>[]} List of Forecast Promises.
 */
const currentByLocation = async (location) => {
  // Fetch stations by location to query after.
  const stations = await stationStorage.getStations({
    position: { locality: location },
  });

  let position;
  try {
    const locations = await locationStorage.getLocationDataByCity(location);
    position = getLocation(locations);
  } catch (error) {
    // Return location error if any.
    // storageUtils.manageAxiosError(error);
    // On Node 14.x we can use const statusCode = error.statusCode ?? 500;
    let statusCode;
    if (error == null || error.statusCode == null) {
      statusCode = 500;
    } else {
      statusCode = error.statusCode;
    }
    return res
      .status(statusCode)
      .json({ result: false, error, locality: location });
  }
  const latitude = position.position.latitude;
  const longitude = position.position.longitude;
  const promises = currentByPosition(latitude, longitude, stations);
  return promises;
};

/**
 * Retrieve from the array of locations only one of them. May throw errors if location is empty.
 * @param {Array} locations Array of locations from Troposphere API.
 * @returns The selected location.
 */
const getLocation = (location) => {
  if (typeof location !== "object" || location === null) {
    const error = new LocationError(
      location,
      "No locality found with given name"
    );
    error.message;
    error.statusCode = 404;
    throw error;
  }

  /*
  Manage multiple location found:
  https://api.troposphere.io/place/name/Cesenatico?token=<add_token> and https://api.troposphere.io/place/name/Spiaggia,Cesenatico?token=<add_token>
  */

  if (typeof location.position.latitude === "undefined") {
    // Throw location missing error if empty.
    const error = new LocationError("No latitude for the location object");
    error.statusCode = 500;
    throw error;
  }
  if (typeof location.position.longitude === "undefined") {
    // Throw location missing error if empty.
    const error = new LocationError("No longitude for the location object");
    error.statusCode = 500;
    throw error;
  }

  return location;
};

class LocationError extends Error {
  constructor(location, message) {
    super(message);
    this.location = location;
    this.name = "Location Error";
  }
}

module.exports = {
  getCurrentForecasts,
  getCurrentForecastsWithIo,
  getThreeDaysForecasts,
  getThreeDaysForecastsWithIo,
  getThreeDaysGeolocationForecastWithIo,
  getCurrentGeolocationForecastWithIo,
  getThreeDaysGeolocationForecast,
  getCurrentGeolocationForecast,
  notify,
};

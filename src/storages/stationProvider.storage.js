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

/**
 * Station provider module.
 * Provide the class to manage a remote station provider.
 * @author Tentoni Daniele <daniele.tentoni.1996@gmail.com>
 * @module stationProvider.storage
 */

"use strict";

const { WeatherProvider, ApiKey } = require("./weatherProvider");

class ForecastError extends Error {
  constructor(message, forecast) {
    super(message);
    this.name = "ForecastError";
    this.forecast = forecast;
  }
}

/**
 * Weather provider for Iot Stations.
 * @extends WeatherProvider
 */
class StationProvider extends WeatherProvider {
  /**
   * Create a new station provider.
   * @param {String} base_url Base url for station server.
   * @param {String} api_key Authentication key configured in the station server (https://github.com/Weather-Vortex/iot-weather).
   * @param {String} name Station name
   */
  constructor(base_url, api_key, name) {
    const key = new ApiKey("authkey", api_key);
    super(base_url, key);
    this.name = name;
  }

  /**
   * Map each forecast value to well formatted fields for vortex.
   * @param {Object} forecast Forecasts from provider.
   * @returns Formatted forecasts.
   */
  mapFields = (forecast) => {
    if (
      !forecast.hasOwnProperty("time") ||
      typeof forecast.time === "undefined"
    ) {
      const msg = "[Error] received corrupted package from a station.";
      const error = new ForecastError(msg, forecast);
      throw error;
    }

    if (typeof forecast.time === "string") {
      forecast.time = new Date(forecast.time);
    }

    return {
      time: forecast.time.toISOString(),
      temp: forecast.temp, // Temperature. Unit Default: Kelvin
      tempMin: forecast.tempMin,
      tempMax: forecast.tempMax,
      pressure: forecast.pressure, // Atmospheric pressure on the sea level by default, hPa
      humidity: forecast.humidity, // Humidity, %
      weatherIcon: forecast.weatherIcon,
      weatherDescription: forecast.weatherDescription,
      clouds: forecast.clouds, // Cloudiness, %
      /*
        Rain
        * 1h: Rain volume for last hour, mm
      */
      rain: forecast.rain,
      snow: forecast.snow,
    };
  };

  /**
   * Gets the current weather conditions from station provider.
   * @returns Forecast "vortex" formatted.
   */
  current = () =>
    this.makeRequest("current").then((result) =>
      this.mapFields(result.data.data)
    );
}

module.exports = { StationProvider, ForecastError };

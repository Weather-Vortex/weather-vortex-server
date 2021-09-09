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

"use strict";

const { WeatherProvider } = require("./weatherProvider");

class StationProvider extends WeatherProvider {
  /**
   * Create a new station provider.
   * @param {String} base_url Base url for station server.
   * @param {String} api_key Authentication key configured in the station server (https://github.com/Weather-Vortex/iot-weather).
   * @param {String} name Station name
   */
  constructor(base_url, api_key, name) {
    super(base_url, `authkey=${api_key}`);
    this.name = name;
  }

  mapFields = (forecast) => {
    if (!forecast.time) {
      forecast.time = new Date();
    }
    return {
      time: forecast.time.toISOString(), // Temperature. Unit Default: Kelvin
      temp: forecast.temp,
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

  current = () =>
    this.makeRequest(`current`).then((result) =>
      this.mapFields(result.data.data)
    );
}

module.exports = { StationProvider };

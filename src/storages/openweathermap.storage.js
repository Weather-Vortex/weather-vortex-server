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

const base_url = "https://api.openweathermap.org/data/2.5/forecast?";
const api_key = "095e72fe0e443261be9fa4aeb5248a57"; // TODO: Read from env

const { WeatherProvider } = require("./weatherProvider");

class OpenWeatherMapProvider extends WeatherProvider {
  constructor(base_url, api_key) {
    super(base_url, api_key);
    this.name = "OpenWeatherMap Provider";
  }

  formatUrl(data) {
    return `${this.base_url}${data}&appid=${this.api_key}`;
  }
}

const provider = new OpenWeatherMapProvider(base_url, api_key);

/**
 * Retrieve weather forecasts for given city.
 * @param {String} city_name City Name for weather forecasts.
 * @returns {Promise<any>} Weather Forecast Promise.
 */
const fourDayForecastByCityRequest = (city_name) => {
  const url = provider.formatUrl(`q=${city_name}`);
  return provider.fourDayForecastRequest(url);
};

/**
 * Return request promise for forecast for given position.
 * @param {Number} latitude Latitude of the position.
 * @param {Number} longitude Longitude of the position.
 * @returns {Promise<any>} Weather Forecast Promise.
 */
const fourDayForecastByLocationRequest = (latitude, longitude) => {
  const url = provider.formatUrl(`lat=${latitude}&lon=${longitude}`);
  return provider.fourDayForecastRequest(url);
};

module.exports = {
  fourDayForecastByCity,
  fourDayForecastByCityRequest,
  fourDayForecastByLocation,
  fourDayForecastByLocationRequest,
};

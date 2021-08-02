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

const axios = require("axios");
const base_url = "https://api.openweathermap.org/data/2.5/forecast?";
const api_key = "095e72fe0e443261be9fa4aeb5248a57"; // TODO: Read from env

/**
 * Retrieve weather forecasts for given city.
 * @param {String} city_name City Name for weather forecasts.
 * @returns {Object} Weather Forecast.
 */
const fourDayForecastByCity = async (city_name) => {
  const url = format_url(`q=${city_name}`);
  return await fourDayForecast(url);
};

/**
 * Retrieve weather forecasts for given position.
 * @param {Number} latitude Latitude of the position.
 * @param {Number} longitude Longitude of the position.
 * @returns Weather Forecast.
 */
const fourDayForecastByLocation = async (latitude, longitude) => {
  const url = format_url(`lat=${latitude}&lon=${longitude}`);
  return await fourDayForecast(url);
};

const fourDayForecast = async (url) => {
  try {
    const response = await axios.get(url);
    const data = response.data;
    return data;
  } catch (error) {
    if (error.isAxiosError) {
      console.error("Error in axios call:\nHost:%s", error.host);
      console.error(
        "Response:\nStatus: %d\nData:%s",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("Error not handled", error);
    }
    return undefined;
  }
};

const format_url = (data) => `${base_url}${data}&appid=${api_key}`;

module.exports = {
  fourDayForecastByCity,
  fourDayForecastByLocation,
};

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

/**
 * Retreive weather forecasts for given city.
 * @param {String} city_name City Name for weather forecasts.
 * @returns {Object} Weather Forecast.
 */
const fourDayForecastByCity = async (city_name) => {
  console.log("Required data for %s", city_name);
  // TODO: Read from env
  const url =
    "https://api.openweathermap.org/data/2.5/forecast?q=Rome,Italy&appid=095e72fe0e443261be9fa4aeb5248a57";
  try {
    const response = await axios.get(url);
    const data = response.data;
    console.log("Response:", data);
    return data;
  } catch (error) {
    console.error("Error in axios call", error);
  }
};

module.exports = {
  fourDayForecastByCity,
};

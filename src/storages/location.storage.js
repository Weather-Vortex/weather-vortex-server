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
const troposphere_base_url = "https://api.troposphere.io";
const troposphere_api_key =
  "02a505c1a967cd777252ff263bdf78c9fb80de6d9703bae9f3"; // TODO: Read from env

/**
 * Get the location data of a city by its name.
 * @param {string} city_name Name of the city to get location of.
 * @returns Location data.
 */
const getLocationDataByCity = async (city_name) => {
  const url = `${troposphere_base_url}/place/name/${city_name}?token=${troposphere_api_key}`;
  try {
    const { data } = await axios.get(url);

    // Return an error if data doesn't contains.
    if (data.error === null && data.data === null) {
      return { error: "No location found" };
    }

    return data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
    }

    return undefined;
  }
};

module.exports = {
  getLocationDataByCity,
};
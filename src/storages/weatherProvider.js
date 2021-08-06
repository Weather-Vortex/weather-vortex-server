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
const utils = require("./storage.utils");

/**
 * Base class for any Weather Provider.
 * @param {String} base_url Base url of the service.
 * @param {String} api_key Api Key of the service.
 */
class WeatherProvider {
  /**
   * Initialize the Weather Provider with some common data.
   * @param {String} base_url Base url of the service.
   * @param {String} api_key Api Key of the service.
   */
  constructor(base_url, api_key) {
    this.name = "Base Weather Provider";
    this.base_url = base_url;
    this.api_key = api_key;
  }

  formatUrl(data) {
    if (typeof data === "undefined") {
      throw new TypeError("Type must be defined and a string");
    }

    return data;
  }

  /**
   * Get a resource from an url with Axios.
   * @param {String} url Url to get with Axios.
   * @returns {Promise<any>} Axios promise.
   */
  makeRequest = (url) => {
    try {
      // Return the real Promise from Axios.
      const data_url = this.formatUrl(url);
      return axios.get(url);
    } catch (error) {
      utils.manageAxiosError(error);
      // Return a rejected Promise.
      return new Promise.reject("Error in axios call");
    }
  };
}

module.exports = {
  WeatherProvider,
};

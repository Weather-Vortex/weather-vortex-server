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
 */
class WeatherProvider {
  /**
   * Initialize the Weather Provider with some common data.
   * @param {String} base_url Base url of the service.
   * @param {String} api_key_part Api Key Url Part of the service.
   */
  constructor(base_url, api_key_part) {
    this.name = "Base Weather Provider";
    this.base_url = base_url;
    this.api_key_part = api_key_part;
  }

  /**
   * Compose an url with a resource properly.
   * @param {String} resource Resource to compose.
   * @returns Url composed.
   */
  formatUrl = (resource) => {
    if (typeof resource !== "string") {
      throw new TypeError(
        "Weather Provider: param resource have to be a string."
      );
    }

    let tmp;
    if (this.base_url.endsWith("/") && resource.startsWith("/")) {
      tmp = this.base_url.substr(0, this.base_url.length - 1).concat(resource);
    } else if (
      (this.base_url.endsWith("/") && !resource.startsWith("/")) ||
      (!this.base_url.endsWith("/") && resource.startsWith("/"))
    ) {
      tmp = this.base_url.concat(resource);
    } else if (!this.base_url.endsWith("/") && !resource.startsWith("/")) {
      tmp = `${this.base_url}/${resource}`;
    }

    if (!tmp.includes("?")) {
      tmp = tmp.concat("?");
    }

    return tmp.concat(this.api_key_part);
  };

  /**
   * Get a resource from an url with Axios.
   * @param {String} url Url to get with Axios.
   * @returns {Promise<any>} Axios promise.
   */
  makeRequest = (resource) => {
    // Format url. Let error flow up to inherited provider.
    const data_url = this.formatUrl(resource);

    try {
      // Return the real Promise from Axios.
      return axios.get(data_url);
    } catch (error) {
      console.log("Errrrrrr");
      utils.manageAxiosError(error);
      let data = {};
      if (error && error.response && error.response.data) {
        data = error.response.data;
      } else {
        data.error = "Error in axios call";
        data.data = { url };
      }
      const err = new Error("Error in axios call");
      err.message = message;
      err.internalError = error;
      err.data = data;
      // Return a rejected Promise.
      throw err;
    }
  };
}

module.exports = {
  WeatherProvider,
};

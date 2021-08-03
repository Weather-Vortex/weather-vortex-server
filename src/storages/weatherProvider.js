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
  constructor(base_url, api_key) {
    this.name = "Base Weather Provider";
    this.base_url = base_url;
    this.api_key = api_key;
  }

  /**
   * Get the four day forecast from the current provider.
   * @deprecated Since version 0.2, use request method instead for Promise use.
   * @param {String} url Well formed url.
   * @returns Forecast result.
   */
  fourDayForecast = async (url) => {
    try {
      const { data } = await this.fourDayForecastRequest(url);
      return data;
    } catch (error) {
      console.error(
        "Error in axios call for %s:\nHost:%s",
        this.name,
        error.host
      );
      utils.manageAxiosError(error);
      return undefined;
    }
  };

  /**
   * Get a resource from an url with Axios.
   * @param {String} url Url to get with Axios.
   * @returns {Promise<any>} Axios promise.
   */
  fourDayForecastRequest = (url) => {
    try {
      // Return the real Promise from Axios.
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

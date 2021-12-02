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

// This is a curated list of valid protocols to use for common use weather providers.
const validProtocols = ["http:", "https:"];

/**
 * Convert a given string to a valid url for weather providing.
 *
 * This is a list of valid protocols:
 * - http;
 * - https;
 *
 * Any other protocol will be rejected at the moment.
 *
 * @param {String} urlString string to convert to url.
 * @returns {URL} converted url.
 */
const validateUrl = (urlString) => {
  const myUrl = new URL(urlString);
  /*
  if (!myUrl) {
    throw new TypeError(
      `${this.name}: param ${urlString} has to be convertible to URL node object.`
    );
  }
  */

  // List of accepted protocols.
  if (!validProtocols.includes(myUrl.protocol)) {
    throw new Error(
      `${this.name}: param ${urlString} doesn't contains a valid protocol (${myUrl.protocol}). Value admitted are ${validProtocols}`
    );
  }

  // At the end of validation, return the right url.
  return myUrl;
};

/**
 * ApiKey class.
 */
class ApiKey {
  name = "";
  value = "";
}

/**
 * Base class for any Weather Provider.
 */
class WeatherProvider {
  /**
   * Initialize the Weather Provider with some common data.
   * @param {String} base_url Base url of the service.
   * @param {String | ApiKey} api_key_part Api Key Url Part of the service or Api Key of the service.
   * @deprecated In a future version, this constructor will use only ApiKey parameter type.
   */
  constructor(base_url, api_key_part) {
    this.name = "Base Weather Provider";

    if (typeof api_key_part === "string") {
      // This is the behavior that is going to be removed.
      this.api_key_part = api_key_part;
      this.api_key = new ApiKey();
      this.api_key.name = "key";
      this.api_key.value = api_key_part;
    } else if (
      typeof api_key_part === "object" &&
      typeof api_key_part.name === "string" &&
      typeof api_key_part.value === "string"
    ) {
      this.api_key = api_key_part;
    }
    this.base_url = base_url;

    // Move to use URL object instead row string.
    const new_url = validateUrl(base_url);
    this.internal_url = new_url;
  }

  /**
   * Compose an url with a resource properly concat to internal url.
   * @param {String} resource Resource to compose.
   * @returns {String} Url composed.
   */
  formatUrl = (resource) => {
    if (!resource || typeof resource !== "string") {
      throw new TypeError(
        "Weather Provider: param resource have to be a string."
      );
    }

    const tmp = new URL(resource, this.internal_url);
    tmp.searchParams.set("api_key", this.api_key_part);
    return tmp.toString();
  };

  /**
   * Get a resource from an url with Axios.
   * @param {String} url Url to get with Axios.
   * @returns {Promise<any>} Axios promise.
   */
  makeRequest = (resource) => {
    // Format url. Let error flow up to inherited provider.
    const data_url = this.formatUrl(resource);

    // Return the real Promise from Axios.
    return axios.get(data_url);
  };
}

module.exports = {
  validProtocols,
  WeatherProvider,
};

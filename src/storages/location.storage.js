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
const Location = require("../models/location.model");
const troposphere_base_url = "https://api.troposphere.io";
const troposphere_api_key =
  "02a505c1a967cd777252ff263bdf78c9fb80de6d9703bae9f3"; // TODO: Read from env

/**
 * Get the location data of a city by its name.
 * @param {string} city_name Name of the city to get location of.
 * @returns Location data.
 */
const getLocationDataByCity = async (city_name) => {
  try {
    // First search in local cache.
    const cached = await getCachedLocationByName(city_name);
    return cached;
  } catch (error) {
    try {
      // After ask to Troposphere service.
      const result = await getRemoteLocationByName(city_name);
      // Then add to local cache.
      const added = await addCachedLocation(
        city_name,
        result.data.latitude,
        result.data.longitude
      );
      // Then return the cached result.
      return added;
    } catch (error) {
      console.error("Thrown error by getLocation:", error);
      return error;
    }
  }
};

/**
 * Find a Location given its name.
 * @param {String} locationName Name of the Location.
 * @returns Cached location if present.
 */
const getCachedLocationByName = async (locationName) => {
  try {
    const result = await Location.findOne({ name: locationName }).exec();
    return { result: true, locationName, location: result };
  } catch (error) {
    return { result: false, error: err, message: "Location not found" };
  }
};

/**
 * Add a Location to the collection of cached locations.
 * @param {String} name Name of location.
 * @param {Number} latitude Latitude of location.
 * @param {Number} longitude Longitude of location.
 * @returns Added location or error message.
 */
const addCachedLocation = async (name, latitude, longitude) => {
  const location = new Location({
    name,
    latitude,
    longitude,
  });
  try {
    const added = await location.save().exec();
    return { result: true, added };
  } catch (error) {
    const message = "Error in mongoose location insert.";
    return { result: false, error, message, location };
  }
};

/**
 * Find a Location from Troposphere service.
 * @param {String} locationName Name of the Location.
 * @returns Location result from API call.
 */
const getRemoteLocationByName = async (locationName) => {
  const url = `${troposphere_base_url}/place/name/${locationName}?token=${troposphere_api_key}`;
  try {
    const { data } = await axios.get(url);

    // Return data if are correct.
    if (checkResponse(data)) {
      return data;
    }

    const message = "No location found";
    return { error: 404, message, locationName };
  } catch (error) {
    utils.manageAxiosError(error);
    return undefined;
  }
};

/**
 * Check if a Response from Axios is valid or not.
 * @param {axios.AxiosResponse} data Response from a previous call.
 * @returns True if is valid, false anywhere.
 */
const checkResponse = (data) =>
  data.error !== null &&
  typeof data.data === "object" &&
  data.data.length !== 0;

module.exports = {
  getLocationDataByCity,
};

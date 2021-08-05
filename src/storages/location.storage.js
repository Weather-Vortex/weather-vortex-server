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
    let cached = await getCachedLocationByName(city_name);
    if (cached.result === false) {
      // Then in remote service.
      cached = await fetchLocationByName(city_name);
    }

    return cached;
  } catch (error) {
    // At this time, don't resolve error here, but throw it up.
    throw error;
  }
};

/**
 * Fetch the location data from a remote source and cache them.
 * @param {String} locationName Name of the Location.
 * @returns Location data.
 */
const fetchLocationByName = async (locationName) => {
  try {
    // After ask to Troposphere service.
    const result = await getRemoteLocationByName(locationName);
    // Then add to local cache.
    const added = await addCachedLocation(
      result.name,
      result.latitude,
      result.longitude
    );

    // Then return the cached result.
    return added;
  } catch (error) {
    // At this time, don't resolve error here, but throw it up.
    throw error;
  }
};

/**
 * Find a Location given its name.
 * @param {String} locationName Name of the Location.
 * @returns Cached location if present.
 */
const getCachedLocationByName = async (locationName) => {
  try {
    const found = await Location.findOne({ name: locationName }).exec();
    return { result: found !== null, locationName, location: found };
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
    position: {
      latitude,
      longitude,
    },
  });

  try {
    const added = await location.save();
    return { result: true, added };
  } catch (error) {
    const message = "Error in mongoose location insert.";
    // TODO: Generate error to throw with this.
    throw new Error(message);
  }
};

/**
 * Find a Location from Troposphere service.
 * @param {String} locationName Name of the Location.
 * @returns Location result from API call.
 */
const getRemoteLocationByName = async (locationName) => {
  const url = `${troposphere_base_url}/place/name/${locationName}?token=${troposphere_api_key}`;
  let result;
  try {
    result = { data } = await axios.get(url);
  } catch (error) {
    utils.manageAxiosError(error);
    const message = "Axios error";
    throw new Error(message);
  }

  // Return data if are correct.
  if (checkResponse(data)) {
    return data.data[0];
  }

  const message = "No location found";
  // TODO: Generate error to throw with this.
  throw new Error(message);
};

/**
 * Check if a Response from Axios is valid or not.
 * @param {axios.AxiosResponse} data Response from a previous call.
 * @returns True if is valid, false anywhere.
 */
const checkResponse = (data) =>
  data.error === null &&
  typeof data.data === "object" &&
  data.data.length !== 0;

module.exports = {
  fetchLocationByName,
  getLocationDataByCity,
  getRemoteLocationByName,
  getCachedLocationByName,
};

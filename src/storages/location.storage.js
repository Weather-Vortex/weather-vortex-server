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

"use strict";

const axios = require("axios");
const utils = require("./storage.utils");
const Location = require("../models/location.model");
const troposphere_base_url = "https://api.troposphere.io";
const troposphere_api_key = process.env.TROPOSPHERE_API_KEY; // TODO: Read from env

/**
 * Get the location data of a city by its name.
 * @param {string} locality Name of the city to get location of.
 * @returns Location data.
 */
const getLocationDataByCity = async (locality) => {
  if (typeof locality !== "string") {
    console.error("Locality of wrong type: %0. Must be a string", locality);
    throw new TypeError("Locality must be a string");
  }

  try {
    // First search in local cache.
    let cached = await getCachedLocationByName(locality);
    if (cached !== null) {
      return cached;
    }

    // Then in remote service.
    return await fetchLocationByName(locality);
  } catch (error) {
    // At this time, don't resolve error here, but throw it up.
    throw error;
  }
};

/**
 * Fetch the location data from a remote source and cache them.
 * @param {String} localityName Name of the Location.
 * @returns Location data.
 */
const fetchLocationByName = async (localityName) => {
  let result;
  try {
    // After ask to Troposphere service.
    result = await getRemoteLocationByName(localityName);
  } catch (error) {
    // At this time, don't resolve error here, but throw it up.
    throw error;
  }
  if (result) {
    const promises = result.data.map((data) =>
      addCachedLocation(data.name, data.latitude, data.longitude)
    );
    const caches = await Promise.all(promises);
    return caches[0].added;
    // If exists, add to local cache.
    /*const added = await addCachedLocation(
      result.name,
      result.latitude,
      result.longitude
    );
    // Then return the cached result.
    return added.added;*/
  }
  throw new Error({ localityName, message: "Location not found" });
};

/**
 * Find a Location given its name.
 * @param {String} localityName Name of the Location.
 * @returns Cached location if present.
 */
const getCachedLocationByName = async (localityName) => {
  try {
    const found = await Location.findOne({ name: localityName }).exec();
    return found;
  } catch (internalError) {
    const error = new CacheError("Cached location not found.");
    error.internalError = internalError;
    error.locality = localityName;
    throw error;
  }
};

class CacheError extends Error {
  constructor(locality, message) {
    super(message);
    this.locality = locality;
    this.name = "Cache Error";
  }
}

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
    const err = new Error(message);
    err.internalError = error;
    throw err;
  }
};

/**
 * Find a Locality from Troposphere service.
 * @param {String} locality Name of the Locality.
 * @returns Location result from API call.
 */
const getRemoteLocationByName = async (locality) => {
  const url = `${troposphere_base_url}/place/name/${locality}?token=${troposphere_api_key}`;
  try {
    const { data } = await axios.get(url);
    // If locality exists, return the first result retrieved. If not, return undefined anywhere.
    return data;
  } catch (error) {
    utils.manageAxiosError(error);
    const message = "Axios error";
    throw new Error(message);
  }
};

/**
 * Check if a Response from Axios is valid or not.
 * @param {axios.AxiosResponse} data Response from a previous call.
 * @returns {Boolean} True if is valid, false anywhere.
 */
const checkResponse = (data) =>
  data.error === null &&
  typeof data.data === "object" &&
  data.data.length !== 0;

module.exports = {
  getLocationDataByCity,
};

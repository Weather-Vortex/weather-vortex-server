/*
    Web server for Weather Vortex project.
    Copyright (C) 2021  Tentoni Daniele

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

const Station = require("../models/station.model");

/**
 * Returns all stations that matches given filters.
 * @param {Object} filters Fields to use as a filter.
 * @returns Filtered stations.
 */
const getStations = async (filters) => {
  try {
    const founds = await Station.find(filters).exec();
    return founds;
  } catch (err) {
    const message = "Internal mongodb error";
    const error = new Error();
    error.message = message;
    error.filter = filters;
    error.internalError = err;
    throw error;
  }
};

/**
 * Saves a station on the db. Don't use this to update a value.
 * @param {String} name Name of the station.
 * @param {String} locality Locality of the station.
 * @param {ObjectId} owner Owner of the station. // TODO: How can we get this in real world?
 * @param {String} authKey AuthKey to authenticate requests to the station.
 * @returns Saved station.
 */
const saveStation = async (name, locality, owner, authKey, url) => {
  try {
    const station = new Station({
      authKey,
      name,
      owner,
      position: {
        locality,
      },
      url,
    });
    const result = await station.save();
    return result;
  } catch (error) {
    const message = "Mongoose save error";
    const err = new Error();
    err.message = message;
    err.internalError = err;
    throw err;
  }
};

/**
 * Updates a station given its name and field to update, then return it.
 * @param {String} name Name of the station. Used to filtering stations on db.
 * @param {Object} update Updated fields to write on database.
 * @returns Updated station.
 */
const updateStations = async (name, update) => {
  try {
    const res = await Station.findOneAndUpdate({ name }, update, { new: true });
    return res;
  } catch (error) {
    const message = "Mongoose update station error";
    const err = new Error();
    err.internalError = err;
    err.message = message;
    err.name = name;
    err.update = update;
    throw err;
  }
};

/**
 * Deletes a station given its name, then return it.
 * @param {String} name Name of the station. Used to filtering stations on db.
 * @returns Deleted station.
 */
const deleteStations = async (name) => {
  try {
    const res = await Station.deleteOne({ name });
    return res;
  } catch (error) {
    const message = "Mongoose delete station error";
    const err = new Error();
    err.internalError = err;
    err.message = message;
    err.name = name;
    throw err;
  }
};

module.exports = {
  deleteStations,
  getStations,
  saveStation,
  updateStations,
};

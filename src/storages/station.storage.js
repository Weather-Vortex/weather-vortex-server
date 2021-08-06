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

const Station = require("../models/station.model");

/**
 * Retrieve all stations in a given locality.
 * @param {String} locality Locality name.
 * @returns {Array<Station>} Stations found.
 */
const getStationsByLocality = async (locality) => {
  try {
    let founds;
    if (typeof locality === "string" && locality !== "") {
      founds = await Station.find({ position: { locality } });
    } else {
      founds = await Station.find();
    }

    return { result: founds !== null, locality, stations: founds };
  } catch (err) {
    const message = "Stations with given locality wasn't found";
    const error = new Error(message);
    error.locality = locality;
    error.error = err;
    throw error;
  }
};

const saveStation = async (name, locality, owner, authKey) => {
  try {
    const station = new Station({
      authKey,
      name,
      owner,
      position: {
        locality,
      },
    });
    const result = await station.save();
    console.log("Save station result:", result);
    return result;
  } catch (error) {
    const message = "Mongoose save error";
    const err = new Error(message);
    err.internalError = err;
    throw err;
  }
};

module.exports = { getStationsByLocality, saveStation };

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

const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema({
  /**
   * Value to be used to authenticate requests to a remote station.
   */
  auth_key: {
    type: String,
    minlength: 32,
    maxlength: 128,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    // TODO: Check if object if is present.
  },
  position: {
    locality: {
      type: String,
      required: true,
      trim: true,
    },
  },
});

/**
 * Fetch database for a station with the given name.
 * @param {String} name Name of the station.
 * @returns {Station} Station retrieved.
 */
stationSchema.statics.findByName = async (name) => {
  return this.find({ name });
};

module.exports = mongoose.model("Station", stationSchema);

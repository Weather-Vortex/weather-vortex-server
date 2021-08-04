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

const mongoose = require("mongoose");

var locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  position: {
    latitude: {
      type: Number,
      required: true,
      max: 90,
      min: -90,
    },
    longitude: {
      type: Number,
      required: true,
      max: 180,
      min: -180,
    },
  },
});

/**
 * Find a Location given its name.
 * @param {String} name Name of the Location.
 * @returns Promise with the found location or an error.
 */
locationSchema.statics.findByName = (name) =>
  new Promise((resolve, reject) => {
    this.findOne({ name }, (err, location) => {
      if (err) {
        reject({ result: false, error: err, message: "Location not found" });
        return;
      }
      resolve({ result: true, location });
    });
  });

module.exports = mongoose.model("Location", locationSchema);

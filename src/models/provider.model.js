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

const mongoose = require("mongoose");

/**
 * Weather Forecast Provider.
 */
const providerSchema = new mongoose.Schema({
  /**
   * Provider name.
   */
  name: {
    type: String,
    minlength: 3,
    trim: true,
    unique: true,
  },
  /**
   * Average rating of the provider.
   */
  average: {
    type: Number,
    min: 0,
    max: 5,
  },
  /**
   * List of feedbacks given by users.
   */
  feedbacks: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Feedback",
    default: () => [],
  },
  /*{
    type: Array,
    default: [],
    validate: {
      validator: (v) => v.rating && v.userId && v.creationDate,
      message: (p) => `${p} must be a Feedback`,
    },
  }
  */
});

const Provider = mongoose.model("Provider", providerSchema);

module.exports = { Provider };

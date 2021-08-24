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
const { feedbackSchema } = require("./feedback.model");

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
    type: [feedbackSchema],
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

feedbackSchema.pre("save", (next) => {
  if (typeof this.rating === "undefined" || this.rating === null) {
    return next(new Error("this.rating is null"));
  }
  next();
});

providerSchema.post("save", async (doc) => {
  console.log(
    "%s(%s) has been saved. Get the average again!",
    doc._id,
    doc.name
  );
});

const Provider = mongoose.model("Provider", providerSchema);

module.exports = { Provider };

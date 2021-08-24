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
 * Feedback given by users to a Provider.
 */
const feedbackSchema = new mongoose.Schema({
  /**
   * Rating from 0 to 5. This is a required fields, users have to give a rating when they are giving feedbacks at least.
   */
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
    default: 3,
  },
  /**
   * UserId of the feedback Giver.
   */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  /**
   * Creation date of the feedback.
   */
  creationDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  /**
   * (Optional) Forecast date to feedback.
   */
  forecastDate: {
    type: Date,
    max: Date.now, // You can rate only past forecasts.
  },
  /**
   * (Optional) Forecast fields to rate.
   */
  fields: {
    type: [String],
  },
  /**
   * (Optional) Additional description by the user.
   */
  description: {
    type: String,
    maxlength: 5000,
  },
});

// const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = { feedbackSchema };

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

const { Provider } = require("../models/provider.model");
const { feedbackSchema } = require("../models/feedback.model");

const createFeedback = async (providerId, feedback) => {
  try {
    const res = await Provider.findByIdAndUpdate(
      providerId,
      {
        $push: { feedbacks: feedback },
      },
      { new: true }
    );
    return res;
    // provider.feedbacks.push(fb);
    // return await provider.save();
  } catch (error) {
    const message = `Mongoose save error: ${error}`;
    const err = new Error(message);
    err.message = message;
    err.internalError = error;
    throw err;
  }
};

/**
 * Delete a feedback given his id.
 * @param {mongoose.Schema.Type.ObjectId} feedbackId ObjectId of the feedback to delete.
 * @returns Operation result.
 */
const deleteFeedback = async (feedbackId) => {
  try {
    return await Feedback.findByIdAndDelete(feedbackId);
  } catch (error) {
    const message = "Mongoose delete error";
    const err = new Error();
    err.message = message;
    err.internalError = error;
    throw err;
  }
};

/**
 * Save a Provider on the db. Don't use this to update a value.
 * @param {String} name Provider name.
 * @returns Saved Provider.
 */
const createProvider = async (name) => {
  try {
    const provider = new Provider({ name });
    return await provider.save();
  } catch (error) {
    const message = `Mongoose save error: ${error}`;
    const err = new Error();
    err.message = message;
    err.internalError = error;
    throw err;
  }
};

/**
 * Retrieve an array of lasts feedbacks given to a specific Provider.
 * @param {String} name Provider name.
 * @returns Array of lasts feedbacks.
 */
const getFeedbacksByProvider = async (name) => {
  try {
    const provider = await Provider.findOne({ name });
    return provider.feedbacks;
  } catch (error) {
    const message = "Mongoose get feedbacks by provider error";
    const err = new Error();
    err.message = message;
    err.internalError = error;
    throw err;
  }
};

const getAllFeedbacksFromAllProviders = async () => {
  try {
    return await Provider.find();
  } catch (error) {
    const message = "Mongoose get all feedbacks from all providers error";
    const err = new Error();
    err.message = message;
    err.internalError = error;
    throw err;
  }
};

module.exports = {
  createFeedback,
  createProvider,
  deleteFeedback,
  getFeedbacksByProvider,
  getAllFeedbacksFromAllProviders,
};

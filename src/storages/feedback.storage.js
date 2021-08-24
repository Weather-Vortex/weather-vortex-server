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
const { Provider } = require("../models/provider.model");
const User = require("../models/user.model");

const createFeedback = async (providerId, feedback) => {
  try {
    const provider = await Provider.findById(providerId);
    provider.feedbacks.push(feedback);
    return await provider.save();
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
 * @param {mongoose.ObjectId} id Can be the ProviderId or the UserId.
 * @param {mongoose.ObjectId} feedbackId ObjectId of the feedback to delete.
 * @returns Operation result.
 */
const deleteFeedback = async (id, feedbackId) => {
  if (typeof id === "object") {
    if (typeof id.provider === "string") {
      const objectId = new mongoose.ObjectId(id.provider);
      return await deleteFeedbackByProvider(objectId, feedbackId);
    } else if (typeof id.provider === "object") {
      return await deleteFeedbackByProvider(id.provider, feedbackId);
    } else if (typeof id.user === "string") {
      const objectId = new mongoose.ObjectId(id.user);
      return await deleteFeedbackByUser(objectId, feedbackId);
    } else if (typeof id.user === "object") {
      return await deleteFeedbackByUser(id.user, feedbackId);
    }
  }

  return null;
};

const deleteFeedbackByProvider = async (id, feedbackId) => {
  const provider = await Provider.findById(id);
  provider.feedbacks.pull(feedbackId);
  console.log("Midlle", provider);
  return await provider.save();
};

const deleteFeedbackByUser = async (id, feedbackId) => {
  const user = await User.findById(id).populate("feedbacks");
  console.log("User fetched", user);
  const feedback = user.feedbacks.find(
    (f) => f.toString() === feedbackId.toString()
  );
  const res = await feedback.remove();
  console.log("Removed:", res);
  return res;
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

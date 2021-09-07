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
const { Feedback } = require("../models//feedback.model");
const { Provider, providerNames } = require("../models/provider.model");
const User = require("../models/user.model");

/**
 * Create a Feedback given his provider.
 * @param {mongoose.ObjectId} providerId Provider Id with given feedback.
 * @param {Feedback} feedback Given Feedback.
 * @returns Mongoose save result promise.
 */
const createFeedback = async (
  rating,
  provider,
  user,
  forecastDate,
  fields,
  description
) => {
  try {
    provider =
      typeof provider === "object"
        ? provider
        : new mongoose.Types.ObjectId(provider);
    user = typeof user === "object" ? user : new mongoose.Types.ObjectId(user);
    const feedback = new Feedback({
      rating,
      provider,
      user,
      forecastDate,
      fields,
      description,
    });
    const saved = await feedback.save();
    return saved;
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
 * @param {mongoose.ObjectId} id ObjectId of the feedback to delete.
 * @param {mongoose.ObjectId} user Owner of the feedback.
 * @returns Operation result.
 */
const deleteFeedback = async (id, user) => {
  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  if (typeof user === "string") {
    user = new mongoose.Types.ObjectId(user);
  }

  const feedback = await Feedback.findOne({ _id: id, user });
  if (feedback) {
    const deleted = await feedback.remove();
    if (!deleted) {
      throw new Error("Feedback not deleted");
    }

    const first = await User.findById(deleted.user);
    first.feedbacks.pull(deleted._id);
    await first.save();
    const provider = await Provider.findById(deleted.provider);
    provider.feedbacks.pull(deleted._id);
    await provider.save();
    return deleted;
  }
  return null;
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
    // TODO: When project growth, change this with a map.
    let message;
    if (error.code === 11000) {
      const value = JSON.stringify(error.keyValue);
      message = `Mongoose duplicated key ${value}`;
    } else {
      message = `Mongoose unknown save error: ${error}`;
    }
    const err = new Error(message);
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
    const provider = await Provider.findOne({ name }).populate({
      path: "feedbacks",
      populate: { path: "user", select: "_id firstName lastName" },
    });
    return provider;
  } catch (error) {
    console.error(error);
    const message = "Mongoose get feedbacks by provider error";
    const err = new Error(message);
    err.message = message;
    err.internalError = error;
    throw err;
  }
};

const getAllFeedbacksFromAllProviders = async () => {
  try {
    return await Provider.find({}).populate({
      path: "feedbacks",
      populate: { path: "user", select: "_id firstName lastName" },
    });
  } catch (error) {
    const message = "Mongoose get all feedbacks from all providers error";
    const err = new Error(message);
    err.message = message;
    err.internalError = error;
    throw err;
  }
};

const fillFeedback = async (feedback) => {
  if (typeof feedback !== "object") {
    throw new TypeError("Feedback must be an object");
  }

  if (typeof feedback.userId === "string") {
    feedback.userId = new mongoose.Types.ObjectId(feedback.userId);
  }

  const p = await Feedback.findById(feedback._id)
    .populate("user", "_id firstName lastName")
    .populate("provider", "_id name");

  return p;
};

module.exports = {
  createFeedback,
  createProvider,
  deleteFeedback,
  fillFeedback,
  getFeedbacksByProvider,
  getAllFeedbacksFromAllProviders,
  providerNames,
};

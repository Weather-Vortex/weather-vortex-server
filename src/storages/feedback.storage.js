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
const { Provider } = require("../models/provider.model");
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
    const providerId =
      typeof provider === "object"
        ? provider
        : new mongoose.Types.ObjectId(provider);
    const userId =
      typeof user === "object" ? user : new mongoose.Types.ObjectId(user);
    const feedback = new Feedback({
      rating,
      providerId,
      userId,
      forecastDate,
      fields,
      description,
    });
    return await feedback.save();
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

  const deleted = await Feedback.findOneAndDelete({ _id: id, userId: user });
  // const deleted = await Feedback.findByIdAndDelete(id);
  return deleted;
  /*
  if (typeof feedbackId === "string") {
    feedbackId = new mongoose.ObjectId(feedbackId);
  }

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
  */
};

/**
 * @deprecated Use only deleteFeedback function.
 * @param {*} providerId
 * @param {*} feedbackId
 * @returns
 */
const deleteFeedbackByProvider = async (providerId, feedbackId) => {
  const provider = await Provider.findById(providerId);
  const feedback = provider.feedbacks.find((f) => f._id.equals(feedbackId));
  provider.feedbacks.pull(feedbackId);
  const saved = await provider.save();
  const user = await User.findById(feedback.userId);
  user.feedbacks.pull(feedbackId);
  await user.save();
  return saved;
};

/**
 * @deprecated Use only deleteFeedback function.
 * @param {*} id
 * @param {*} feedbackId
 * @returns
 */
const deleteFeedbackByUser = async (id, feedbackId) => {
  const user = await User.findById(id).populate("feedbacks");
  console.log("User fetched", user);
  const feedback = user.feedbacks.find((f) => f.equals(feedbackId));
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
    const { feedbacks } = await Provider.findOne({ name });
    const mapped = await Promise.all(
      feedbacks.map((m) => Feedback.findById(m))
    );
    return mapped;
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
    return await Provider.find();
  } catch (error) {
    const message = "Mongoose get all feedbacks from all providers error";
    const err = new Error();
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

  const user = await User.findById(feedback.userId);
  feedback.user = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
  };
  return feedback;
};

module.exports = {
  createFeedback,
  createProvider,
  deleteFeedback,
  fillFeedback,
  getFeedbacksByProvider,
  getAllFeedbacksFromAllProviders,
};

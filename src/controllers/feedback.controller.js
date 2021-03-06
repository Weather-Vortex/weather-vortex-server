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

const storage = require("../storages/feedback.storage");
const stations = require("../storages/station.storage");
const users = require("../models/user.model");

const generateStartupEntities = async () => {
  if (typeof process.env.NODE_ENV === "undefined") {
    await generateStations();
  }
  return await generateBaseProviders();
};

const generateStations = async () => {
  const user = await users.findOne({
    email: "daniele.tentoni.1996@gmail.com",
  });
  if (user) {
    await stations.saveStation(
      "Tento st",
      "Cesena",
      user._id,
      "1234asdf1234asdf1234asdf1234asdf",
      "https://iot-weather-simulator.herokuapp.com/"
    );
  }
};

const generateBaseProviders = async () => {
  try {
    const results = await Promise.all(
      storage.providerNames.map((p) => storage.createProvider(p))
    );
    const success = results.filter((f) => typeof f.name !== "string");
    return success;
  } catch (error) {
    const message = `Feedback Storage generate provider: ${error}`;
    const err = new Error(message);
    err.message = message;
    err.internalError = error;
    throw err;
  }
};

const createFeedback = async (req, res) => {
  try {
    const result = await storage.createFeedback(
      req.body.rating,
      req.body.provider,
      req.user._id,
      req.body.forecastDate,
      req.body.fields,
      req.body.description
    );
    if (result) {
      const cloned = await storage.fillFeedback(result);
      return res.status(201).json({
        message: "Feedback created.",
        feedback: cloned,
      });
    }
    return res
      .status(500)
      .json({ result, message: "Feedback not created, unknown error" });
  } catch (error) {
    console.error("FEEDBACK ERROR: ", error);
    return res
      .status(500)
      .json({ error, message: "Error thrown during feedback creation." });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const result = await storage.deleteFeedback(req.params.id, req.user._id);
    if (result) {
      return res.status(200).json({ result, message: "Feedback deleted." });
    }
    return res.status(404).json({ result, message: "Feedback not found" });
  } catch (error) {
    return res
      .status(500)
      .json({ error, message: "Error thrown during feedback deletion" });
  }
};

const getFeedbacksByProvider = async (req, res) => {
  try {
    const results = await storage.getFeedbacksByProvider(req.params.name);
    if (results) {
      return res.status(200).json({ results, message: "Feedbacks found" });
    }
    return res.status(404).json({
      results,
      message: "No feedbacks found for given provider.",
      provider: req.params.name,
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Error thrown during feedbacks fetching.",
      provider: req.params.name,
    });
  }
};

const getAllFeedbacksFromAllProviders = async (_, res) => {
  try {
    const results = await storage.getAllFeedbacksFromAllProviders();
    if (results) {
      return res.status(200).json({ results, message: "Feedbacks fetched" });
    }
    return res.status(404).json({ results, message: "No feedbacks fetched." });
  } catch (error) {
    console.error("ERROR ONTROOLER:", error);
    return res
      .status(500)
      .json({ error, message: "Error thrown during all feedbacks fetching" });
  }
};

module.exports = {
  createFeedback,
  deleteFeedback,
  generateStartupEntities,
  getFeedbacksByProvider,
  getAllFeedbacksFromAllProviders,
};

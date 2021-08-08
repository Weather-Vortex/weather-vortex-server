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

"use strict";

const storage = require("../storages/station.storage");

/**
 * Create a new station.
 * @param {Request} req Express request. Must have body with station data.
 * @param {Response} res Express response.
 * @returns Json response with station created.
 */
const createStation = async (req, res) => {
  if (
    typeof req.body.authKey !== "string" ||
    typeof req.body.name !== "string" ||
    typeof req.body.owner !== "string" ||
    typeof req.body.position.locality !== "string"
  ) {
    const message = "Wrong type of fields";
    return res.status(400).json({ result: false, message, body: req.body });
  }

  try {
    const saved = await storage.saveStation(
      req.body.name,
      req.body.position.locality,
      req.body.owner,
      req.body.authKey,
      req.body.url
    );
    return res.status(200).json({ result: true, body: req.body, saved });
  } catch (error) {
    return res.status(500).json({ result: false, body: req.body, error });
  }
};

/**
 * Get stations, optionally filtered by locality.
 * @param {Request} req Express request.
 * @param {Response} res Express response.
 * @returns Json response with Stations or Error.
 */
const getStations = async (req, res) => {
  const filter = {};

  if (req.params.name) {
    filter.name = req.params.name;
  }

  if (req.query.locality) {
    filter.position = { locality: req.query.locality };
  }

  try {
    let stations = await storage.getStations(filter);
    if (stations.length > 0) {
      const json = {
        result: true,
        filter,
      };
      if (filter.name) {
        // If user search for a given station, return it only.
        json.station = stations[0];
      } else {
        json.stations = stations;
      }
      return res.status(200).json(json);
    } else {
      const message = "No Stations found with given filter.";
      return res.status(404).json({ result: false, filter, message });
    }
  } catch (error) {
    return res.status(500).json({ result: false, error, filter });
  }
};

const updateStation = async (req, res) => {
  const filter = {};

  if (!validString(req.params.name)) {
    const message = "PUT request: you have to identify the resource to modify.";
    res.status(404).json({ result: false, message, name: req.params.name });
  } else {
    filter.name = req.params.name;
  }

  if (typeof req.body !== "object") {
    const message = "PUT request: you have to send a body with some data.";
    res.status(500).json({ result: false, message, update: req.body });
  }

  const update = req.body;

  try {
    const station = await storage.updateStations(req.params.name, update);
    if (station) {
      return res.status(200).json({ result: true, station, update });
    }

    const message = "PUT request: resource not found.";
    return res.status(404).json({ result: false, message, station, update });
  } catch (error) {
    return res.status(500).json({ result: false, error, update });
  }
};

const deleteStation = async (req, res) => {
  const filter = {};

  if (!validString(req.params.name)) {
    const message =
      "DELETE request: you have to identify the resource to delete.";
    res.status(404).json({ result: false, message, name: req.params.name });
  } else {
    filter.name = req.params.name;
  }

  try {
    const station = await storage.deleteStations(filter);
    if (station) {
      return res.status(200).json({ result: true, update });
    }

    const message = "DELETE request: resource not found";
    return res.status(404).json({ result: false, update, message });
  } catch (error) {
    return res.status(500).json({ result: false, error, update });
  }
};

const validString = (str) => typeof str === "string" && str !== "";

module.exports = {
  createStation,
  deleteStation,
  getStations,
  updateStation,
};

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
      req.body.authKey
    );
    return res.status(200).json({ result: true, saved });
  } catch (error) {
    return res.status(500).json({ result: false, error, body: req.body });
  }
};

/**
 * Get stations, optionally filtered by locality.
 * @param {Request} req Express request.
 * @param {Response} res Express response.
 * @returns Json response with Stations or Error.
 */
const getStations = async (req, res) => {
  console.log("Params", req.params);
  const filter = {};

  if (validString(req.params.name)) {
    filter.name = req.params.name;
  }

  if (validLocality(req.query.locality)) {
    filter.position = { locality: req.query.locality };
  }

  try {
    const stations = await storage.getStations(filter);
    if (typeof stations === "array") {
      return res.status(200).json({ result: true, filter, stations });
    } else {
      const message = "No Stations found with given filter.";
      return res.status(404).json({ result: false, filter, message });
    }
  } catch (error) {
    return res.status(500).json({ result: false, error, filter });
  }
};

const validString = (locality) =>
  typeof locality === "string" && locality !== "";

module.exports = {
  createStation,
  getStations,
};

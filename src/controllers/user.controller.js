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

const storage = require("../storages/user.storage");

const getUserFeedbacks = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await storage.getUserFeedbacks(id);
    const verbose = req.query.verbose;
    const user = verbose ? result : { feedbacks: result.feedbacks };
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Error thrown during user feedbacks query.",
      id,
    });
  }
};

module.exports = { getUserFeedbacks };

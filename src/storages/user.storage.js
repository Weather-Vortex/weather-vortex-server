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
const User = require("../models/user.model");

/**
 * Get all selected user feedbacks populated with provider data.
 * @param {mongoose.Types.ObjectId} id ObjectId of the User to select.
 * @returns Selected user feedbacks.
 */
const getUserFeedbacks = async (id) => {
  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  const user = await User.findById(id)
    .publicView()
    .populate({
      path: "feedbacks",
      select: "-user",
      populate: { path: "provider", select: "_id name" },
    });

  return user;
};

const getUserStations = async (id) => {
  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  const user = await User.findById(id).publicView().populate({
    path: "stations",
    select: "-owner",
  });

  return user;
};

/**
 * Get all users with some preferred.
 * @returns Users with some preferred.
 */
const getUsersWithPreferred = async () => {
  const res = await User.withPreferred();
  return res;
};

//an ADMINISTRATOR can obtain a user from its id
/**
 * @deprecated This is unused, will be removed in a future release.
 * @param {*} req
 * @param {*} res
 */
const getUser = (req, res) => {
  var id = req.params.id;
  User.findById(id, function (err, docs) {
    if (err) {
      console.log(err);
      return res.status(400).send(err);
    } else {
      console.log("Result : ", docs);
      res.json(docs);
    }
  });
};

//THE ADMINISTRATOR can view the list of users
/**
 * @deprecated This is unused, will be removed in a future release.
 * @param {*} req
 * @param {*} res
 */
const getAllUsers = (req, res) => {
  console.log("Get all users");
  User.find({}, function (err, users) {
    if (err) {
      return res.status(400).send(err);
    } else {
      var userMap = {};

      users.forEach(function (user) {
        userMap[user._id] = user;
      });

      res.json(userMap);
    }
  });
};

module.exports = {
  getUserFeedbacks,
  getUserStations,
  getUsersWithPreferred,
};

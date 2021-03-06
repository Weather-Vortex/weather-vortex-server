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

const User = require("../../src/models/user.model");

const testEmail = "test.user@email.it"; // Change this to receive real mails in unit tests.

/**
 * Facility method to create a user in the database to use for tests.
 * @returns {User} The Test User created.
 */
const createUser = async () => {
  const user = new User({
    firstName: "test",
    lastName: "user",
    password: "12345678",
    email: testEmail,
    preferred: { location: "Cesena" },
  });
  const res = await user.save();
  return res;
};

const verifyUser = async (user) => {
  user.isVerified = true;
  return await user.save();
};

const createToken = (user) =>
  new Promise((resolve, reject) => {
    user.generateToken((err, withToken) => {
      if (err) {
        reject(err);
      }

      if (withToken.token) {
        resolve(withToken);
      }

      reject(new Error("Missing token"));
    });
  });

const cleanUserStation = async (user) => {
  user.stations = [];
  return await user.save();
};

/**
 * Clean all testers.
 * @returns Clean result.
 */
const cleanTesters = async () => await User.deleteMany({ email: testEmail });

module.exports = {
  cleanTesters,
  cleanUserStation,
  createUser,
  createToken,
  verifyUser,
};

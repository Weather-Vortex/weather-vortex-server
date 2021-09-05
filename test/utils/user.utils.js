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

/**
 * Facility method to create a user in the database to use for tests.
 * @returns The Test User created.
 */
const createUser = async () => {
  const user = new User({
    firstName: "test",
    lastName: "user",
    password: "12345678",
    email: "test.user@email.it",
  });
  const res = await user.save();
  return res;
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

module.exports = { createUser, createToken };

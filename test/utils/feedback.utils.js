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

const { Feedback } = require("../../src/models/feedback.model");
const { Provider, providerNames } = require("../../src/models/provider.model");
const User = require("../../src/models/user.model");

/**
 * Clean collections of Providers and Users from all feedbacks generated.
 * @param {mongoose.Types.ObjectId} _id ObjectId of the test user to clean.
 * @returns Cleaned Provider and cleaned User.
 */
const cleanFeedbackDatabase = async (_id) => {
  await Feedback.deleteMany({});
  const provider = await getProvider();
  provider.feedbacks = [];
  const cleanedProvider = await provider.save();
  const user = await User.findById(_id);
  user.feedbacks = [];
  const cleanedUser = await user.save();
  return { cleanedProvider, cleanedUser };
};

const providerName = providerNames[0];

const getProvider = async () => await Provider.findOne({ name: providerName });

module.exports = { cleanFeedbackDatabase, getProvider, providerName };

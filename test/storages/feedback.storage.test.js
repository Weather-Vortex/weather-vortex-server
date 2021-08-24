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

const storage = require("../../src/storages/feedback.storage");
const { Provider } = require("../../src/models/provider.model");
// const { Feedback } = require("../../src/models/feedback.model");

const User = require("../../src/models/user.model");
const { createUser } = require("../utils/user.utils");

const chai = require("chai");
const { expect } = chai;

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const { connection } = require("../../src/config/database.connector");

describe("Feedbacks Storage", () => {
  const name = "TestProvider";
  let testUser;

  before((done) => {
    connection
      .then(() =>
        createUser().then((res) => {
          testUser = res;
          done();
        })
      )
      .catch((error) => done(error));
  });

  after((done) => {
    // Delete the test user after all tests.
    User.deleteMany(testUser)
      .then(() => done())
      .catch((err) => done(err));
  });

  describe("Create a Provider", () => {
    beforeEach(async () => await Provider.deleteMany({}));

    it("Create a Provider", async () => {
      const result = await storage.createProvider(name);

      expect(result).to.be.an("object");
      expect(result).to.have.a.property("name", name);
    });
  });

  describe("Create a Feedback", () => {
    let provider;
    before((done) => {
      Provider.findOne({ name })
        .then((res) => {
          provider = res;
          done();
        })
        .catch((error) => done(error));
    });

    beforeEach(
      async () =>
        await Provider.findOneAndUpdate(
          { name },
          {
            $set: { feedbacks: [] },
          }
        )
    );

    it("Create a Feedback for a provider", async () => {
      const rating = 5;
      const result = await storage.createFeedback(provider._id, {
        rating,
        userId: testUser._id,
      });

      expect(result).to.be.an("object");
      expect(result).to.have.a.property("feedbacks");
      expect(result.feedbacks.length).to.be.equals(1);
      expect(result.feedbacks[0]).to.have.a.property("rating", rating);
    });
  });
});

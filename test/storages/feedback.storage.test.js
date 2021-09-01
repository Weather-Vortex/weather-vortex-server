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
const { Feedback } = require("../../src/models/feedback.model");

const User = require("../../src/models/user.model");
const { createUser } = require("../utils/user.utils");

const chai = require("chai");
const { expect } = chai;

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const { connection } = require("../../src/config/database.connector");

describe("Feedbacks Storage", () => {
  const providerName = "TestProvider";
  let testUser;

  before((done) => {
    connection
      .then(async () => {
        try {
          // Delete the test user after all tests.
          await User.deleteMany({});
          const cre = await createUser();
          testUser = cre;
          done();
        } catch (err) {
          done(err);
        }
      })
      .catch((error) => done(error));
  });

  after((done) => {
    // Delete the test user after all tests.
    //User.deleteMany(testUser)
    //.then(() => done())
    //.catch((err) => done(err));
    done();
  });

  describe("Create a Provider", () => {
    beforeEach(async () => await Provider.deleteMany({}));

    it("Create a Provider", async () => {
      const result = await storage.createProvider(providerName);

      expect(result).to.be.an("object");
      expect(result).to.have.a.property("name", providerName);
    });
  });

  describe("Create a Feedback", () => {
    let provider;
    before((done) => {
      Provider.findOne({ name: providerName })
        .then((res) => {
          provider = res;
          done();
        })
        .catch((error) => done(error));
    });

    beforeEach(
      async () =>
        await Provider.findOneAndUpdate(
          { name: providerName },
          {
            $set: { feedbacks: [] },
          }
        )
    );

    it("Create a Feedback for a provider", async () => {
      const rating = 5;
      const result = await storage.createFeedback(
        rating,
        provider._id,
        testUser._id
      );

      expect(result).to.be.an("object");
      expect(result).to.have.a.property("rating", rating);
      expect(result).to.have.a.property("userId");
      expect(result).to.have.a.property("providerId");
      expect(result.userId.toString()).to.be.equals(testUser._id.toString());
      expect(result.providerId.toString()).to.be.equals(
        provider._id.toString()
      );

      const hisProvider = await Provider.findById(result.providerId);
      expect(hisProvider).to.be.an("object");
      expect(hisProvider).to.have.a.property("name", providerName);
      expect(hisProvider).to.have.a.property("feedbacks").to.have.lengthOf(1);
      expect(hisProvider.feedbacks[0]._id.toString()).to.be.equals(
        result._id.toString()
      );
    });
  });

  describe("Delete a Feedback", () => {
    const rating = 4;
    let provider;
    let feedbackCreated;

    beforeEach(async () => {
      // Clean User feedbacks. This can be unnecessary.
      const preTester = await User.findById(testUser._id);
      preTester.feedbacks = [];
      const postTester = await preTester.save();

      // Clean Provider.
      const tmp = await Provider.findOne({ name: providerName });
      tmp.feedbacks = [];
      const temp = await tmp.save();

      await Feedback.deleteMany({});

      feedbackCreated = await storage.createFeedback(
        rating,
        temp._id,
        postTester._id
      );
      provider = await Provider.findOne({ name: providerName });
    });

    it.skip("Fail deleting a feedback with a string instead of a provider/user objectId object", async () => {
      const then = await storage.deleteFeedback(
        testUser._id.toString(),
        provider.feedbacks[0]._id
      );
      expect(then).to.be.null;
    });

    it.skip("Delete a Feedback with provider id", async () => {
      expect(provider.feedbacks).to.have.lengthOf(1);
      const then = await storage.deleteFeedback(
        { provider: provider._id },
        provider.feedbacks[0]._id
      );

      expect(then).to.not.be.null;
      expect(then).to.be.an("object");
      expect(then.feedbacks).to.have.lengthOf(0);
    });

    it.skip("Delete a Feedback with user id", async () => {
      expect(provider.feedbacks).to.have.lengthOf(1);

      // First create the Feedback.
      const then = await storage.deleteFeedback(
        { user: testUser._id },
        provider.feedbacks[0]._id
      );

      expect(then).to.not.be.null;
      expect(then).to.be.an("object");
    });

    it("Delete a feedback with his id", async () => {
      const then = await storage.deleteFeedback(feedbackCreated._id);

      expect(then).to.be.an("object");
      expect(then).to.have.a.property("rating", rating);
      expect(then).to.have.a.property("userId");
      expect(then).to.have.a.property("providerId");

      const fb = await Feedback.findById(then._id);

      expect(fb).to.be.null;
    });
  });

  describe("Get Feedbacks", () => {
    const firstRating = 4;
    const firstName = "First";
    const secondRating = 5;
    const secondName = "Second";

    before(async () => {
      const first = await storage.createProvider(firstName);
      const second = await storage.createProvider(secondName);
      await storage.createFeedback(firstRating, first._id, testUser._id);
      await storage.createFeedback(secondRating, second._id, testUser._id);
    });

    it("By provider", async () => {
      const firstRes = await storage.getFeedbacksByProvider(firstName);
      expect(firstRes).to.be.an("array").to.have.lengthOf(1);

      const firstFeedback = firstRes[0];
      expect(firstFeedback).to.have.a.property("rating", firstRating);
      expect(firstFeedback).to.have.a.property("userId");
      expect(firstFeedback.userId.toString()).to.be.equals(
        testUser._id.toString()
      );

      const secondRes = await storage.getFeedbacksByProvider(secondName);
      expect(secondRes).to.be.an("array").to.have.lengthOf(1);

      const secondFeedback = secondRes[0];
      expect(secondFeedback).to.have.a.property("rating", secondRating);
      expect(secondFeedback).to.have.a.property("userId");
      expect(secondFeedback.userId.toString()).to.be.equals(
        testUser._id.toString()
      );
    });

    it("All", async () => {
      const res = await storage.getAllFeedbacksFromAllProviders();
      expect(res).to.be.an("array").to.have.lengthOf(3);
      const test = res.find((f) => f.name === providerName);
      expect(test).to.not.be.null;
      const firstTest = res.find((f) => f.name === firstName);
      expect(firstTest).to.not.be.null;
      const secondTest = res.find((f) => f.name === secondName);
      expect(secondTest).to.not.be.null;
    });
  });
});

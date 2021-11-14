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
  const providerName = storage.providerNames[0];
  let testUser;

  before(async () => {
    await connection;
    const created = await createUser();
    testUser = created;
  });

  // Delete previous test users.
  after(async () => await User.deleteMany({}));

  describe("Create a Provider", () => {
    const testProviderName = "Test Provider Name";
    beforeEach(
      async () => await Provider.deleteMany({ name: testProviderName })
    );

    it("Create a Provider", async () => {
      const result = await storage.createProvider(testProviderName);

      expect(result).to.be.an("object");
      expect(result)
        .to.have.a.property("name", testProviderName)
        .to.be.a("string");
    });

    it("Create two providers", async () => {
      await storage.createProvider(testProviderName);

      const result = storage.createProvider(testProviderName);
      await expect(result).to.be.rejectedWith(Error);
    });
  });

  describe("Create a Feedback", () => {
    let provider;
    before(async () => {
      try {
        provider = await Provider.findOne({ name: providerName });
      } catch (error) {
        console.log(error);
        throw error;
      }
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
      expect(result)
        .to.have.a.property("user")
        .to.be.an("object")
        .to.be.equals(testUser._id);
      expect(result).to.have.a.property("provider").to.be.an("object");
      expect(result.user.toString()).to.be.equals(testUser._id.toString());
      expect(result.provider.toString()).to.be.equals(provider._id.toString());

      const hisProvider = await Provider.findById(result.provider);
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

    it("Fail deleting a feedback with a string instead of a provider/user objectId object", async () => {
      const feedbackId = provider.feedbacks[0]._id;
      const then = await storage.deleteFeedback(
        testUser._id.toString(),
        feedbackId
      );
      expect(then).to.be.null;
    });

    it("Fail deleting a Feedback with provider id inside an object", async () => {
      expect(provider.feedbacks).to.have.lengthOf(1);
      const feedbackId = provider.feedbacks[0]._id;
      expect(
        storage.deleteFeedback({ providerId: provider._id }, feedbackId)
      ).to.eventually.throw(
        new TypeError(
          "id param must be a String or a mongoose.Schema.Types.ObjectId"
        )
      );
    });

    it("Fail deleting a Feedback with user id inside an object", async () => {
      expect(provider.feedbacks).to.have.lengthOf(1);
      const feedbackId = provider.feedbacks[0]._id;

      // First create the Feedback.
      expect(
        storage.deleteFeedback({ user: testUser._id }, feedbackId)
      ).to.eventually.throw(
        new TypeError(
          "id param must be a String or a mongoose.Schema.Types.ObjectId"
        )
      );
    });

    it("Delete a feedback with his id", async () => {
      const then = await storage.deleteFeedback(
        feedbackCreated._id,
        feedbackCreated.user
      );

      expect(then).to.be.an("object");
      expect(then).to.have.a.property("rating", rating);
      expect(then).to.have.a.property("user");
      expect(then).to.have.a.property("provider");

      const fb = await Feedback.findById(then._id);
      expect(fb).to.be.null;
    });

    it("The provider must not have the feedback in his collection", async () => {
      const then = await storage.deleteFeedback(
        feedbackCreated._id,
        feedbackCreated.user
      );
      const pr = await Provider.findById(then.provider);
      expect(pr).to.be.not.null;
      /**
       * Gets feedbacks Ids from a provider.
       * @param {Provider} provider Provider to process.
       * @returns {[any]} Feedbacks Ids.
       */
      const getFeedbacksFromProvider = (provider) => provider.feedbacks;
      const feedbacks = getFeedbacksFromProvider(pr);
      expect(feedbacks.includes(then._id)).to.be.false;
    });
  });

  describe("Get Feedbacks", () => {
    const firstRating = 4;
    const firstName = storage.providerNames[0];
    const secondRating = 5;
    const secondName = storage.providerNames[1];

    before(async () => {
      await Provider.deleteMany({});
      const first = await storage.createProvider(firstName);
      const second = await storage.createProvider(secondName);
      await storage.createFeedback(firstRating, first._id, testUser._id);
      await storage.createFeedback(secondRating, second._id, testUser._id);
    });

    it("By provider", async () => {
      const firstRes = await storage.getFeedbacksByProvider(firstName);
      expect(firstRes).to.be.an("object");
      expect(firstRes)
        .to.have.a.property("feedbacks")
        .to.be.an("array")
        .to.have.lengthOf(1);

      const firstFeedback = firstRes.feedbacks[0];
      expect(firstFeedback).to.have.a.property("rating", firstRating);
      expect(firstFeedback).to.have.a.property("user").to.be.an("object");
      expect(firstFeedback.user).to.have.a.property("_id");
      expect(firstFeedback.user._id.equals(testUser._id)).to.be.true;

      const secondRes = await storage.getFeedbacksByProvider(secondName);
      expect(secondRes).to.be.an("object");
      expect(secondRes)
        .to.have.a.property("feedbacks")
        .to.be.an("array")
        .to.have.lengthOf(1);

      const secondFeedback = secondRes.feedbacks[0];
      expect(secondFeedback).to.have.a.property("rating", secondRating);
      expect(secondFeedback).to.have.a.property("user").to.be.an("object");
      expect(firstFeedback.user).to.have.a.property("_id");
      expect(secondFeedback.user._id.equals(testUser._id)).to.be.true;
    });

    it("All", async () => {
      const res = await storage.getAllFeedbacksFromAllProviders();
      expect(res)
        .to.be.an("array")
        .to.have.lengthOf(storage.providerNames.length);
      const test = res.find((f) => f.name === providerName);
      expect(test).to.not.be.null;
      const firstTest = res.find((f) => f.name === firstName);
      expect(firstTest).to.not.be.null;
      const secondTest = res.find((f) => f.name === secondName);
      expect(secondTest).to.not.be.null;
    });
  });
});

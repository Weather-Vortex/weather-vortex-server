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

const request = require("supertest");

const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const expect = chai.expect;

const { app } = require("../src/index");
const { Feedback } = require("../src/models/feedback.model");
const { Provider, providerNames } = require("../src/models/provider.model");
const User = require("../src/models/user.model");
const { createUser, createToken } = require("./utils/user.utils");
const { connection } = require("../src/config/database.connector");

describe("Test Feedbacks routes", () => {
  let testUser;
  const providerName = providerNames[0];
  let testProvider;

  beforeEach((done) => {
    // Clean database before start and add basic documents.
    connection
      .then(async () => {
        // Create user.
        await User.deleteMany({});
        const created = await createUser();
        const withToken = await createToken(created);
        testUser = withToken;

        // Get a provider provider.
        // await Provider.deleteMany({});
        // const provider = new Provider({ name: providerName });
        // testProvider = await provider.save();
        done();
      })
      .catch((error) => done(error));
  });

  const cleanFeedbackDatabase = async () => {
    await Feedback.deleteMany({});
    const provider = await Provider.findOne({ name: providerName });
    provider.feedbacks = [];
    const res = await provider.save();
    testProvider = res;
    const user = await User.findById(testUser._id);
    user.feedbacks = [];
    testUser = await user.save();
  };

  // Clean database for next tests.
  afterEach(async () => await cleanFeedbackDatabase());

  const base_url = "/feedbacks";

  describe("Create default providers", () => {
    const providers = [];

    it("Create default providers", async () => {
      const res = await request(app).get(`${base_url}`);
      expect(res).to.have.status(200);
      const results = await Promise.all(
        providerNames.map((name) => Provider.findOne({ name }))
      );
      results.forEach((found, i) => {
        expect(found).to.be.an("object");
        expect(found)
          .to.have.a.property("name")
          .to.be.a("string")
          .to.be.equals(providerNames[i]);
        providers.push(found);
      });
    });

    it("Doesn't create other providers", async () => {
      const res = await request(app).get(`${base_url}`);
      expect(res).to.have.status(200);
      const results = await Promise.all(
        providers.map((elem) => Provider.find({ name: elem.name }))
      );
      results.forEach((founds) =>
        expect(founds).to.be.an("array").to.have.lengthOf(1)
      );
    });
  });

  describe("Create a feedback", async () => {
    it("Will be created if inputs are right", async () => {
      const result = await request(app)
        .post(`${base_url}/`)
        .set("Cookie", `auth=${testUser.token}`)
        .set("Accept", "application/json")
        .send({
          rating: 4,
          provider: testProvider._id,
        });

      expect(result).to.have.status(201);
      expect(result.body).to.be.an("object");
      expect(result.body).to.have.a.property("message", "Feedback created.");
      expect(result.body).to.have.a.property("feedback").to.be.an("object");
      expect(result.body.feedback)
        .to.have.a.property("user")
        .to.be.an("object");
      expect(result.body.feedback.user)
        .to.have.a.property("firstName")
        .to.be.a("string")
        .to.be.equals("test");
      expect(result.body.feedback)
        .to.have.a.property("provider")
        .to.be.an("object");
      expect(result.body.feedback.provider)
        .to.have.a.property("name")
        .to.be.a("string")
        .to.be.equals(providerName);
    });
  });

  describe("Delete a feedback", async () => {
    it("Will not be deleted if they doesn't exists", async () => {
      const result = await request(app)
        .delete(`${base_url}/1`)
        .set("Cookie", `auth=${testUser.token}`);
      expect(result).to.have.status(500);
    });

    it("Will be deleted if they exists", async () => {
      const created = await request(app)
        .post(`${base_url}`)
        .set("Cookie", `auth=${testUser.token}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
          rating: 4,
          provider: testProvider._id,
          user: testUser._id,
        });

      const result = await request(app)
        .delete(`${base_url}/${created.body.feedback._id}`)
        .set("Cookie", `auth=${testUser.token}`);

      expect(result).to.have.status(200);
      expect(result.body).to.have.a.property("result");
      expect(result.body).to.have.a.property("message", "Feedback deleted.");
    });
  });

  describe("Get Feedbacks", () => {
    const feedbackRating = 4;
    beforeEach(async () => {
      // Add a feedback before enter a test.
      await request(app)
        .post(`${base_url}`)
        .set("Cookie", `auth=${testUser.token}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
          rating: feedbackRating,
          provider: testProvider._id,
        });
    });

    // Clean database for next tests.
    afterEach(async () => await cleanFeedbackDatabase());

    it("By provider", async () => {
      const provider = await Provider.findById(testProvider._id);
      expect(provider.feedbacks).to.have.lengthOf(1);
      const res = await request(app).get(`${base_url}/${testProvider.name}`);
      expect(res.body.results.feedbacks).to.have.lengthOf(1);
      expect(res).to.have.status(200);
    });

    it("All", async () => {
      const res = await request(app).get(`${base_url}`);
      expect(res).to.have.status(200);
      expect(res.body)
        .to.have.property("results")
        .to.be.an("array")
        .to.have.lengthOf(providerNames.length);
      expect(res.body.results[0])
        .to.have.property("feedbacks")
        .to.be.an("array")
        .to.have.lengthOf(1);
      expect(res.body.results[0].feedbacks[0]).to.have.property(
        "rating",
        feedbackRating
      );
    });
  });
});

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
const { connection } = require("../src/config/database.connector");

const { app } = require("../src/index");
const { providerNames, Provider } = require("../src/models/provider.model");
const { createUser, createToken } = require("./utils/user.utils");
const feedbackUtils = require("./utils/feedback.utils");
const { Feedback } = require("../src/models/feedback.model");
const User = require("../src/models/user.model");

describe("Test user details routes", () => {
  let testUser;
  let testProvider;

  beforeEach(async () => {
    await connection;
    const created = await createUser();
    const tokenized = await createToken(created);
    testUser = tokenized;
    testProvider = await feedbackUtils.getProvider();
  });

  afterEach(async () => await User.deleteMany({}));

  const base_url = "/users";

  describe("Get feedbacks for the user", () => {
    const rating = 3;

    beforeEach(async () => {
      await request(app)
        .post("/feedbacks")
        .set("Cookie", `auth=${testUser.token}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send({
          rating,
          provider: testProvider._id,
        });
    });

    afterEach(async () => {
      const res = await feedbackUtils.cleanFeedbackDatabase(testUser._id);
      testUser = res.cleanedUser;
      testProvider = res.cleanedProvider;
    });

    it("Get feedbacks from a real user", async () => {
      const res = await request(app).get(
        `${base_url}/${testUser._id.toString()}/feedbacks`
      );
      expect(res).to.have.status(200);
      expect(res.body)
        .to.have.a.property("feedbacks")
        .to.be.an("array")
        .to.have.lengthOf(1);
      // Check for exactly one property.
      expect(Object.keys(res.body).length).to.be.equals(1);
      expect(res.body.feedbacks[0])
        .to.be.an("object")
        .to.have.a.property("rating", rating);
    });

    it("Get feedbacks from a real user verbose", async () => {
      const res = await request(app).get(
        `${base_url}/${testUser._id.toString()}/feedbacks?verbose=true`
      );
      expect(res).to.have.status(200);
      // Check for more than one property.
      expect(Object.keys(res.body).length).to.be.equals(9);
      expect(res.body)
        .to.have.a.property("feedbacks")
        .to.be.an("array")
        .to.have.lengthOf(1);
      expect(res.body).to.have.a.property("preferred").to.be.an("object");
      expect(res.body)
        .to.have.a.property("stations")
        .to.be.an("array")
        .to.have.lengthOf(0);
      expect(res.body).to.have.a.property("firstName", "test");
      expect(res.body).to.have.a.property("lastName", "user");
      expect(res.body).to.have.a.property("email", "test.user@email.it");
      expect(res.body.feedbacks[0])
        .to.be.an("object")
        .to.have.a.property("rating", rating);
    });
  });
});

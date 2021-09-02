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
const { Provider } = require("../src/models/provider.model");
const User = require("../src/models/user.model");
const { createUser, createToken } = require("./utils/user.utils");
const { connection } = require("../src/config/database.connector");

describe("Test Feedbacks routes", () => {
  let testUser;
  let testProvider;

  before((done) => {
    connection
      .then(async () => {
        // Create user.
        await User.deleteMany({});
        const created = await createUser();
        const withToken = await createToken(created);
        testUser = withToken;

        // Create provider.
        await Provider.deleteMany({});
        const provider = new Provider({ name: "TestProvider" });
        testProvider = await provider.save();
        done();
      })
      .catch((error) => done(error));
  });

  beforeEach(async () => {
    await Feedback.deleteMany({});
  });

  const base_url = "/feedbacks";
  describe("Create a feedback", async () => {
    it("Will be created if inputs are right", async () => {
      const result = await request(app)
        .post(`${base_url}/`)
        .set("Cookie", `auth=${testUser.token}`)
        .set("Accept", "application/json")
        .send({
          rating: 4,
          providerId: testProvider._id,
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
        .to.be.a("string");
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
          providerId: testProvider._id,
          userId: testUser._id,
        });

      const result = await request(app)
        .delete(`${base_url}/${created.body.feedback._id}`)
        .set("Cookie", `auth=${testUser.token}`);

      expect(result).to.have.status(200);
      expect(result.body).to.have.a.property("result");
      expect(result.body).to.have.a.property("message", "Feedback deleted.");
    });
  });
});

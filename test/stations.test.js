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

const Station = require("../src/models/station.model");
const User = require("../src/models/user.model");

const { createUser, createToken } = require("./utils/user.utils");
const mongoose = require("mongoose");

const request = require("supertest");
const chai = require("chai");
const { app } = require("../src/index");
const chaiHttp = require("chai-http");

const expect = chai.expect;
chai.use(chaiHttp);
// chai.use(require("chai-as-promised"));

describe("Test CRUD Operations for Stations", () => {
  let testUser;

  before(async () => {
    // Create a test user as a first thing before any test.
    await User.deleteMany({});
    const created = await createUser();
    const tokenized = await createToken(created);
    testUser = tokenized;
  });

  after(async () => {
    await User.deleteMany({});
  });

  const base_url = "/stations";

  /**
   * Facility method to create a station. Use it whenever is possible instead other things, to reduce test time.
   * @returns The station.
   */
  const saveStation = async () => {
    const name = "station";
    const locality = "Cesena";
    const station = new Station({
      authKey: "12341234123412341234123412341234",
      name,
      owner: testUser._id,
      position: {
        locality,
      },
      url: "https://iot-weather-simulator.herokuapp.com/info",
    });
    const saved = await station.save();
    expect(saved).to.be.an("object");
    expect(saved).to.have.a.property("name", "station");
    return station;
  };

  /**
   * Facility method to create a station, then change a data to make it fake (the name in this case).
   * @returns The fake station.
   */
  const fakeStation = async () => {
    const station = await saveStation();
    station.name = "impossibile";
    station._id = new mongoose.Types.ObjectId();
    return station;
  };

  beforeEach((done) => {
    Station.deleteMany({}, (err, res) => {
      if (err) {
        done(err);
      } else {
        done();
      }
    });
  });

  describe("POST a new station", () => {
    it("Save a station", async () => {
      const station = {
        authKey: "12341234123412341234123412341234",
        name: "station",
        owner: testUser._id,
        position: {
          locality: "Cesena",
        },
        url: "https://iot-weather-simulator.herokuapp.com/info",
      };
      const result = await request(app)
        .post(`${base_url}`)
        .set("Content-Type", "application/json")
        .set("Cookie", `auth=${testUser.token}`)
        .set("Accept", "application/json")
        .send(station);

      expect(result).to.have.status(200);
      expect(result).to.be.an("object");
      expect(result.body).to.have.a.property("result", true);
      expect(result.body).to.have.a.property("saved").to.be.an("object");
      expect(result.body.saved).to.have.a.property("authKey", station.authKey);
      expect(result.body.saved).to.have.a.property("name", station.name);
      expect(result.body.saved).to.have.a.property(
        "owner",
        station.owner.toString()
      );
      expect(result.body.saved).to.have.a.nested.property(
        "position.locality",
        station.position.locality
      );
    });
  });

  describe("GET one or more stations", () => {
    beforeEach(async () => await Station.deleteMany({}));

    it("Without stations", async () => {
      const res = await request(app)
        .get(`${base_url}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json");

      expect(res).to.have.status(404);
      expect(res).to.be.an("object");
      expect(res.body).to.have.a.property("result", false);
      expect(res.body).to.have.a.property(
        "message",
        "No Stations found with given filter."
      );
    });

    it("Get a saved station", async () => {
      // First assure that a station exists.
      const station = await saveStation();

      const result = await request(app)
        .get(`${base_url}/${station._id}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json");

      expect(result).to.have.status(200);
      expect(result).to.have.a.property("body");
      expect(result.body)
        .to.be.an("object")
        .to.have.a.property("result")
        .to.be.an("object");
      expect(result.body).to.not.have.a.nested.property(
        "result.authKey",
        station.authKey
      );
      expect(result.body).to.have.a.nested.property(
        "result.name",
        station.name
      );
      expect(result.body).to.have.a.nested.property(
        "result.owner",
        station.owner.toString()
      );
      expect(result.body).to.have.a.nested.property(
        "result.position.locality",
        station.position.locality
      );
    });

    it("GET a saved station populated", async () => {
      const station = await saveStation();
      const result = await request(app)
        .get(`${base_url}/${station._id}?populate=true`)
        .set("Cookie", `auth=${testUser.token}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json");

      expect(result).to.have.status(200);
      expect(result).to.have.a.property("body");
      expect(result.body)
        .to.be.an("object")
        .to.have.a.property("result")
        .to.be.an("object");
      expect(result.body)
        .to.have.a.nested.property("result.owner")
        .to.be.an("object");
      expect(result.body.result.owner).to.have.a.property("firstName", "test");
      expect(result.body.result.owner).to.have.a.property("lastName", "user");
    });
  });

  describe("PUT: update a station", () => {
    beforeEach(async () => await Station.deleteMany({}));

    it("Try to update a station that not exists", async () => {
      // First assure that a station exists and change its name.
      const station = await fakeStation();

      const result = await request(app)
        .put(`${base_url}/${station._id}`)
        .set("Content-Type", "application/json")
        .set("Cookie", `auth=${testUser.token}`)
        .set("Accept", "application/json");

      expect(result).to.have.status(404);
      expect(result).to.have.a.property("body");
      expect(result.body).to.have.a.property(
        "message",
        "PUT request: resource not found."
      );
    });

    it("Try to update an existing station", async () => {
      // First assure that a station exists.
      const station = await saveStation();

      const result = await request(app)
        .put(`${base_url}/${station._id}`)
        .set("Content-Type", "application/json")
        .set("Cookie", `auth=${testUser.token}`)
        .set("Accept", "application/json")
        .send({
          name: "Put station",
        });

      expect(result).to.have.status(200);
      expect(result.body).to.have.a.property("result", true);
      expect(result.body).to.have.a.nested.property(
        "update.name",
        "Put station"
      );
      expect(result.body).to.have.a.nested.property(
        "station.name",
        "Put station"
      );
    });
  });

  describe("DELETE: delete a station", () => {
    beforeEach(async () => await Station.deleteMany({}));

    it("Try to delete a station that not exists", async () => {
      // First assure that a station exists and change its name.
      const station = await fakeStation();

      const result = await request(app)
        .delete(`${base_url}/${station._id}`)
        .set("Content-Type", "application/json")
        .set("Cookie", `auth=${testUser.token}`)
        .set("Accept", "application/json");
      expect(result).to.have.status(200);
      expect(result.body)
        .to.be.an("object")
        .to.have.a.nested.property("station.deletedCount", 0);
    });

    it("Try to delete a station that exists", async () => {
      // First assure that a station exists.
      const station = await saveStation();

      const result = await request(app)
        .delete(`${base_url}/${station._id}`)
        .set("Content-Type", "application/json")
        .set("Cookie", `auth=${testUser.token}`)
        .set("Accept", "application/json");
      expect(result).to.have.status(200);
      expect(result.body)
        .to.be.an("object")
        .to.have.a.nested.property("station.deletedCount", 1);
    });
  });
});

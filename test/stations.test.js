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
const mongoose = require("mongoose");

const request = require("supertest");
const chai = require("chai");
const app = require("../src/index");

const expect = chai.expect;
chai.use(require("chai-http"));
chai.use(require("chai-as-promised"));

describe("Test CRUD Operations for Stations", () => {
  const base_url = "/station";
  let testUser;

  before(async () => {
    // Create a test user as a first thing before any test.
    testUser = await createUser();
  });

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

  after(async () => {
    // Delete the test user after all tests.
    await User.deleteMany(testUser);
  });

  beforeEach(async () => {
    await Station.deleteMany({});
  });

  it("Without stations", async () => {
    const res = await request(app)
      .get(`${base_url}/`)
      .set("Connection", "keep alive")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    expect(res).to.have.status(500);
    expect(res).to.be.an("object");
    expect(res.body).to.have.a.property("result", false);
    expect(res.body).to.have.a.nested.property(
      "error.message",
      "Stations with given filters weren't found"
    );
  });

  it("Save a station", async () => {
    const station = {
      authKey: "12341234123412341234123412341234",
      name: "station",
      owner: testUser._id,
      position: {
        locality: "Cesena",
      },
    };
    const result = await request(app)
      .post(`${base_url}`)
      .set("Connection", "keep alive")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(station);

    expect(result).to.have.status(200);
    expect(result).to.be.an("object");
    expect(result.body).to.have.a.property("result", true);
    expect(result.body).to.have.a.property("saved");
    expect(result.body.saved).to.be.an("object");
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
    });
    const saved = await station.save();
    expect(saved).to.be.an("object");
    expect(saved).to.have.a.property("name", "station");
    return station;
  };

  it("Get a saved station", async () => {
    const station = await saveStation();

    console.log("Station:", station);
    const result = await request(app)
      .get(`${base_url}/${station.name}`)
      .set("Connection", "keep alive")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    console.error(result.error);

    expect(result).to.have.status(200);
    expect(result).to.have.a.property("body");
    expect(result.body).to.be.an("object");
    expect(result.body).to.have.a.property("authKey", station.authKey);
    expect(result.body).to.have.a.property("name", station.name);
    expect(result.body).to.have.a.property("owner", station.owner.toString());
    expect(result.body).to.have.a.nested.property(
      "position.locality",
      station.position.locality
    );
  });
});

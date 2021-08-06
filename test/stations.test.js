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

const model = require("../src/models/station.model");
const storage = require("../src/storages/station.storage");

const request = require("supertest");
const chai = require("chai");
const app = require("../src/index");

const expect = chai.expect;
chai.use(require("chai-http"));
chai.use(require("chai-as-promised"));

describe("Test CRUD Operations for Stations", () => {
  const base_url = "/station";

  beforeEach(async () => {
    await model.deleteMany({});
  });

  it("Without stations", async () => {
    const locality = "locality";
    const res = await request(app)
      .get(`${base_url}/Cesena`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    expect(res).to.have.status(404);
    expect(res).to.be.an("object");
    expect(res.body).to.have.a.nested.property("result", false);
    expect(res.body).to.have.a.nested.property("locality", locality);
    expect(res.body).to.have.a.nested.property(
      "message",
      "Stations not found."
    );
  });

  it("Save a station", async () => {
    const station = {
      authKey: "12341234123412341234123412341234",
      name: "station",
      owner: "1",
      position: {
        locality: "Cesena",
      },
    };
    const result = await result(app)
      .post(`${base_url}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(station);

    expect(result).to.have.status(200);
    expect(result).to.be.an("object");
    expect(result.body).to.have.a.property("result", true);
    expect(result.body).to.have.a.property("saved", station);
    const saved = result.body.saved;
    expect(saved).to.be.an("object");
  });
});

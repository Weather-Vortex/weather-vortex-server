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
const { app } = require("../src/index");
const locationModel = require("../src/models/location.model");

chai.use(chaiHttp);
const expect = chai.expect;

describe("GET forecasts for Cesena", () => {
  beforeEach(async () => {
    await locationModel.deleteMany({});
  });

  const base_url = "/forecast";
  it("responds with unsuccessful result", async () => {
    const result = await request(app)
      .get(base_url + "/1234")
      .set("content-type", "application/json");

    expect(result).have.status(400);
    expect(result).to.be.an("object", "We expect that result is an object");
    expect(result).to.have.a.nested.property("error.text");
  });

  it("responds with successful result", async () => {
    const result = await request(app)
      .get(base_url + "/Cesena")
      .set("content-type", "application/json")
      .set("Accept", "application/json");

    expect(result).to.have.status(200);
    expect(result).to.be.an("object", "We expect that result is an object");
    const body = result.body;
    expect(result.body).to.have.a.property("tro");
    expect(body).to.have.a.property("owm");
    const tro = body.tro;
    tro.forEach((each) => {
      expect(each).to.have.a.property("time").to.be.a("string");
      expect(each)
        .to.be.an("object")
        .to.have.a.property("weatherDescription")
        .to.be.a("string").to.be.not.null;
    });
    const owm = body.owm;
    owm.forEach((each, index) => {
      expect(each)
        .to.have.a.property("time")
        .to.be.equals(
          tro[index].time,
          "Times between providers are not equals"
        );
      expect(each)
        .to.be.an("object")
        .to.have.a.property("weatherDescription")
        .to.be.a("string").to.be.not.null;
    });
  }, 2) // Retry at least one more time after fail
    .timeout(10000); // This test need more time.
});

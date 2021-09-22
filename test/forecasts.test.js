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
const userUtils = require("./utils/user.utils");

chai.use(chaiHttp);
const expect = chai.expect;

const base_url = "/forecast";

describe("GET forecasts for Cesena", () => {
  beforeEach(async () => {
    await locationModel.deleteMany({});
  });

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
    expect(tro)
      .to.be.an("object")
      .to.have.a.property("provider", "Troposphere");
    expect(tro).to.have.a.property("forecast").to.be.an("array");
    tro.forecast.forEach((each) => {
      expect(each).to.have.a.property("time").to.be.a("string");
      expect(each)
        .to.be.an("object")
        .to.have.a.property("weatherDescription")
        .to.be.a("string").to.be.not.null;
    });
    const owm = body.owm;
    expect(owm)
      .to.be.an("object")
      .to.have.a.property("provider", "Open Weather Map");
    expect(owm).to.have.a.property("forecast").to.be.an("array");
    owm.forecast.forEach((each, index) => {
      expect(each)
        .to.have.a.property("time")
        .to.be.equals(
          tro.forecast[index].time,
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

describe("Notify users with emails", () => {
  let tester;

  beforeEach(async () => {
    tester = await userUtils.createUser();
  });

  afterEach(async () => await userUtils.cleanTesters());

  it("Trigger email notification", async () => {
    const result = await request(app)
      .get(`${base_url}/notify`)
      .set("content-type", "application/json")
      .set("accept", "application/json");

    expect(result).to.have.status(200);
    expect(result.body).to.be.an("object").to.have.a.property("result", "ok");
  }).timeout(20000);
});

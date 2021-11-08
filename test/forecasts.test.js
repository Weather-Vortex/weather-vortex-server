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
const nock = require("nock");
const { app } = require("../src/index");
const { getLocationDataByCity } = require("../src/storages/location.storage");
const Location = require("../src/models/location.model");
const userUtils = require("./utils/user.utils");
const { saveMockCity } = require("./utils/location.utils");

chai.use(chaiHttp);
const expect = chai.expect;

const base_url = "/forecast";

describe("GET forecasts for Cesena", () => {
  beforeEach(async () => {
    await Location.deleteMany({}).exec();
  });

  describe("Without a failure", () => {
    it("responds with unsuccessful result", async () => {
      const result = await request(app)
        .get(base_url + "/1234")
        .set("content-type", "application/json");

      expect(result).have.status(400);
      expect(result).to.be.an("object", "We expect that result is an object");
      expect(result).to.have.a.nested.property("error.text");
    });

    describe("responds with successful result", () => {
      it("with simple current forecast request by location", async () => {
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

      it("with three days forecast request by location", async () => {
        const result = await request(app)
          .get(base_url + "/Cesena/threedays")
          .set("content-type", "application/json")
          .set("Accept", "application/json");

        expect(result).to.have.status(200);
      });

      it("with current forecast request by location", async () => {
        const result = await request(app)
          .get(base_url + "/Cesena/current")
          .set("content-type", "application/json")
          .set("Accept", "application/json");

        expect(result).to.have.status(200);
      });

      it("with simple three days forecast request by geolocation", async () => {
        const result = await request(app)
          .get(base_url + "/14,15")
          .set("content-type", "application/json")
          .set("Accept", "application/json");

        expect(result).to.have.status(200);
      });

      it("with current forecast request by geolocation", async () => {
        const result = await request(app)
          .get(base_url + "/14,15/current")
          .set("content-type", "application/json")
          .set("Accept", "application/json");

        expect(result).to.have.status(200);
      });

      it("with three days forecast request by geolocation", async () => {
        const result = await request(app)
          .get(base_url + "/14,15/threedays")
          .set("content-type", "application/json")
          .set("Accept", "application/json");

        expect(result).to.have.status(200);
      });
    });
  });

  describe("With a failure", () => {
    beforeEach(async () => {
      // Fill database with Cesena data before.
      await saveMockCity();
    });

    afterEach(async () => {
      await Location.deleteMany({}).exec();
      nock.cleanAll();
      nock.restore();
    });

    it("doesn't crash if one provider stop to work", async () => {
      nock("https://api.troposphere.io")
        .get(/^\/forecast(.)*/)
        .reply(400, { error: "Usage limit reached", data: null });
      const result = await request(app).get(base_url + "/Cesena/current");
      expect(result).to.have.status(200);
      const body = result.body;
      expect(body).to.have.a.property("tro");
      const tro = body.tro;
      expect(tro)
        .to.be.an("object")
        .to.have.a.property("provider", "Troposphere");
      expect(tro)
        .to.be.an("object")
        .to.have.a.property("error")
        .to.be.an("object");
      expect(body).to.have.a.property("owm");
      const owm = body.owm;
      expect(owm)
        .to.be.an("object")
        .to.have.a.property("provider", "Open Weather Map");
    });
  });
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

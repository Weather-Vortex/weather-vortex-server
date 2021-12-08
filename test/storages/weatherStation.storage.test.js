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

const chai = require("chai");
chai.use(require("chai-as-promised"));
const { expect } = chai;
const nock = require("nock");

const {
  StationProvider,
  ForecastError,
} = require("../../src/storages/stationProvider.storage");

describe("Test Weather Station Provider", () => {
  const url = "http://example.com";

  describe("Construction of Weather Station", () => {
    it("Test failing combinations", () => {
      const provider = new StationProvider(url, "1", "station");
      expect(provider).to.be.an("object");
      expect(provider).to.have.a.property("name", "station");
    });
  });

  describe("Require current forecasts", () => {
    const path = "/current";
    let provider;
    const query = new URLSearchParams();
    query.set("authkey", 1);

    beforeEach((done) => {
      nock.cleanAll();
      nock.restore();
      nock.activate();
      provider = new StationProvider(`${url}${path}`, "1", "station");
      done();
    });

    it("Check temp fields", async () => {
      nock(url)
        .get(path)
        .query(query)
        .reply(200, {
          data: {
            time: new Date(),
            temp: 24,
          },
        });
      const result = await provider.current();
      expect(result).to.be.an("object");
      expect(result).to.have.a.property("temp", 24);
    });

    it("Check for missing time value", async () => {
      const forecast = {
        temp: 24,
      };
      nock(url).get(path).query(query).reply(200, {
        data: forecast,
      });
      const func = () => provider.current();
      await expect(func())
        .to.eventually.be.rejectedWith(
          ForecastError,
          "[Error] received corrupted package from a station."
        )
        .and.be.an.instanceOf(ForecastError)
        .and.have.a.deep.property("forecast", forecast);
    });
  });
});

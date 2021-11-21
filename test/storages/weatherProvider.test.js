/*
Web server for Weather Vortex project.
Copyright (C) 2021  Daniele Tentoni

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

const { WeatherProvider } = require("../../src/storages/weatherProvider");

const chai = require("chai");
const { expect } = chai;

const chaiAsPromised = require("chai-as-promised"); // Used for async tests.
chai.use(chaiAsPromised);

const nock = require("nock"); // Used to mocking http calls.

const base_url = "https://github.com";
const res_url = "/forecast/Cesena";
const api_key = "11";
const sample_data = {
  forecast: {
    rain: false,
    temp: 36,
  },
};

let provideProvider;

describe("Construct a new provider", () => {
  describe("Test base_url validation", () => {
    const sharedHostname = "//aaa.com";
    /**
     * Generate a new constructor for a weather provider.
     * @param {String} protocol internet protocol to use with hostname to validate.
     * @param {String} hostname hostname to use with protocol to validate.
     * @returns constructor function.
     */
    const providerConstruction = (protocol, hostname) => {
      const url = protocol.concat(hostname);
      const fake_api_key = "1";
      return () => new WeatherProvider(url, fake_api_key);
    };

    it("Try to construct a new URL with some invalid protocols", async () => {
      const protocols = ["ftp:", "ssh:"];
      protocols.forEach((protocol) => {
        const constructor = providerConstruction(protocol, sharedHostname);
        expect(constructor).to.throw(Error, /protocol/);
      });
    });

    it("Fail to construct a new provider without base_url", async () => {
      const constructor = providerConstruction("http:", "");
      expect(constructor).to.throw(Error, "Invalid URL: ");
    });

    it("Fail to construct a new provider without any piece.", async () => {
      const constructor = providerConstruction("", "");
      expect(constructor).to.throw(Error, "Invalid URL: ");
    });

    it("try to construct a new URL with some valid protocols", async () => {
      const protocols = ["http:", "https:"];
      protocols.forEach((protocol) => {
        const constructor = providerConstruction(protocol, sharedHostname);
        const provider = constructor();
        expect(provider).to.be.an("object").to.have.a.property("internalUrl");
      });
    });
  });
});

describe("Get forecast for a simple provider", () => {
  beforeEach(() => {
    provideProvider = (url) => new WeatherProvider(url, api_key);
    if (!nock.isActive()) {
      nock.activate();
    }
  });

  afterEach(() => {
    nock.cleanAll();
    nock.restore();
  });

  describe("using new get request function", async () => {
    // From now on, Nock will intercept each get request to this url.
    const nockTests = (times) =>
      nock(base_url)
        .get(`${res_url}?${api_key}`)
        .times(times)
        .reply(200, sample_data);

    it("responds with a successful result", async () => {
      nockTests(1);
      const provider = provideProvider(base_url);
      const { data } = await provider.makeRequest(res_url);
      expect(data).to.be.an("object");
      expect(data).to.have.a.nested.property("forecast.rain", false);
      expect(data).to.have.a.nested.property("forecast.temp", 36);
    });

    it("responds with a successful result many times", async () => {
      nockTests(2);
      const provider = provideProvider(base_url);
      const first = provider.makeRequest(res_url);
      const second = provider.makeRequest(res_url);

      const data = await Promise.all([first, second]);
      data.map((val) => {
        expect(val).to.be.an("object");
        expect(val).to.have.a.nested.property("data.forecast.rain", false);
        expect(val).to.have.a.nested.property("data.forecast.temp", 36);
      });
    });
  });

  describe("fail when call a fake domain", () => {
    it("that doesn't exists", async () => {
      const fake = "called fake domain";
      const grigri = "Ah Ah!";
      nock(base_url)
        .get(`${res_url}?${api_key}`)
        .once()
        .reply(400, { error: fake, data: grigri });
      const provider = provideProvider(base_url);
      try {
        await provider.makeRequest(res_url);
      } catch (error) {
        if (error && error.response && error.response.data) {
          expect(error).to.have.a.nested.property("response.data.error", fake);
          expect(error).to.have.a.nested.property("response.data.data", grigri);
        }
      }
    });
  });
});

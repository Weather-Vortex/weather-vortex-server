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
const { expect } = require("chai");
const nock = require("nock"); // Used to mocking http calls.

const base_url = "https://weather.provider.com";
const res_url = "/forecast/Cesena";
const api_key = "&11";
const sample_data = {
  forecast: {
    rain: false,
    temp: 36,
  },
};
// From now on, Nock will intercept each get request to this url.
nock(base_url).get(`${res_url}${api_key}`).times(4).reply(200, sample_data);

const providerProvider = (url) => new WeatherProvider(url, api_key);

describe("Get forecast for a simple provider", () => {
  describe("using old get result function", () => {
    it.skip("responds with a successful result", async () => {
      const provider = providerProvider(base_url);
      const result = await provider.fourDayForecast(res_url);
      expect(result).to.be.an("object");
      expect(result).to.have.a.nested.property("forecast.rain", false);
      expect(result).to.have.a.nested.property("forecast.temp", 36);
    });
  });

  describe("using new get request function", async () => {
    it("responds with a successful result", async () => {
      const provider = providerProvider(base_url);
      const { data } = await provider.makeRequest(res_url);
      expect(data).to.be.an("object");
      expect(data).to.have.a.nested.property("forecast.rain", false);
      expect(data).to.have.a.nested.property("forecast.temp", 36);
    });

    it("responds with a successful result many times", async () => {
      const provider = providerProvider(base_url);
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

  nock(base_url).get(res_url).reply(500);
  describe("fail when call a fake domain", () => {
    it.skip("that doesn't exists", async () => {
      const provider = providerProvider(base_url);
      const fake = await provider.makeRequest(res_url);
      expect(fake).to.be.an("array");
    });
  });
});

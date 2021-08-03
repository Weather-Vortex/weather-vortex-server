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

const { WeatherProvider } = require("../../src/storages/weatherProvider");
const expect = require("chai").expect;
const nock = require("nock"); // Used to mocking http calls.

const base_url = "https://weather.provider.com";
const res_url = "/forecast";
const api_key = "11";
const sample_data = {
  forecast: {
    rain: false,
    temp: 36,
  },
};
// From now on, Nock will intercept each get request to this url.
nock(base_url).get(res_url).reply(200, sample_data);

describe("Get forecast for a simple provider", () => {
  it("responds with a successful result", async () => {
    const provider = new WeatherProvider(base_url, api_key);
    const final_url = base_url + res_url + "";
    const result = await provider.fourDayForecast(final_url);
    console.log(result);
    expect(result).to.be.an("object");
    expect(result).to.have.a.nested.property("forecast.rain", false);
    expect(result).to.have.a.nested.property("forecast.temp", 36);
  });
});

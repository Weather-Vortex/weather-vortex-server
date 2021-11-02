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

const Location = require("../../src/models/location.model");
const {
  getLocationDataByCity,
} = require("../../src/storages/location.storage");
const locationUtils = require("../utils/location.utils");

const chai = require("chai");
const { expect } = chai;

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const { connection } = require("../../src/config/database.connector");

const nock = require("nock");

const troposphereUrl = "https://api.troposphere.io";
const rimininelloUrl = `/place/name/Rimininello?token=${process.env.TROPOSPHERE_API_KEY}`;
const rimininelloData = {
  error: null,
  data: [
    {
      id: 8972789,
      name: "Rimininello",
      latitude: 42.46964,
      longitude: 11.62925,
      continent: "EU",
      country: "Italy",
      countryEmoji: "🇮🇹",
      admin1: "Latium",
      admin2: "Provincia di Viterbo",
      admin3: "Canino",
      admin4: null,
      type: "place",
    },
  ],
};
const cccUrl = `/place/name/CCC?token=${process.env.TROPOSPHERE_API_KEY}`;
const cccData = { error: null, data: [] };

describe("Ask for a Location", () => {
  beforeEach(async () => {
    // Clean database.
    await connection;
    await Location.deleteMany({}).exec();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.restore();
  });

  it("That exists in real world.", async () => {
    const city_name = "Paris";
    const result = await getLocationDataByCity(city_name);
    expect(result).to.be.an("object").to.have.a.property("name", city_name);
  });

  it("that exists", async () => {
    nock(troposphereUrl).get(rimininelloUrl).reply(200, rimininelloData);
    const city_name = "Rimininello";
    const result = await getLocationDataByCity(city_name);

    expect(result).to.be.an("object");
    expect(result).to.have.a.property("id");
    expect(result).to.have.a.property("name", city_name);
    expect(result).to.have.a.nested.property("position.latitude", 42.46964);
    expect(result).to.have.a.nested.property("position.longitude", 11.62925);
  });

  // Skip since we don't manage many city anymore.
  it.skip("that have many similar names", async () => {
    const city_name = "Cesena";
    const result = await getLocationDataByCity(city_name);
    expect(result).to.be.an("object");
    expect(result).to.have.a.property("result", true);
    expect(result).to.have.a.property("added");
    expect(result.added).to.have.a.property("id");
    expect(result.added).to.have.a.property("name", city_name);
    expect(result.added).to.have.a.property("position");
    expect(result.added).to.have.a.nested.property(
      "position.latitude",
      42.46964
    );
    expect(result.added).to.have.a.nested.property(
      "position.longitude",
      11.62925
    );
  });

  it("that not exists", async () => {
    nock(troposphereUrl).get(cccUrl).reply(200, cccData);
    const city_name = "CCC";
    const result = getLocationDataByCity(city_name);
    await expect(result).to.be.rejectedWith(Error);
  });

  it("that have an already cached result", async () => {
    // Set fake data and check if retrieved data are those or another.
    const res = await locationUtils.saveMockCity();
    expect(res).to.be.an("object");
    expect(res).to.have.a.nested.property(
      "position.latitude",
      locationUtils.cesenaMockData.position.latitude
    );
    expect(res).to.have.a.nested.property(
      "position.longitude",
      locationUtils.cesenaMockData.position.longitude
    );
    nock(troposphereUrl).get(cccUrl).reply(200, cccData);
    const result = await getLocationDataByCity(
      locationUtils.cesenaMockData.name
    );
    expect(result).to.be.an("object");
    expect(result).to.have.a.property(
      "name",
      locationUtils.cesenaMockData.name
    );
    expect(result).to.have.a.nested.property(
      "position.latitude",
      locationUtils.cesenaMockData.position.latitude
    );
    expect(result).to.have.a.nested.property(
      "position.longitude",
      locationUtils.cesenaMockData.position.longitude
    );
  });

  it("that retrieve remote data if not in cache", async () => {
    const res = await locationUtils.saveMockCity();
    expect(res)
      .to.be.an("object")
      .to.have.a.property("name", locationUtils.cesenaMockData.name);
    nock(troposphereUrl).get(cccUrl).reply(200, cccData);
    const result = await getLocationDataByCity("Rimininello");
    expect(result).to.be.an("object");
    expect(result).to.have.a.property("name", "Rimininello");
    expect(result).to.have.a.nested.property(
      "position.latitude",
      rimininelloData.data[0].latitude
    );
    expect(result).to.have.a.nested.property(
      "position.longitude",
      rimininelloData.data[0].longitude
    );
  });
});

/*
### Final thoughts.

If there's the problem of api usage quota limits, use the following code.
```js
if (result.error?.error === "Usage limit reached") {
  // If we reach the api quota, don't mark the test as failed.
  assert.ok(true);
  return;
}
```
*/

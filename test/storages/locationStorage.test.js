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

const Location = require("../../src/models/location.model");
const {
  getLocationDataByCity,
} = require("../../src/storages/location.storage");
const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-as-promised"));

describe("Ask for a Location", () => {
  beforeEach(async () => {
    // Clean database.
    await Location.deleteMany({}).exec();
  });

  it("that exists", async () => {
    const city_name = "Rimininello";
    const result = await getLocationDataByCity(city_name);
    expect(result).to.be.an("object");
    expect(result).to.have.a.property("id");
    expect(result).to.have.a.property("name", city_name);
    expect(result).to.have.a.property("position");
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
    const city_name = "CCC";
    // const expectedError = new Error("No location found");
    const result = getLocationDataByCity(city_name);
    await expect(result).to.be.rejectedWith(Error);
    // expect(() => result).to.throw(expectedError, "location");
  });
});

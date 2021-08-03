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

const {
  getLocationDataByCity,
} = require("../../src/storages/location.storage");
const expect = require("chai").expect;

describe("Ask for a Location", () => {
  it("that exists", async () => {
    const city_name = "Rimininello";
    const result = await getLocationDataByCity(city_name);
    expect(result).to.be.an("object");
    expect(result.error).to.be.null;
    const data = result.data;
    expect(data).to.be.an("array").with.length(1);
    const first = data[0];
    expect(first).to.be.an("object");
    expect(first).to.have.a.property(
      "name",
      city_name,
      "Expected to be equal to the city requested."
    );
    expect(first).to.have.a.property("country", "Italy");
    expect(first).to.have.a.property("continent", "EU");
  });

  it("that have many similar names", async () => {
    const city_name = "Cesena";
    const result = await getLocationDataByCity(city_name);
    expect(result).to.be.an("object");
    expect(result.error).to.be.null;
    const data = result.data;
    expect(data).to.be.an("array").with.length(9);
    const cesene = data.filter((val) => val.name === city_name);
    expect(cesene).to.be.an("array").with.length(1);
    const cesena = cesene[0];
    expect(cesena).to.be.an("object");
    expect(cesena).to.have.a.property("name", city_name);
  });

  it("that not exists", async () => {
    const city_name = "CCC";
    const result = await getLocationDataByCity(city_name);
    expect(result).to.be.an("object");
    expect(result).to.have.a.property("error", 404);
    expect(result).to.have.a.property("message", "No location found");
    expect(result).to.have.a.property("name", city_name);
  });
});

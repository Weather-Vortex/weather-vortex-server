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
const { expect } = chai;

const codes = require("../../src/storages/data/conditionCodes");

describe("Condition codes", () => {
  it("Print codes", () => {
    const code = 300;
    const owm = codes.openWeatherMap.get(code);
    expect(owm).to.be.an("object");
    expect(owm).to.have.a.property("main").to.be.equals("Drizzle");
    const v = codes.vortex.get(owm.vortex);
    expect(v).to.be.an("object");
    expect(v)
      .to.have.a.property("description")
      .to.be.equals("Light intensity drizzle");
  });
});

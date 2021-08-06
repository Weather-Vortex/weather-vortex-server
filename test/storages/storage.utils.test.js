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

const utils = require("../../src/storages/storage.utils");
const assert = require("chai").assert;

describe("Check if params contains a string", () => {
  it("Try without an arg value", (done) => {
    const arg = undefined;
    const res = utils.checkCityNameType(arg);
    assert.typeOf(res, "boolean", "Result is boolean");
    assert.equal(res, false, "Arg should be invalid");
    done();
  });

  it("Try without a city_name value", (done) => {
    const arg = { params: undefined };
    const res = utils.checkCityNameType(arg);
    assert.typeOf(res, "boolean", "Result is boolean");
    assert.equal(res, false, "Arg should be invalid");
    done();
  });

  it("Try with a city name number value", (done) => {
    const arg = { params: { locality: undefined } };
    const res = utils.checkCityNameType(arg);
    assert.typeOf(res, "boolean", "Result is boolean");
    assert.equal(res, false, "Arg should be invalid");
    done();
  });

  it("Try with a city name number value", (done) => {
    const arg = { params: { locality: 1 } };
    const res = utils.checkCityNameType(arg);
    assert.typeOf(res, "boolean", "Result is boolean");
    assert.equal(res, false, "Arg should be invalid");
    done();
  });

  it("Try with a city_name string and number value", (done) => {
    const arg = { params: { locality: "1" } };
    const res = utils.checkCityNameType(arg);
    assert.typeOf(res, "boolean", "Result is boolean");
    assert.equal(res, false, "Arg should be invalid");
    done();
  });

  it("Try with an only city_name string value", (done) => {
    const arg = { params: { locality: "Cesena" } };
    const res = utils.checkCityNameType(arg);
    assert.typeOf(res, "boolean", "Result is boolean");
    assert.equal(res, true, "Arg should be invalid");
    done();
  });
});

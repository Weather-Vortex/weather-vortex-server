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

const {
  TroposphereProvider,
} = require("../../src/storages/troposhpere.storage");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { expect } = chai;

const nock = require("nock");

const troposphere_url = "url";
const res_url = "url";
const api_key = "";
const sample_data = {};

describe("Test Troposphere Weather Provider", () => {
  describe("Construction of the Troposphere Provider", () => {
    it("Test failing combinations", () => {
      const res = null;
    });
  });
});

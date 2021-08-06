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

const request = require("supertest");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/index");

chai.use(chaiHttp);
const expect = chai.expect;

describe("GET forecasts for Cesena", () => {
  const base_url = "/forecast";
  it("responds with unsuccessful result", async () => {
    const result = await request(app)
      .get(base_url + "/1234")
      .set("content-type", "application/json");

    expect(result).have.status(400);
    expect(result).to.be.an("object", "We expect that result is an object");
    expect(result).to.have.a.nested.property("error.text");
  });

  it("responds with successful result", async () => {
    const result = await request(app)
      .get(base_url + "/Cesena")
      .set("content-type", "application/json")
      .set("Accept", "application/json");

    expect(result).have.status(200);
    expect(result).to.be.an("object", "We expect that result is an object");
    expect(result.body).to.have.a.property("owm");
    expect(result.body).to.have.a.property("tro");
  }).timeout(5000); // This test need more time.
});

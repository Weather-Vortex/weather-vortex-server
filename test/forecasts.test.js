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
const assert = require("assert");
const app = require("../src/index");

describe("GET forecasts for Cesena", () => {
  const base_url = "/forecast";
  it("responds with unsuccessful result", (done) => {
    request(app)
      .get(base_url + "/1234")
      .expect(400)
      .end((error, result) => {
        if (error) {
          done(error);
        }
        done();
      });
  });

  it("responds with successful result", (done) => {
    request(app)
      .get(base_url + "/Cesena,Italy")
      .expect(200)
      .end((error, result) => {
        if (error) {
          done(error);
        }
        done();
      });
  });
});

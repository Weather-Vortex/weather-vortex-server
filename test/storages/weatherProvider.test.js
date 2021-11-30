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

const chai = require("chai");
const { expect } = chai;

const chaiAsPromised = require("chai-as-promised"); // Used for async tests.
chai.use(chaiAsPromised);

const nock = require("nock"); // Used to mocking http calls.

const base_url = "https://github.com";
const res_url = "/forecast/Cesena";
const api_key = "11";
const sample_data = {
  forecast: {
    rain: false,
    temp: 36,
  },
};

let provideProvider;

describe("Test Weather Provider functionalities", () => {
  describe("Construct a new provider", () => {
    /**
     * Generate a new constructor for a weather provider.
     * Using this function let you to test missing protocols or hostnames cases.
     * @param {String} protocol internet protocol to use with hostname to validate.
     * @param {String} hostname hostname to use with protocol to validate.
     * @returns constructor function.
     */
    const providerConstruction = (protocol, hostname) => {
      const url = protocol.concat(hostname);
      const fake_api_key = "1";
      return () => new WeatherProvider(url, fake_api_key);
    };

    describe("Test failing combinations", () => {
      const sharedHostname = "//aaa.com";
      const validProtocols = ["http:", "https:"];
      const invalidProtocols = ["ftp:", "ssh:"];

      it("Try to construct a new URL with some invalid protocols", async () => {
        invalidProtocols.forEach((protocol) => {
          const constructor = providerConstruction(protocol, sharedHostname);
          expect(constructor).to.throw(Error, /protocol/);
        });
      });

      it("Fail to construct a new provider without base_url", async () => {
        const constructor = providerConstruction("http:", "");
        expect(constructor).to.throw(Error, "Invalid URL: ");
      });

      it("Fail to construct a new provider without any piece.", async () => {
        const constructor = providerConstruction("", "");
        expect(constructor).to.throw(Error, "Invalid URL: ");
      });

      it("try to construct a new URL with some valid protocols", async () => {
        validProtocols.forEach((protocol) => {
          const constructor = providerConstruction(protocol, sharedHostname);
          const provider = constructor();
          expect(provider)
            .to.be.an("object")
            .to.have.a.property("internal_url");
        });
      });
    });
  });

  describe("Format requests", () => {
    let provider;
    const url = "http://aaa.com";
    const slash = "/";

    /**
     * Create a new Weather Provider.
     * @param {Boolean} hasSlash Define if the base url of generated provider has to have an ending url or not.
     * @returns {WeatherProvider} Weather Provider generated.
     */
    const createSimpleProvider = (hasSlash) =>
      new WeatherProvider(hasSlash ? `${url}${slash}` : url, "1");

    describe("Try to compose different urls", () => {
      // Doesn't need to test an empty url: it would fail the creation.

      describe("Fail to format an url without a resource", () => {
        const emptyResource = "";
        it("With final slash url", () => {
          provider = createSimpleProvider(true);
          const futureUrl = () => provider.formatUrl(emptyResource);
          expect(futureUrl).to.throw(
            Error,
            "Weather Provider: param resource have to be a string."
          );
        });

        it("Or not", () => {
          provider = createSimpleProvider(false);
          const futureUrl = () => provider.formatUrl(emptyResource);
          expect(futureUrl).to.throw(
            Error,
            "Weather Provider: param resource have to be a string."
          );
        });
      });

      describe("Success to format an url with a non empty resource", () => {
        const initialResource = "try";
        const composeUrl = (res) => `${url}${slash}${res}?api_key=1`;
        const testUrl = composeUrl(initialResource);

        describe("Not starting with a slash", () => {
          it("With a final slash url", () => {
            const provider = createSimpleProvider(true);
            const formatted = provider.formatUrl(initialResource);
            expect(formatted).to.be.equal(testUrl);
          });

          it("Or not", () => {
            const provider = createSimpleProvider(false);
            const formatted = provider.formatUrl(initialResource);
            expect(formatted).to.be.equal(testUrl);
          });
        });

        describe("Or starting with it", () => {
          const slashedResource = `${slash}${initialResource}`;
          it("With a final slash url", () => {
            const provider = createSimpleProvider(true);
            const formatted = provider.formatUrl(slashedResource);
            expect(formatted).to.be.equal(testUrl);
          });

          it("Or not", () => {
            const provider = createSimpleProvider(false);
            const formatted = provider.formatUrl(slashedResource);
            expect(formatted).to.be.equal(testUrl);
          });
        });
      });
    });
  });

  describe("Get forecast for a simple provider", () => {
    beforeEach(() => {
      provideProvider = (url) => new WeatherProvider(url, api_key);
      if (!nock.isActive()) {
        nock.activate();
      }
    });

    afterEach(() => {
      nock.cleanAll();
      nock.restore();
    });

    describe("using new get request function", async () => {
      // From now on, Nock will intercept each get request to this url.
      const nockTests = (times) =>
        nock(base_url)
          .get(`${res_url}?api_key=${api_key}`)
          .times(times)
          .reply(200, sample_data);

      it("responds with a successful result", async () => {
        nockTests(1);
        const provider = provideProvider(base_url);
        const { data } = await provider.makeRequest(res_url);
        expect(data).to.be.an("object");
        expect(data).to.have.a.nested.property("forecast.rain", false);
        expect(data).to.have.a.nested.property("forecast.temp", 36);
      });

      it("responds with a successful result many times", async () => {
        nockTests(2);
        const provider = provideProvider(base_url);
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

    describe("fail when call a fake domain", () => {
      it("that doesn't exists", async () => {
        const fake = "called fake domain";
        const grigri = "Ah Ah!";
        nock(base_url)
          .get(`${res_url}?api_key=${api_key}`)
          .once()
          .reply(400, { error: fake, data: grigri });
        const provider = provideProvider(base_url);
        try {
          await provider.makeRequest(res_url);
        } catch (error) {
          if (error && error.response && error.response.data) {
            expect(error).to.have.a.nested.property(
              "response.data.error",
              fake
            );
            expect(error).to.have.a.nested.property(
              "response.data.data",
              grigri
            );
          }
        }
      });
    });
  });
});

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

const { WeatherProvider } = require("./weatherProvider");

class TroposphereProvider extends WeatherProvider {
  constructor(base_url, api_key) {
    super(base_url, `token=${api_key}`);
    this.name = "Troposphere Provider";
  }
}

const troposphere_base_url = "https://api.troposphere.io";
const troposphere_api_key = process.env.TROPOSPHERE_API_KEY;
const provider = new TroposphereProvider(
  troposphere_base_url,
  troposphere_api_key
);

/**
 * Make a request to provider for forecasts.
 * @param {Number} latitude Latitude.
 * @param {Number} longitude Longitude.
 * @returns Request made, not awaited.
 */
const getRequest = (latitude, longitude) => {
  const resource = `forecast/${latitude},${longitude}`;
  return provider.makeRequest(resource);
};

const { troposphere, vortex } = require("./data/conditionCodes");

/**
 * Convert a Forecast from Troposphere in a Weather Vortex Forecast.
 * Obviously, the second one will have less fields for compatibility with other providers.
 * @param {Forecast} forecast Forecast from Troposphere.
 * @returns Weather Vortex Forecast.
 */
const mapFields = (forecast) => {
  const tropo = troposphere.get(forecast.type);
  if (tropo == null) {
    throw new Error(`Didn't found ${forecast.type} in tropo codes.`);
  }

  const elem = vortex.get(tropo.vortex);
  if (vortex == null) {
    throw new Error(`Didn't found ${tropo.vortex} in Vortex codes.`);
  }

  forecast.weatherIcon = elem.icon;
  forecast.weatherDescription = elem.description;

  /*
    Missing:
    airQualityIndex: 2.02
    time: "2021-08-19T17:00:00+02:00"
    uvIndex: 2.12
    windBearing: -99.12
    windGustsSpeed: 10.61
    windSpeed: 5.36
    */
  return {
    time: new Date(forecast.time).toISOString(),
    temp: forecast.temperature,
    tempMin: forecast.temperatureMin,
    tempMax: forecast.temperatureMax,
    pressure: forecast.preasure,
    humidity: forecast.relHumidity,
    weatherIcon: forecast.weatherIcon,
    weatherDescription: forecast.weatherDescription,
    clouds: forecast.cloudCover,
    rain: forecast.rain,
    snow: forecast.snow,
  };
};

/**
 * Make a request to provider for current weather.
 * @param {Number} latitude Latitude.
 * @param {Number} longitude Longitude.
 */
const currentByLocation = (latitude, longitude) =>
  getRequest(latitude, longitude).then((result) => {
    const current = result.data.data.current;
    return mapFields(current);
  });

/**
 * Make a request to provider for next days weather.
 * @param {Number} latitude Latitude.
 * @param {Number} longitude Longitude.
 */
const moreDayByLocation = (latitude, longitude) =>
  getRequest(latitude, longitude).then((result) => {
    const hourly = result.data.data.hourly; // Take hourly forecasts.
    const now = new Date();
    const three = hourly.filter((f) => {
      const d = new Date(f.time).getHours();
      return d % 3 === 0;
    }); // Take 3 hours forecasts.
    const startOfNewForecasts = three.findIndex((f) => new Date(f.time) > now);
    const sliced = three.slice(startOfNewForecasts, startOfNewForecasts + 24); // Take only 3 days forecasts.
    const mapped = sliced.map((value) => mapFields(value)); // Map to vortex fields.
    return mapped;
  });

module.exports = {
  currentByLocation,
  moreDayByLocation,
};

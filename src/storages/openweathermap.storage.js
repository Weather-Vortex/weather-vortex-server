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

const { WeatherProvider } = require("./weatherProvider");

class OpenWeatherMapProvider extends WeatherProvider {
  constructor(base_url, api_key) {
    super(base_url, `&appid=${api_key}`);
    this.name = "OpenWeatherMap Provider";
  }
}

// Instance the forecast provider.
const base_url = "https://api.openweathermap.org/data/2.5/";
const owm_api_key = process.env.OPEN_WEATHER_MAP_API_KEY;
const provider = new OpenWeatherMapProvider(base_url, owm_api_key);

const { openWeatherMap, vortex } = require("./data/conditionCodes");

const mapFields = (forecast) => {
  if (typeof forecast.weather === "object" && forecast.weather.length > 0) {
    const weather = forecast.weather[0];
    const owm = openWeatherMap.get(weather.id);
    if (owm == null) {
      throw new Error(`Didn't found ${weather.id} in Open Weather Map codes.`);
    }
    const elem = vortex.get(owm.vortex);
    if (vortex == null) {
      throw new Error(`Didn't found ${owm.vortex} in Vortex codes.`);
    }
    forecast.weatherIcon = elem.icon;
    forecast.weatherDescription = elem.description;
  }

  // In Node 14.x we can write as `forecast.rain?.3h ?? 0`.
  if (typeof forecast.rain === "object") {
    forecast.rain = forecast.rain["1h"];
  } else {
    forecast.rain = 0;
  }

  if (typeof forecast.snow === "object") {
    forecast.snow = forecast.snow["1h"];
  } else {
    forecast.snow = 0;
  }

  if (forecast.timezone) {
    forecast.time = new Date(forecast.dt - forecast.timezone * 1000);
  } else if (forecast.dt_txt) {
    forecast.time = new Date(forecast.dt_txt);
  }

  return {
    dt: forecast.dt, // Time of data forecasted, Unix, UTC
    time: forecast.time.toISOString(),
    temp: forecast.main.temp, // Temperature. Unit Default: Kelvin
    tempMin: forecast.main.temp_min,
    tempMax: forecast.main.temp_max,
    pressure: forecast.main.pressure, // Atmospheric pressure on the sea level by default, hPa
    humidity: forecast.main.humidity, // Humidity, %
    weatherIcon: forecast.weatherIcon,
    weatherDescription: forecast.weatherDescription,
    clouds: forecast.clouds.all, // Cloudiness, %
    /*
      Rain
      * 1h: Rain volume for last hour, mm
    */
    rain: forecast.rain,
    snow: forecast.snow,
  };
};

/**
 * Retrieve weather forecasts for given city.
 * @deprecated Since 0.4.0, this method will be deprecated for moreDayByCity and will be removed in a next release.
 * @param {String} city_name City Name for weather forecasts.
 * @returns {Promise<any>} Weather Forecast Promise.
 */
const fourDayForecastByCityRequest = (city_name) => {
  const resource = `forecast?q=${city_name}`;
  return provider.makeRequest(resource);
};

/**
 * Return request promise for forecast for given position.
 * @deprecated Since 0.4.0, this method will be deprecated for moreDayByLocation and will be removed in a next release.
 * @param {Number} latitude Latitude of the position.
 * @param {Number} longitude Longitude of the position.
 * @returns {Promise<any>} Weather Forecast Promise.
 */
const fourDayForecastByLocationRequest = (latitude, longitude) => {
  const resource = `forecast?lat=${latitude}&lon=${longitude}`;
  return provider.makeRequest(resource);
};

/**
 * Return request promise for forecast for given position.
 * @param {Number} latitude Latitude of the position.
 * @param {Number} longitude Longitude of the position.
 * @returns {Promise<any>} Weather Forecast Promise.
 */
const currentByLocation = (latitude, longitude) =>
  provider
    .makeRequest(`weather?lat=${latitude}&lon=${longitude}&units=metric`)
    .then((result) => mapFields(result.data));

const moreDayByLocation = (latitude, longitude) =>
  provider
    .makeRequest(`forecast/?lat=${latitude}&lon=${longitude}&units=metric`)
    .then((result) => {
      const hourly = result.data.list; // Take hourly forecasts.
      const startOfNewForecasts = hourly.findIndex(
        (f) => new Date(f.dt_txt) > new Date()
      ); // Take the index of the first future forecast.
      const sliced = hourly.slice(
        startOfNewForecasts,
        startOfNewForecasts + 24
      ); // Take up to 24 forecasts (3 days).
      const mapped = sliced.map((value) => mapFields(value)); // Map to vortex fields.
      return mapped;
    });

module.exports = {
  fourDayForecastByCityRequest,
  fourDayForecastByLocationRequest,
  currentByLocation,
  moreDayByLocation,
};

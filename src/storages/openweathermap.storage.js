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

/**
 * Retrieve weather forecasts for given city.
 * @param {String} city_name City Name for weather forecasts.
 * @returns {Promise<any>} Weather Forecast Promise.
 */
const fourDayForecastByCityRequest = (city_name) => {
  const resource = `forecast?q=${city_name}`;
  return provider.makeRequest(resource);
};

/**
 * Return request promise for forecast for given position.
 * @param {Number} latitude Latitude of the position.
 * @param {Number} longitude Longitude of the position.
 * @returns {Promise<any>} Weather Forecast Promise.
 */
const fourDayForecastByLocationRequest = (latitude, longitude) => {
  const resource = `forecast?lat=${latitude}&lon=${longitude}`;
  return provider.makeRequest(resource);
};

const currentWeatherForecastByLocationRequest = (latitude, longitude) => {
  const resource = `weather?lat=${latitude}&lon=${longitude}`;
  return provider.makeRequest(resource).then((result) => {
    if (result.weather.id === 800) {
      result.weatherIcon = "mdi-weather-sunny";
      result.weather.description = "Clear Sky";
    }
    return {
      temp: result.main.temp,
      tempMin: result.main.temp_min,
      tempMax: result.main.temp_max,
      pressure: result.main.pressure,
      humidity: result.main.humidity,
      weatherIcon: result.weatherIcon,
      weatherDescription: result.weather.description,
      clouds: result.clouds.all,
      rain: result.rain,
      snow: result.snow,
    };
  });
};

module.exports = {
  fourDayForecastByCityRequest,
  fourDayForecastByLocationRequest,
  currentWeatherForecastByLocationRequest,
};

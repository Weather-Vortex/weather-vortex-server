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

class TroposphereProvider extends WeatherProvider {
  constructor(base_url, api_key) {
    super(base_url, `?token=${api_key}`);
    this.name = "Troposphere Provider";
  }
}

const troposphere_base_url = "https://api.troposphere.io";
const troposphere_api_key = process.env.TROPOSPHERE_API_KEY;
const provider = new TroposphereProvider(
  troposphere_base_url,
  troposphere_api_key
);

const getSevenDaysForecastByLocationRequest = (latitude, longitude) => {
  const resource = `forecast/${latitude},${longitude}`;
  return provider.makeRequest(resource).then((result) => {
    const current = result.data.data.current;
    if (current.type === "partly-cloudy") {
      current.weatherIcon = "mdi-weather-partly-cloudy";
      current.weatherDescription = "Partly Cloudy";
    }
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
      temp: current.temperature,
      tempMin: current.temperatureMin,
      tempMax: current.temperatureMax,
      pressure: current.preasure,
      humidity: current.relHumidity,
      weatherIcon: current.weatherIcon,
      weatherDescription: current.weatherDescription,
      clouds: current.cloudCover,
      rain: current.rain,
      snow: current.snow,
    };
  });
};

module.exports = {
  getSevenDaysForecastByLocationRequest,
};

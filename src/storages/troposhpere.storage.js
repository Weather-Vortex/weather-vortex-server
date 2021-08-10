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

const troposphere_base_url = "https://api.troposphere.io";
const troposphere_api_key = process.env.TROPOSPHERE_API_KEY; // TODO: Read from env

const { WeatherProvider } = require("./weatherProvider");

class TroposphereProvider extends WeatherProvider {
  constructor(base_url, api_key) {
    super(base_url, api_key);
    this.name = "Troposphere Provider";
  }

  formatUrl(data) {
    return `${this.base_url}${data}?token=${troposphere_api_key}`;
  }
}

const provider = new TroposphereProvider(
  troposphere_base_url,
  troposphere_api_key
);

const getSevenDaysForecastByLocationRequest = (latitude, longitude) => {
  const url = provider.formatUrl(`/forecast/${latitude},${longitude}`);
  return provider.makeRequest(url);
};

module.exports = {
  getSevenDaysForecastByLocationRequest,
};

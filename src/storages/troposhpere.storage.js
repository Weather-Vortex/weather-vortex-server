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

const axios = require("axios");
const utils = require("./storage.utils");
const troposphere_base_url = "https://api.troposphere.io";
const troposphere_api_key =
  "02a505c1a967cd777252ff263bdf78c9fb80de6d9703bae9f3"; // TODO: Read from env

/**
 * @deprecated Since 0.2, use request method instead.
 * @param {*} latitude
 * @param {*} longitude
 * @returns
 */
const get7DaysForecastByLocation = async (latitude, longitude) => {
  const url = `${troposphere_base_url}/forecast/${latitude},${longitude}?token=${troposphere_api_key}`;
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    utils.manageAxiosError(error);
    return undefined;
  }
};

const getSevenDaysForecastByLocationRequest = (latitude, longitude) => {
  const url = `${troposphere_base_url}/forecast/${latitude},${longitude}?token=${troposphere_api_key}`;
  try {
    return axios.get(url);
  } catch (error) {
    utils.manageAxiosError(error);
    return undefined;
  }
};

module.exports = {
  get7DaysForecastByLocation,
  getSevenDaysForecastByLocationRequest,
};

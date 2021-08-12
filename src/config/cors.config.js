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

/*

# Cors support

Vue.axios on client application block requests from domains others than this. If you wanna run this server and use cors restriction policies, set properly your .env file. If left empty, allow any domain.

*/

const cors = require("cors");

const origin = process.env.CLIENT_URL || "*";

const corsOptions = {
  origin,
  optionsSuccessStatus: 200,
};

/**
 * 
 * @param {Express} app Express application to configure.
 */
const configureCors = (app) => {
  app.use(cors(corsOptions));
};

module.exports = 

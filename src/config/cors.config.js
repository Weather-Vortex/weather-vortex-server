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

const cors = require("cors");

/*
## Cors support

Read Origin from env vars or allow anyone.

## Motivations

Client applications block requests from domains others than this. If you wanna run this server using cors restriction policies, set properly your .env file. If left empty, allow any origin to make request to any route.

*/
const origin = process.env.CLIENT_URL || "*";

/**
 * Cors options configured for this project.
 */
const options = {
  origin,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

/**
 * Add [Cors Middleware](http://expressjs.com/en/resources/middleware/cors.html) and configure it.
 * @param {Express} app Express application to configure.
 */
const configure = (app) => {
  app.use(cors(options));
};

module.exports = { configure, options };

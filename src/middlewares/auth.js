/*
    Web server for Weather Vortex project.
    Copyright (C) 2021  Zandoli Silvia

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

/*we will going to use to check whether the user has been logged in or not.
 first we will extract the available toke from cookies then we will directly call the findByToken function
  from user.js and check for the login status of the user.*/
const User = require("../models/user.model");

let auth = (req, res, next) => {
  let token = req.cookies.auth;
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.status(401).json({
        error: "Didn't found any auth token.",
      });

    req.token = token;
    req.user = user;
    next();
  });
};

module.exports = { auth };

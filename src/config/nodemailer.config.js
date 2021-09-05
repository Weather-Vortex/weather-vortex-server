/*
    Web server for Weather Vortex project.
    Copyright (C) 2021  Tentoni Daniele, Zandoli Silvia

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

const nodemailer = require("nodemailer");

//email sender details
var transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USEREMAIL,
    pass: process.env.PWDMAIL,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
//confirmationCode-> emailToken
module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
  console.log("Check");
  transport
    .sendMail({
      from: ` "Verify your email" <${process.env.USEREMAIL}>`,
      to: email,
      subject: "Please confirm your account - Weather Vortex",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href='${process.env.CLIENT_URL}/weather-vortex-client/#/user/confirm?name=${confirmationCode}'> Click here
          </div>`,
    })
    .catch((err) => console.log(err));
};

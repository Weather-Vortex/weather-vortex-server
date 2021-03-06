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
const transport = () =>
  nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.USEREMAIL,
      pass: process.env.PWDMAIL,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

//confirmationCode-> emailToken
module.exports.sendConfirmationEmail = (
  name,
  email,
  confirmationCode,
  returnLink
) => {
  console.log("Check");
  transport()
    .sendMail({
      from: ` "Verify your email" <${process.env.USEREMAIL}>`,
      to: email,
      subject: "Please confirm your account - Weather Vortex",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href='${process.env.CLIENT_URL}${returnLink}user/confirm?name=${confirmationCode}'> Click here
          </div>`,
    })
    .catch((err) => console.log(err));
};

module.exports.sendForgotEmail = (name, email, forgotToken) => {
  console.log("Check");
  transport()
    .sendMail({
      from: ` "Change your password ${name}" <${process.env.USEREMAIL}>`,
      to: email,
      subject: "Account reset password link - Weather Vortex",
      html: `<h2>Please copy this token to reset your password and paste it in the form</h2>
          <p>Your token is: ${forgotToken}</p>`,
    })
    .catch((err) => console.log(err));
};

module.exports.sendWeatherEmail = (email, user, forecasts) =>
  new Promise((resolve, reject) => {
    const tbody = forecasts.reduce((old, current) => {
      const str = `
      <tr>
        <td>${current.provider}</td>
        <td>${current.forecast.weatherDescription}</td>
        <td>${current.forecast.temp}</td>
        <td>${current.forecast.tempMin}</td>
        <td>${current.forecast.tempMax}</td>
        <th>${current.forecast.pressure}</th>
        <th>${current.forecast.humidity}</th>
        <th>${current.forecast.clouds}</th>
        <th>${current.forecast.rain}</th>
        <th>${current.forecast.snow}</th>
      </tr>`;
      if (!old) {
        return str;
      }
      return old.concat(str);
    }, "");

    transport()
      .sendMail({
        from: `"Forecast notifications" <${process.env.USERMAIL}>`,
        to: email,
        subject: "Forecast notification from Weather Vortex",
        html: `
    <h1>Weather Notification</h1>
    <p>You are receiving this email because you are registered to Weather Vortex, based on your preferred position: ${user.preferred}</p>
    <div>
    <table border="1">
      <caption>All Forecasts</caption>
      <thead>
        <th>Provider</th>
        <th>Weather</th>
        <th>Temp</th>
        <th>Temp Min</th>
        <th>Temp Max</th>
        <th>Pressure</th>
        <th>Humidity</th>
        <th>Clouds</th>
        <th>Rain</th>
        <th>Snow</th>
      </thead>
      <tbody>${tbody}</tbody>
    </table>
    </div>
    `,
      })
      .then((_) => resolve(null))
      .catch((err) => {
        const message = `Email sending to ${user.email} finished with errors: ${email}`;
        console.error(message, err);
        reject(message);
      });
  });

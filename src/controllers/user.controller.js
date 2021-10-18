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

const storage = require("../storages/user.storage");
const nodemailer = require("nodemailer");
//const nodemailer = require("../config/nodemailer.config");

const getUserFeedbacks = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await storage.getUserFeedbacks(id);
    const verbose = req.query.verbose;
    const user = verbose ? result : { feedbacks: result.feedbacks };
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      error: error,
      message: `Error thrown during user feedbacks query: ${error}.`,
      id,
    });
  }
};

const getUserStations = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await storage.getUserStations(id);
    const verbose = req.query.verbose;
    const user = verbose ? result : { stations: result.stations };
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      error: error,
      message: `Error thrown during user feedbacks query: ${error}.`,
      id,
    });
  }
};

const getPublicUserProfile = async (req, res) => {
  return await storage.getUser(req, res);
};

/*setting for contact form */
const contactEmail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USEREMAIL,
    pass: process.env.PWDMAIL,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

contactEmail.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready to Send");
  }
});

const contactUser = async (req, res) => {
  const email = req.body.email;
  const select = req.body.select;
  const message = req.body.text;
  const mail = {
    from: email,
    to: process.env.USEREMAIL,
    subject: "Contact Form Submission",
    html: `From Weather Vortex Application: A user just contacted you!
            <p>Email: ${email}</p>
            <p>Issue: ${select}</p>
           <p>Message: ${message}</p>`,
  };
  contactEmail.sendMail(mail, (error) => {
    if (error) {
      res.json({ status: "ERROR" });
    } else {
      res.json({ status: "Message Sent" });
    }
  });
};
/*const contactUser = async (req, res) => {
  const email = req.body.email;
  const select = req.body.select;
  const message = req.body.text;
  nodemailer.sendContactForm(email, select, message, (error) => {
    if (error) {
      res.json({ status: "ERROR" });
    } else {
      res.json({ status: "Message Sent" });
    }
  });
};*/

module.exports = {
  getUserFeedbacks,
  getUserStations,
  getPublicUserProfile,
  contactUser,
};

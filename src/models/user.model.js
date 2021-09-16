/*
    Web server for Weather Vortex project.
    Copyright (C) 2021  Tentoni Daniele, Zandoli Silvia.

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

const mongoose = require("mongoose");
//(JWT) is an open standard that defines a compact and self-contained way of securely
//transmitting information between parties as a JSON object
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); //for email token
const bcrypt = require("bcrypt"); // It is used for hashing and comparing the passwords.
const salt = 10; //per la password

var userSchema = mongoose.Schema({
  firstName: {
    type: String, // String is shorthand for {type: String}
    maxlength: 100,
    required: true,
  },
  lastName: {
    type: String,
    maxlength: 100,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 128,
  },
  token: {
    //for login
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: 1,
  },
  emailToken: {
    //token for verifying authentication emailToken
    type: String,
    //required: true,
    unique: true,
  },
  resetLink: {
    data: String,
    default: "",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  preferred: {
    location: {
      type: String,
      default: "",
    },
    position: {
      // TODO: Update those constraints like in location.model.js
      x: {
        type: Number,
        default: undefined,
      },
      y: {
        type: Number,
        default: undefined,
      },
    },
  },
  stations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
    },
  ],
  feedbacks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
    },
  ],
  // TODO: Add Telegram Id when ready.
});

userSchema.pre("save", function (next) {
  /*
  To signup a user
  pre functions which will execute when particular functionality has been called
  */

  var user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(salt, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

/***************
 = Query Helpers (https://mongoosejs.com/docs/guide.html#query-helpers)
 **************/
userSchema.methods.getStations = async (name) => {
  const populated = await this.populate("stations");
  const stations = populated.stations;
  const filtered = stations.find({ name });
  console.log("Filtered:", filtered);
  return filtered;
};

userSchema.methods.comparePassword = function (password, cb) {
  /*
  To login
  Comparing the user password when user tries to login
  */
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (err) return cb(next);
    cb(null, isMatch);
  });
};

// generate token when user log in using jwt.sign() function which is used by us for checking whether
//the particular user has been logged-in or not and we will save this in database
userSchema.methods.generateToken = function (cb) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), process.env.SECRET);

  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

// find by token
userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  jwt.verify(token, process.env.SECRET, function (err, decode) {
    user.findOne({ _id: decode, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

//delete token, when the user logout we will delete this particular token.
userSchema.methods.deleteToken = function (token, cb) {
  var user = this;

  user.update({ $unset: { token: 1 } }, function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.query.publicView = function () {
  return this.select("-isVerified -password -token");
};

module.exports = mongoose.model("User", userSchema);

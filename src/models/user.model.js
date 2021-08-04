const mongoose = require("mongoose");
//(JWT) is an open standard that defines a compact and self-contained way of securely
//transmitting information between parties as a JSON object
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); // It is used for hashing and comparing the passwords.
const confiq = require("../config/config").get(process.env.NODE_ENV); //per la chiave segreta
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
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  registrationDate: Date,
  email: {
    type: String,
    required: true,
    trim: true,
    unique: 1,
  },
  emailConfirmationCode: {
    //TODO
    type: String,
    //required: true,
    //unique:true,
  },
  confirmed: Boolean,
  preferred: {
    location: String,
    position: {
      x: Number,
      y: Number,
    },
  },
  // TODO: Add Telegram Id when ready.
});
// to signup a user
//pre functions which will execute when particular functionality has been called
userSchema.pre("save", function (next) {
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

//to login
// comparing the user password when user tries to login
userSchema.methods.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (err) return cb(next);
    cb(null, isMatch);
  });
};

// generate token when user log in using jwt.sign() function which is used by us for checking whether
//the particular user has been logged-in or not and we will save this in database
userSchema.methods.generateToken = function (cb) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), confiq.SECRET);

  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

// find by token
userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  jwt.verify(token, confiq.SECRET, function (err, decode) {
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

module.exports = mongoose.model("User", userSchema);

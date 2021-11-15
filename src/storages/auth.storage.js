const User = require("../models/user.model");
//libreria bcrypt per le password, per generare token random invece serve crypto
const crypto = require("crypto");
const nodemailer = require("../config/nodemailer.config");
const jwt = require("jsonwebtoken");

// adding new user (sign-up route)
const register = (req, res) => {
  const { firstName, lastName, email, password, returnLink } = req.body;

  const mandatoryFields = ["firstName", "lastName", "email", "password"];
  let missingFields = [];
  const keys = Object.keys(req.body);
  mandatoryFields.forEach((elem) => {
    if (!keys.includes(elem)) {
      missingFields.push(elem);
    }
  });

  const mandatoryMessage =
    missingFields.length > 0
      ? missingFields.reduce((prev, curr) => `${prev}, ${curr}`)
      : "";

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      auth: false,
      message: "Missing some fields that are mandatory",
      fields: mandatoryMessage,
    });
  }

  const validRegex =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!email.match(validRegex)) {
    return res.status(400).json({ auth: false, message: "Invalid Email" });
  }

  // taking a user
  const newUser = new User({
    //insert other parameters of the model if you want
    firstName,
    lastName,
    email,
    password,
    emailToken: crypto.randomBytes(64).toString("hex"),
  });
  // User.findOne({ email: newuser.email }, function (err, user) {
  //if (user) return res.status(400).json({ auth: false, message: "email exists" });

  newUser.save((err, doc) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message:
          "Database error occurred during user registration, report this problem to the administrator.",
      });
    }
    res.status(200).json({
      succes: true,
      user: doc,
      message: "User was registered successfully! Please check your email",
    });

    nodemailer.sendConfirmationEmail(
      newUser.firstName,
      newUser.email,
      newUser.emailToken,
      returnLink
    );
    console.log("before email not verified ", newUser.isVerified);
  });
  // });

  //res.redirect('/user/login')
};

const verifyUser = (req, res, next) => {
  console.log("Email token:", req.params.emailToken);
  User.findOne({
    emailToken: req.params.emailToken,
  })
    .then((user) => {
      if (!user) {
        console.log("User: ", user);
        return res
          .status(404)
          .json({ confirmed: false, message: "User Not found." });
      }
      user.isVerified = true;

      //user.isVerified=true;
      user.save((err, doc) => {
        if (err) {
          res
            .status(500)
            .json({ confirmed: false, message: "User not saved.", error: err });
          return;
        }
        console.log(
          user.isVerified + " User is verified after the click on email"
        );
        res.status(200).json({
          confirmed: true,
          firstname: doc.firstName,
          lastname: doc.lastName,
        });
      });
    })
    .catch((e) => {
      console.log("error", e);
      return res
        .status(404)
        .json({ confirmed: false, message: "User Not found.", error: e });
    });
};

// login user
const login = (req, res) => {
  let token = req.cookies.auth;
  User.findByToken(token, (err, user) => {
    if (err) return res(err);
    if (user)
      return res.status(400).json({
        error: true,
        message: "You are already logged in",
      });
    else {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          return res.status(500).json({
            isAuth: false,
            message: "Auth failed, email not found.",
          });
        }

        //If the user isn't verified, cannot login->
        if (user.isVerified == false) {
          return res.status(403).send({
            message: "Pending Account. Please Verify Your Email!",
          });
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
          if (!isMatch)
            return res
              .status(401)
              .json({ isAuth: false, message: "password doesn't match" });

          user.generateToken((err, user) => {
            if (err) return res.status(500).send(err);
            res
              .cookie("auth", user.token, {
                httpOnly: true, // to disable accessing cookie via client side js
                secure: true, // to force https (if you use it)
              })
              .json({
                isAuth: true,
                user: {
                  id: user._id,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                },
              });
          });
        });
      });
    }
  });
};

//logout user
const logout = (req, res) => {
  req.user.deleteToken(req.token, (err, user) => {
    if (err) {
      return res.status(400).send(err);
    }

    // Invalidate client session before sending the result.
    req.session = null;
    // Clear http only authentication cookies.
    res.clearCookie("auth");
    res.sendStatus(200);
  });
};

// get logged in user, the user can view its information (profile)
const loggedIn = (req, res) => {
  if (req.user) {
    return res.status(200).json({
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      createdDate: req.user.createdDate,
      preferred: req.user.preferred,
    });
  }
  res.status(404).json({
    message: "No User found with given id",
  });
};

const deleteUser = (req, res) => {
  User.findByIdAndDelete(req.user._id)
    .then(() => {
      // Clear http only authentication cookies.
      res.status(200).clearCookie("auth").json({
        message: "Deleted!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

const updateUser = (req, res, next) => {
  // The auth middleware had found user before save.
  // Update only non null fields.
  if (req.body.password) {
    req.user.password = req.body.password;
  }
  if (req.body.preferred) {
    req.user.preferred.location = req.body.preferred;
  }
  // Try to update the user.
  req.user.save((err, updatedUser) => {
    if (err) {
      // Error happens, send report to final user.
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Update user error", error: err });
    }

    // No error happens, send right user data to final user.
    res.status(201).json({
      succes: true,
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        createdDate: updatedUser.createdDate,
        preferred: updatedUser.preferred,
      },
      message: "User was updated successfully!",
    });
  });
};

const forgotPassword = async (req, res) => {
  User.findOne(
    { email: /*req.user.email */ req.body.email },
    function (err, user) {
      console.log("email is " + req.body.email);
      if (err || !user) {
        return res
          .status(500)
          .json({ error: "User with this email doesn't not exist!" });
      }
      const forgotToken = jwt.sign(
        { _id: user._id },
        process.env.RESET_PASSWORD_KEY,
        { expiresIn: "20m" }
      );
      //invio email
      nodemailer.sendForgotEmail(user.firstName, user.email, forgotToken);
      return User.updateOne(
        { resetLink: forgotToken },
        function (err, success) {
          if (err) {
            return res.status(500).json({ err: "reset password link error!" });
          } else {
            // res.send(data, function (err, body) {
            if (err) {
              return res.status(500).json({ message: "error" });
            }
            return res.status(200).json({
              message: "Email has been sent, kindly follow the instructions!",
            });
            // });
          }
        }
      );
    }
  );
};

//update password
const resetPassword = async (req, res) => {
  const { resetLink } = req.body;
  if (resetLink) {
    jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function (error) {
      if (error) {
        return res.status(500).json({
          error: "Incorrect token or it is expired!",
        });
      }
      User.findOne({ resetLink }, (err, user) => {
        if (err || !user) {
          return res
            .status(500)
            .json({ err: "User with this token does not exist" });
        }
        console.log(
          "I wanna reset %s with %s",
          user.password,
          req.body.password,
          user.email
        );
        user.password = req.body.password;
        user.resetLink = "";
        user.save((err, result) => {
          if (err) {
            return res.status(500).json({ error: "reset password error" });
          } else {
            return res
              .status(200)
              .json({ message: "Your password has be changed" });
          }
        });
      });
    });
  } else {
    return res.status(500).json({ error: "Authentication error" });
  }
};

module.exports = {
  register,
  login,
  logout,
  loggedIn,
  verifyUser,
  deleteUser,
  updateUser,
  forgotPassword,
  resetPassword,
};

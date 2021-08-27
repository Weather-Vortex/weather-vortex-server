const User = require("../models/user.model");
//libreria bcrypt per le password, per generare token random invece serve crypto
const crypto = require("crypto");
const nodemailer = require("../config/nodemailer.config");

// adding new user (sign-up route)
const register = (req, res) => {
  // taking a user
  //const newuser = new User(req.body);

  const newuser = new User({
    //insert other parameters of the model if you want
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    emailToken: crypto.randomBytes(64).toString("hex"),
    isVerified: false,
  });

  console.log(newuser);

  const { firstName, lastName, email, password } = req.body;

  //if(newuser.password!=newuser.password2)return res.status(400).json({message: "passwords not match"});

  if (!firstName || !lastName || !email || !password)
    return res
      .status(400)
      .json({ auth: false, message: "some fields are mandatory" });

  const validRegex =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!email.match(validRegex)) {
    return res.status(400).json({ auth: false, message: "Invalid Email" });
  }
  // User.findOne({ email: newuser.email }, function (err, user) {
  //if (user) return res.status(400).json({ auth: false, message: "email exists" });

  newuser.save((err, doc) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Error registration" });
    }
    res.status(200).json({
      succes: true,
      user: doc,
      message: "User was registered successfully! Please check your email",
    });

    nodemailer.sendConfirmationEmail(
      newuser.firstName,
      newuser.email,
      newuser.emailToken
    );
    console.log("before email not verified ", newuser.isVerified);
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
        if (!user)
          return res
            .status(500)
            .json({ isAuth: false, message: " Auth failed ,email not found" });


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
            res.cookie("auth", user.token).json({
              isAuth: true,
              id: user._id,
              email: user.email,
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
    if (err) return res.status(400).send(err);
    res.sendStatus(200);
  });
};

// get logged in user, the user can view its informations (profile)
const loggedIn = (req, res) => {
  if (req.user) {
    return res.status(200).json({
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
  User.findOneAndDelete(req.params.id)
    .then(() => {
      res.status(200).json({
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
  var user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  };
  User.updateOne(req.params._id, user)
    .then(() => {
      res.status(201).json({
        message: "User updated successfully!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

module.exports = {
  register,
  login,
  logout,
  loggedIn,
  verifyUser,
  deleteUser,
  updateUser,
};

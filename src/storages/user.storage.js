const User = require("../models/user.model");

/**
 * Create a new user and send back data.
 * @param {express.Request} req Express request from route.
 * @param {express.Response} res Express response from route.
 */
//ADMINISTRATOR operations

//an ADMINISTRATOR can obtain a user from its id
const getUser = (req, res) => {
  var id = req.params.id;
  User.findById(id, function (err, docs) {
    if (err) {
      console.log(err);
      return res.status(400).send(err);
    } else {
      console.log("Result : ", docs);
      res.json(docs);
    }
  });
};

//THE ADMINISTRATOR can view the list of users
const getAllUsers = (req, res) => {
  console.log("Get all users");
  User.find({}, function (err, users) {
    if (err) {
      return res.status(400).send(err);
    } else {
      var userMap = {};

      users.forEach(function (user) {
        userMap[user._id] = user;
      });

      res.json(userMap);
    }
  });
};

module.exports = {
  getAllUsers,
  getUser,
};

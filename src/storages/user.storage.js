const User = require("../models/user.model");
const db = require("../config/config").get(process.env.NODE_ENV);
//administrator operations
/**
 * Create a new user and send back data.
 * @param {express.Request} req Express request from route.
 * @param {express.Response} res Express response from route.
 */
const createUser = (req, res) => {
  const user = req.body;
  const newUser = new userModel(user);
  newUser.save((err, doc) => {
    if (err) {
      return res.status(500).json(err);
    }

    // saved!
    res.status(200).json({ message: "User created!", doc });
  });
};

//an ADMINISTRATOR can obtain a user from its id
const getUser = (req, res) => {
  var id = req.params.id;
  User.findById(id, function (err, docs) {
      if (err){
          console.log(err);
      }
      else{
          console.log("Result : ", docs);
          res.send(docs)
      }
  });
} 

//these options are for the users-> to do in auth storage
const updateUser = (req, res) => {
  // TODO: Update some info about user.
  console.log("Update user", req.body);
};

const deleteUser = (req, res) => {
  // TODO: We can delete users?
  console.log("Delete user", req.params.id);
};

//THE ADMINISTRATOR can view the list of users
const getAllUsers = (req, res) => {
  console.log("Get all users");
  User.find({}, function (err, users) {

    var userMap = {};

    users.forEach(function (user) {

      userMap[user._id] = user;

    });

    res.send(userMap);

  });

};

module.exports = {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  getAllUsers,
  updateUser,
};

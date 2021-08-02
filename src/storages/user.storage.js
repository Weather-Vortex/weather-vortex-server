const userModel = require("../models/user.model");

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
    res.status(200).json({ message: "User cerated!", doc });
  });
};

const getUser = (req, res) => {
  console.log("Get user", req.params.id);
};

const updateUser = (req, res) => {
  console.log("Update user", req.params.id);
};

const deleteUser = (req, res) => {
  console.log("Delete user", req.params.id);
};

const getAllUsers = (req, res) => {
  console.log("Get all user");
};

module.exports = {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  getAllUsers,
  updateUser,
};

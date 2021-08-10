const express = require("express");
const userStorage = require("../storages/user.storage");
const router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  req.pa;
  console.log("Time: ", Date.now());
  next();
});

router
  .get("/:id", userStorage.getUser)
  .put("/:id", userStorage.updateUser)
  .delete("/:id", userStorage.deleteUser);

router.get("/", userStorage.getAllUsers).post("/", userStorage.createUser);

module.exports = router;

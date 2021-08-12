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


router.get("/", userStorage.getAllUsers)

module.exports = router;

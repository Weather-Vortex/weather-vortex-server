const express = require("express");
const authStorage = require("../storages/auth.storage");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.post("/register", authStorage.register);

router.post("/login", authStorage.login);

router.get("/logout", auth, authStorage.logout);

router
  //view information about the user logged in
  .get("/profile", auth, authStorage.loggedIn);

router.get("/confirm/:emailToken", authStorage.verifyUser);

router.put("/", auth, authStorage.updateUser);

router.delete("/", auth, authStorage.deleteUser);

router.put("/forgotPassword", authStorage.forgotPassword);
router.put("/resetPassword/", authStorage.resetPassword);

module.exports = router;

const express = require("express");
const authStorage = require("../storages/auth.storage");
const router = express.Router();

router
.post('/register',authStorage.register);

router
.post('/login',authStorage.login);

router
.get('/logout',authStorage.logout);

router
.get('/profile',authStorage.loggedIn);

module.exports = router;
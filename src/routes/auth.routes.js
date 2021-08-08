const express = require("express");
const authStorage = require("../storages/auth.storage");
const {auth} =require('../middlewares/auth');

const router = express.Router();

router
.post('/register',authStorage.register);

router
.post('/login',authStorage.login);

router
.get('/logout',auth, authStorage.logout);

router
//wiew informations about the user logged in
.get('/profile',auth,authStorage.loggedIn);

router
.get('/verify-email/:emailToken',authStorage.verify);

module.exports = router;
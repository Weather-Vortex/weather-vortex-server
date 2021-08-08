
const User = require('../models/user.model');
const { auth } = require('../middlewares/auth');
const crypto = require("crypto");
const nodemailer = require("../config/nodemailer.config")

// adding new user (sign-up route)
const register = (req, res) => {
    // taking a user
    //const newuser = new User(req.body);

    const newuser = new User({
        //todo insert other parameters
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        emailToken: crypto.randomBytes(64).toString('hex'),
        isVerified: false
    });


    //send verification mail to user
    let { emailToken } = req.body
    console.log('email token di user è' + newuser.emailToken)
    //bisognerebbe mettere quel valore all'email token ogni volta che si fa newUser
    console.log({ emailToken })
    console.log(newuser);

    const { firstName, lastName, email, password } = req.body


    //if(newuser.password!=newuser.password2)return res.status(400).json({message: "passwords not match"});


    if (!firstName || !lastName || !email || !password)
        return res.status(400).json({ auth: false, message: "some fields are mandatory" });

    const validRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email.match(validRegex)) {
        return res.status(400).json({ auth: false, message: "Invalid Email" });
    }
    User.findOne({ email: newuser.email }, function (err, user) {
        if (user) return res.status(400).json({ auth: false, message: "email exists" });
        //qua al posto di salvare bisogna fare il lavorino dell'email di conferma, e guarda video sempre di lui
        newuser.save((err, doc) => {
            if (err) {
                console.log(err);
                return res.status(400).json({ success: false });
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
        });
    });

    //res.redirect('/user/login')

};

const verifyUser = (req, res, next) => {
    User.findOne({
        confirmationCode: req.params.emailToken,
    })
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            user.isVerified=true;
            console.log(user.isVerified + " User is verified")
            user.save((err) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
            });
        })
        .catch((e) => console.log("error", e));
}

// login user
const login = (req, res) => {
    let token = req.cookies.auth;
    User.findByToken(token, (err, user) => {
        if (err) return res(err);
        if (user) return res.status(400).json({
            error: true,
            message: "You are already logged in"
        });

        else {
            User.findOne({ 'email': req.body.email }, function (err, user) {
                if (!user) return res.json({ isAuth: false, message: ' Auth failed ,email not found' });
                //If the user isn't verified, cannot login
                if (user.isVerified == false) {
                    return res.status(401).send({
                        message: "Pending Account. Please Verify Your Email!",
                    });
                }

                user.comparePassword(req.body.password, (err, isMatch) => {
                    if (!isMatch) return res.json({ isAuth: false, message: "password doesn't match" });

                    user.generateToken((err, user) => {
                        if (err) return res.status(400).send(err);
                        res.cookie('auth', user.token).json({
                            isAuth: true,
                            id: user._id,
                            email: user.email
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

// get logged in user, view its informations
const loggedIn = (req, res) => {
    res.json({
        isAuth: true,
        id: req.user._id,
        email: req.user.email,
        name: req.user.firstName + req.user.lastName

    })
};

module.exports = {
    register,
    login,
    logout,
    loggedIn,
    verifyUser
}
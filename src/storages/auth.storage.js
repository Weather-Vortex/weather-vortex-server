
const User = require('../models/user.model');
const { auth } = require('../middlewares/auth');
const nodemailer = require("nodemailer");
const crypto = require("crypto");

//email sender details
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'silviadolomiti@gmail.com',
        pass: 'DAMETTERE'

    },
    tls: {
        rejectUnauthorized: false
    }

})
// adding new user (sign-up route)
const register = (req, res) => {
    // taking a user
    
    const newuser = new User(req.body);
    //send verification mail to user
    //let { emailToken } = req.body
     //emailToken = crypto.randomBytes(64).toString('hex');//for email verification
     //bisognerebbe mettere quel valore all'email token ogni volta che si fa newUser
    console.log({ emailToken })
    //console.log(newuser);

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
                user: doc
            });
        });
    });
    //TODO-> Com'è ora arriva la email sempre
    var mailOptions = {
        from: ' "Verify your email" <silviadolomiti@gmail.com>',
        to: newuser.email,
        subject: 'weather-vortex-verification -verify your email',
        html: `<h2>${newuser.firstName}! Thanks for registering on your site </h2>
             <h4> Please verify your email to continue...</h4>
             <a href="http://${req.headers.host}/api/verify-email?token=${newuser.emailToken}">Verify your email</a>`

    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Verification email is sent to your gmail account')
        }
    })
    //res.redirect('/user/login')

};

const verify = (req, res) => {
    try {
        const token = req.query.token
        const user = User.findOne({ emailToken: token })
        if (user) {
            user.emailToken = null
            user.isVerified = true
            user.save()
            res.redirect('/api/login')
        } else {
            res.redirect('/api/register')
            console.log('email is not verified')
        }
    } catch (err) {
        console.log(err)
    }
}

const verifyEmail = (req, res, next) => {
    try {
        const user = User.findOne({ email: req.body.email })
        if (user.isVerified) {
            next()
        }
        else {
            console.log("Please check your email to verify your account")
        }
    }
    catch (err) {
        console.log(err)
    }
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
    verify
}
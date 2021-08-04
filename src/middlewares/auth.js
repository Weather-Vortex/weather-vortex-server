/*we will going to use to check whether the user has been logged in or not.
 first we will extract the available toke from cookies then we will directly call the findByToken function
  from user.js and check for the login status of the user.*/
const User=require('../models/user.model');

let auth =(req,res,next)=>{
    let token =req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) throw err;
        if(!user) return res.json({
            error :true
        });

        req.token= token;
        req.user=user;
        next();

    })
}

module.exports={auth};
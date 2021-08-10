//npm install express body-parser cookie-parser bcrypt mongoose jsonwebtoken nodemon
const config={
    production :{
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI,
        USEREMAIL:process.env.USER_EMAIL,
        PWD:process.env.PWD,
        CONFIRM:process.env.CONFIRM
    },
    default : {
        SECRET: 'mysecretkey',
        DATABASE: 'mongodb://localhost:27017/test',
        USEREMAIL:'weathervortex2@gmail.com',
        PWD:'progettoWeb',
        CONFIRM:'http://localhost:12000/api/confirm/'
    }
}


exports.get = function get(env){
    return config[env] || config.default
}
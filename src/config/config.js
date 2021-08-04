//npm install express body-parser cookie-parser bcrypt mongoose jsonwebtoken nodemon
const config={
    production :{
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },
    default : {
        SECRET: 'mysecretkey',
        DATABASE: 'mongodb://localhost:27017/test'
    }
}


exports.get = function get(env){
    return config[env] || config.default
}
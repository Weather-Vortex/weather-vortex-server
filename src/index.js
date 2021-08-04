const express = require("express");
const mongoose = require("mongoose");
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const db=require('./config/config').get(process.env.NODE_ENV);

//database connection-> ps: l'ho modificato per tenere nascosto il link al database
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    if(err) console.log(err);
    console.log("database is connected");
});

const app = express();
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({ result: "ok" });
});

const userRoutes = require("./routes/user.routes");
app.use("/users", userRoutes);

const authRoutes= require("./routes/auth.routes");
app.use("/api",authRoutes);


app.listen(12000, () => {
  console.log(
    "Weather Vortex  Copyright (C) 2021  Lirussi Igor, Tentoni Daniele, Zandoli Silvia"
  );
  console.log("This program comes with ABSOLUTELY NO WARRANTY\n");
  console.log("Application running on http://localhost:12000");
});


module.exports = app;



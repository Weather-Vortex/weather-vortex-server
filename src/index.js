/*
    Web server for Weather Vortex project.
    Copyright (C) 2021  Lirussi Igor, Tentoni Daniele, Zandoli Silvia

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const express = require("express");
const mongoose = require("mongoose");
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const db=require('./config/config').get(process.env.NODE_ENV);

//database connection-> ps: l'ho modificato per tenere nascosto il link al database
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true,useCreateIndex: true },function(err){
    if(err) console.log(err);
    console.log("database is connected");
});

const app = express();
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ result: "ok" });
});

const userRoutes = require("./routes/user.routes");
app.use("/users", userRoutes);

const authRoutes= require("./routes/auth.routes");
app.use("/api",authRoutes);

const forecastRoutes = require("./routes/forecasts.routes");
app.use("/forecast", forecastRoutes);

app.listen(12000, () => {
  console.log(
    "Weather Vortex  Copyright (C) 2021  Lirussi Igor, Tentoni Daniele, Zandoli Silvia"
  );
  console.log("This program comes with ABSOLUTELY NO WARRANTY\n");
  console.log("Application running on http://localhost:12000");
});


// Export app to use it in unit testing.
module.exports = app;



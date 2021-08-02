const express = require("express");

const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Mongodb connection result:", res);
  })
  .catch((error) => {
    console.error("Mongodb connection error:", error);
  });

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ result: "ok" });
});

const userRoutes = require("./routes/user.routes");
app.use("/users", userRoutes);

app.listen(12000, () => {
  console.log("Application running on http://localhost:12000");
});

module.exports = app;

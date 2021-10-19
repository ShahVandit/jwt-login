const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const users = require("./routes/users");
const db = require("./config/key").MongoURI;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
app.use("/", users);

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Mongoose connected");
  })
  .catch((err) => console.log(err));

const PORT = process.env.development || 3000;

app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`listening on port ${PORT}`);
});

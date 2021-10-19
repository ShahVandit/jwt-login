const mongoose = require("mongoose");
// Defining schema
var user = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
});

const users = mongoose.model("User", user);
module.exports = users;

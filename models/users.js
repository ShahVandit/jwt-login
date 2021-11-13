const mongoose = require("mongoose");
// Defining schema
var user = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique:true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age:{
    type:Number,
    required:true
  },
  category:{
    type: String,
    required: true,
  },
  gender:{
    type: String,
    required: true,
  },
  date:{
    type:Date,
    required:true
  },
  time:{
    type:String,
    required:true
  },
  dateAndTime:{
    type: String,
    required: true,
  },
  otp:{
    type: String,
  },
  otpgen:{
    type: String,
  }
});

const users = mongoose.model("User", user);
module.exports = users;

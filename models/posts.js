const mongoose = require("mongoose");
// Defining schema
var posts = mongoose.Schema({
  likedby: {
    type: Array,
  },
  uname: {
    type: String,
  },
  imgname: {
    type: String,
  },
  post: {
    type: String,
    required: true,
  },
  comment: {
    type: Array,
  },
});

const post = mongoose.model("Posts", posts);
module.exports = post;

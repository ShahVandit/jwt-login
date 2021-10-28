const posts = require("../models/posts");
const users = require("../models/users");
const bcrypt = require("bcrypt");

const addUser = (email, password, username) => {
  const newUser = new users({
    email: email,
    password: password,
    username: username,
  });
  bcrypt.genSalt(10, (err, salt) =>
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) res.json({ error: err });
      newUser.password = hash;
      newUser
        .save()
        .then((user1) => {
          return user1;
        })
        .catch((err) => {
          return err;
        });
    })
  );
};

function addPost(username, post, imgname) {
  const newPost = new posts({
    uname: username,
    post: post,
    imgname: imgname,
  });
  newPost.save().then((post) => {
    console.log(post);
    return post;
  });
}

function addComment(id, like, commentby, likedby) {
  const ids = id;
  // If liked by the user
  if (like == true) {
    posts
      .findByIdAndUpdate(ids, {
        comment: commentby,
        likedby: likedby,
      })
      .then((post) => {
        if (post) {
          return post;
        } else {
          return false;
        }
      })
      .catch((err) => res.status(400).json({ error: err }));
    // If not liked
  } else {
    posts
      .findByIdAndUpdate(ids, {
        comment: commentby,
      })
      .then((post) => {
        if (post) {
          return post;
        } else {
          return false;
        }
      })
      .catch((err) => {
        return err;
      });
  }
}
module.exports = { addPost, addUser, addComment };

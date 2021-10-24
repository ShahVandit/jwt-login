const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const users = require("../models/users");
const posts = require("../models/posts");
const { JwtKey } = require("../config/key");
const decodeToken = require("../config/jwt").decodeToken;
const { verifyToken } = require("../config/jwt");
const { json } = require("body-parser");
const router = express.Router();

// Path and name of the post
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "posts");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 5,
};

const fileFilter = function (req, file, cb) {
  if (
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Please insert an image"), false);
  }
};
router.get("/dashboard", verifyToken, (req, res) => {
  const payload = decodeToken(req.cookies["jwt-token"]);
  console.log(payload);
  res.json({
    message: "authenticated successfully",
  });
});

const uploads = multer({ fileFilter, storage, limits });
router.post("/addpost", verifyToken, uploads.single("image"), (req, res) => {
  console.log(Date.now());
  const username = decodeToken(req.cookies["jwt-token"]);
  const post = req.body.post;
  const like = req.body.like;
  if (!post || !req.file) {
    res.status(403).json({ error: "Please enter post" });
  } else {
    const imgname = `${Date.now()}_${req.file.originalname}`;
    if (like == true) {
      const likers = [];
      likers.push(username);
      const newPost = new posts({
        uname: username,
        post: post,
        likedby: likers,
        imgname: imgname,
      });
      console.log(like);
      newPost
        .save()
        .then((post) => {
          res.status(200).json({ newPost: post, post: "Successful" });
        })
        .catch((err) => res.status(400).json({ error: err }));
    } else {
      const newPost = new posts({
        uname: username,
        post: post,
        imgname: imgname,
      });
      newPost.save().then((post) => {
        res.status(200).json({ newPost: post, post: "Successful" });
      });
    }
  }
});

router.get("/posts", verifyToken, (req, res) => {
  posts
    .find()
    .then((posts) => {
      if (posts) {
        res.status(200).json({ posts: posts });
      } else {
        res.status(404).json({ error: "not found" });
      }
    })
    .catch((err) => res.status(403).json({ error: err }));
});

router.get("/posts/:id", verifyToken, (req, res) => {
  var id = req.params.id;
  posts
    .findById(id)
    .then((posts) => {
      if (posts) {
        res.status(200).json({ posts: posts });
      } else {
        res.status(404).json({ error: "not found" });
      }
    })
    .catch((err) => res.status(403).json({ error: err }));
});

router.post("/posts/:id", verifyToken, (req, res) => {
  const username = decodeToken(req.cookies["jwt-token"]);
  const id = req.params.id;
  const like = req.body.like;
  const comments = req.body.comment;
  if (!comments) {
    res.status(400).json({ error: "Please enter comment" });
  } else {
    posts
      .findById(id)
      .then((post) => {
        const newComment = { user: username, comment: comments };
        const oldComments = post.comment;
        oldComments.push(newComment);
        if (post) {
          console.log(oldComments);
          const totalLikes = [];
          const newLike = username;
          console.log(post.likedby);
          const oldLikes = post.likedby;
          console.log(oldLikes);
          oldLikes.push(newLike);
          if (like == true) {
            posts
              .findByIdAndUpdate(id, {
                comment: oldComments,
                likedby: oldLikes,
              })
              .then((post) => {
                if (posts) {
                  res.status(200).json({ post: post });
                } else {
                  res.status(404).json({ error: "not found" });
                }
              })
              .catch((err) => res.status(400).json({ error: err }));
          } else {
            posts
              .findByIdAndUpdate(id, {
                comment: oldComments,
              })
              .then((post) => {
                if (posts) {
                  res.status(200).json({ post: post });
                } else {
                  res.status(404).json({ error: "not found" });
                }
              })
              .catch((err) => {
                console.log(err);
              });
          }
        } else {
          res.status(404).json({ error: "User not found" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.get("/myposts", verifyToken, (req, res) => {
  const username = decodeToken(req.cookies["jwt-token"]);
  posts
    .findOne({ uname: username })
    .then((post) => {
      if (post) {
        res.status(200).json({ postsbyme: post });
      } else {
        res.status(404).json({ error: "NO posts available" });
      }
    })
    .catch((err) => res.status(400).json({ error: err }));
});

router.get("/myposts/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  const username = decodeToken(req.cookies["jwt-token"]);
  posts.find({ _id: id, uname: username }).then((post) => {
    if (post.length == 0) {
      res.status(400).json({ error: "This is not your post" });
    } else {
      res.status(200).json({ post });
    }
  });
});

router.put("/myposts/:id", verifyToken, uploads.single("image"), (req, res) => {
  const id = req.params.id;
  const editpost = req.body.post;
  const img = req.file;
  const username = decodeToken(req.cookies["jwt-token"]);
  if (!editpost || !img) {
    res.status(400).json({ error: "Please enter posts" });
  }
  posts.find({ _id: id, uname: username }).then((post) => {
    if (post.length == 0) {
      res.status(400).json({ error: "This is not your post" });
    } else {
      const filename = `${Date.now()}_${req.file.originalname}`.toString();
      posts
        .findByIdAndUpdate(id, { imgname: filename, post: editpost })
        .then((post) => {
          res.status(200).json({ post });
        })
        .catch((err) => res.status(400).json({ errorss: err }));
    }
  });
});

router.delete("/myposts/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  const username = decodeToken(req.cookies["jwt-token"]);
  posts.find({ _id: id, uname: username }).then((post) => {
    if (post.length == 0) {
      res.status(400).json({ error: "This is not your post" });
    } else {
      posts
        .findByIdAndDelete(id)
        .then((post) => {
          res.status(200).json({ delpost: post });
        })
        .catch((err) => res.status(400).json({ error: err }));
    }
  });
});

router.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    res.status(400).json({
      error: "All fields should be filled",
    });
  } else {
    users.findOne({ username: username }).then((user1) => {
      if (user1 != null) {
        bcrypt.compare(password, user1.password, (err, result) => {
          if (err) {
            res.status(401).json({ error: "err" });
          } else {
            if (!result) {
              res.status(403).json({ error: "Wrong password" });
            } else {
              var emailid = user1.email;
              var username1 = req.body.username;
              var token = jwt.sign(
                {
                  email: emailid,
                  username: username1,
                },
                JwtKey,
                {
                  expiresIn: "1h",
                }
              );
              if (token) {
                res.cookie("jwt-token", token, {
                  maxAge: 60 * 60 * 24 * 2 * 2,
                  httpOnly: true,
                });
              }
              res.json({ message: "successfully logged in" });
            }
          }
        });
      } else {
        res.status(404).json({ error: "USer not found" });
      }
    });
  }
});

router.post("/register", (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !email || !password) {
    res.status(400).json({
      error: "All fields should be filled",
    });
  } else {
    users.findOne({ username }).then((user) => {
      if (user != null) {
        res.status(409).json({
          error: "username taken",
        });
      } else {
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
                res.json(user1);
              })
              .catch((err) => res.json({ error: err }));
          })
        );
      }
    });
  }
});

router.put("/changepass", (req, res) => {
  // res.json("put pass");
  const { username, password } = req.body;
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        res.json({ error: err });
      } else {
        var hashpassword = hash;
      }
      users.findOneAndUpdate(
        { username },
        { password: hashpassword },
        (err, result) => {
          if (err) {
            res.status(404).json({ error: err });
          } else {
            if (!result) {
              res.json({ error: "user doesnot exist,please register" });
            } else {
              res.json({ result: result, password: password });
            }
          }
        }
      );
    });
  });
});
module.exports = router;

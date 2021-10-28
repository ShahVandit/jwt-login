const express = require("express");
const bcrypt = require("bcrypt");
const users = require("../models/users");
const { verifyToken, signToken } = require("../config/jwt");
const { getPosts, addUser } = require("../config/dbops");

const router = express.Router();
// After logging in
router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "authenticated successfully",
  });
});

// Login Route
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
              var token = signToken(emailid, username1);
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
// Register route
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
        addUser(email, password, username);
        if (addUser) {
          res.status(200).json({ message: "User added successfully" });
        }
      }
    });
  }
});

// Change password route
router.put("/changepass", (req, res) => {
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

// router.all("*", (req, res) => {
//   res.status(404).json("Error 404");
// });
module.exports = router;

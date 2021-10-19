const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../models/users");
const { JwtKey } = require("../config/key");
const { verifyToken } = require("../config/jwt");
const router = express.Router();
router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "authenticated successfully",
    userloggedin: verifyToken,
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
                  maxAge: 60 * 60 * 24 * 2,
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

const express = require("express");
const bcrypt = require("bcrypt");
const speakeasy=require('speakeasy');
const nodemailer=require('nodemailer');
const users = require("../models/users");
const { verifyToken, signToken,decodeToken } = require("../config/jwt");
const { getPosts, addUser } = require("../config/dbops");

const router = express.Router();
// After logging in
router.get("/dashboard", verifyToken, (req, res) => {
  console.log(req.cookies);
  res.json({
    message: "authenticated successfully",
  });
});

router.put("/changepass",verifyToken, (req, res) => {
  const { password } = req.body;
  const email= decodeToken(req.cookies['jwt-token']);
  console.log(email);
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        res.json({ error: err });
      } else {
        var hashpassword = hash;
      }
      users.findOneAndUpdate(
        { email },
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



// Login Route
router.post("/login", (req, res) => {
  const email = req.body.email;
  if (!email) {
    res.status(400).json({
      error: "All fields should be filled",
    });
  } else {
    users.findOne({ email: email }).then((user1) => {
      if (user1 != null) {
        const secret = speakeasy.generateSecret({ length: 20 });
        const token = speakeasy.totp({
          secret: secret.base32,
          encoding: "base32",
        });

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "vanditashah12@gmail.com",
            pass: "yoyovandu1234",
          },
        });
        const options = {
          from: "vanditashah12@gmail.com",
          to: email,
          subject: "Your login otp",
          text: `Your OTP is: ${token}, it is valid for 5 minutes`,
        };
        const date=Date.now();
        users.findOneAndUpdate({email},{otp:token,otpgen:String(date)})
        .then((user)=>console.log('upad0 ',user))
        .catch(err=>console.log(err));
        transporter.sendMail(options, (err, info) => {
          if (err) {
            res.status(400).json(err);
          }
          res.status(200).json({ message: "otp sent",token });
        });
      
      } else {
        res.status(404).json({ error: "USer not found" });
      }
    });
  }
});

// Verify OTP
router.post("/verify", (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;
  if (otp) {
    users.findOne({ email,otp }).then((user1) => {
      const fiveMins = 5 * 60 * 1000;
      if(user1!=null){
        if(Number(Date.now())-Number(user1.otpgen)>fiveMins){
          res.status(400).json({error:'Otp expired'});
        }
        const jwt = signToken(email);
        if (jwt) {
          res.cookie("jwt-token", jwt, {
            maxAge: 60 * 60 * 24 * 2 * 2,
            httpOnly: true,
          });
        }
        res.json({msg:"Successful"});
      }
      else{
        // console.log(Number(Date.now())-Number(user1.otpgen));
        res.json({error:'Invalid OTP'});
      }
    })
  }
});

// Register route
router.post("/register", (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const age=req.body.age;
  const gender=req.body.gender;
  const category=req.body.category;
  const currentDate = new Date();
  console.log(email,age,name,password);
  const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
  const date = `${currentDate.getFullYear()}-${
  currentDate.getMonth() + 1
}-${currentDate.getDate()}`;
  const dateAndTime = `${date} ${time}`;
  const testMail =
    /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (!name || !email || !password ||! age || !gender || !category) {
    console.log(req.body);
    res.status(400).json({
      error: "All fields should be filled",
    });
  } 
  if(testMail.test(email)==false){
    res.status(400).json({
      error: "Enter valid email",
    });
  }
  else {
    users.findOne({ email }).then((user) => {
      if (user != null) {
        res.status(409).json({
          error: "username taken",
        });
      } else {
        const addUser=new users({
          name,email,password,age,gender,category,date,time,dateAndTime
        })
        addUser.save()
        .then((user)=>{
          res.status(200).json({user});
        })
        .catch(err=>res.status(400).json({err}))
      }
    });
  }
});

// Change password route


// router.all("*", (req, res) => {
//   res.status(404).json("Error 404");
// });
module.exports = router;

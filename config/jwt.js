const jwt = require("jsonwebtoken");
const { JwtKey } = require("./key");

const signToken = (email, username) => {
  const token = jwt.sign({ email, username }, JwtKey, {
    expiresIn: "1h",
  });
  return token;
};

const verifyToken = (req, res, next) => {
  const accessToken = req.cookies["jwt-token"];
  if (!accessToken) {
    res.status(400).json({ error: "User not Authenticated!" });
  } else {
    var verify = jwt.verify(accessToken, JwtKey);
    try {
      if (verify) {
        next();
      } else {
        res.status(403).json("You are not logged in");
      }
    } catch (err) {
      res.status(400).json({ error: err });
    }
    return accessToken;
  }
};

const decodeToken = (token) => {
  const payload = jwt.decode(token);
  return payload.username;
};

module.exports = { verifyToken, decodeToken, signToken };

const jwt = require("jsonwebtoken");
const { JwtKey } = require("./key");

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

module.exports = { verifyToken };

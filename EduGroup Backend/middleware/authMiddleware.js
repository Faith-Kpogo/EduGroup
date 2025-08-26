const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(403);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  if (err) {
    console.error("JWT verification failed:", err);
    return res.sendStatus(403);
  }
  console.log("Decoded user:", user);
  req.user = user;
  next();
});
}

module.exports = authenticateToken;

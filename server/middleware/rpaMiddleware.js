function rpaAuth(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.RPA_API_KEY) {
    console.log("Invalid RPA access attempt");
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
}

module.exports = rpaAuth;

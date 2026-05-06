const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const incidentRoutes = require('./routes/incidentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error(err));

// Routes
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // Demo admin account
  const adminEmail = "admin@dhl.com";
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  if (email !== adminEmail) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, adminPasswordHash);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { email, role: "admin" },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "1h" }
  );

  res.json({ token });
});

app.use('/api', incidentRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error(err));

// Step 5.3: Technology/Algorithm - The Incident Schema
const incidentSchema = new mongoose.Schema({
  source: String,           // e.g., "WhatsApp", "Email"
  rawContent: String,       // Messy input from DHL reports
  status: { type: String, default: 'Pending' }, // Mandatory Workflow
  cleanSummary: String,     // To be filled by LLM later
  createdAt: { type: Date, default: Date.now }
});

const Incident = mongoose.model('Incident', incidentSchema);

// Step 5.4: Network Elements - The REST API Endpoint
app.post('/api/incidents', async (req, res) => {
  try {
    const newIncident = new Incident({
      source: req.body.source,
      rawContent: req.body.rawContent
    });
    
    await newIncident.save();
    console.log("New incident logged from UiPath!");
    res.status(201).json({ message: "Success", id: newIncident._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
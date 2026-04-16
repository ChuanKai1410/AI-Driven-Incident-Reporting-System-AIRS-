const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Step 5.4: Network Elements - The REST API Endpoint
app.post('/api/incidents', async (req, res) => {
  try {
    const { source, rawContent } = req.body;

    // AI Processing: Summarize messy content
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a DHL logistics assistant. Summarize this messy report into a professional 1-sentence incident title and 3 clear bullet points: "${rawContent}"`;
    
    const result = await model.generateContent(prompt);
    const cleanSummary = result.response.text();

    const newIncident = new Incident({
      source,
      rawContent,
      cleanSummary, // This is your AI-generated "Structured Article"
      status: 'Pending'
    });

    await newIncident.save();
    res.status(201).json({ message: "Incident logged & summarized!", cleanSummary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
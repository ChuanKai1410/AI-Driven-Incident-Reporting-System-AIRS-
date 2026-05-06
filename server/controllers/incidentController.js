const { GoogleGenerativeAI } = require("@google/generative-ai");
const Incident = require("../models/Incident");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateWithRetry(prompt, retries = 3) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.log(`Gemini retry ${i + 1} failed:`, err.message);

      if (i === retries - 1) {
        throw err;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function getEmbedding(text) {
  const model = genAI.getGenerativeModel({
    model: "gemini-embedding-001"
  });

  const result = await model.embedContent(text);

  return result.embedding.values; // array of numbers
}

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  return dot / (magA * magB);
}

function extractJson(text) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No valid JSON object found in Gemini response");
  }

  return cleaned.substring(start, end + 1);
}

exports.createIncident = async (req, res) => {
  if (!req.body.rawContent) {
    return res.status(400).json({ 
      error: "Validation Failed", 
      message: "The property 'rawContent' is missing from your JSON body." 
    });
  }

  const rawContent = req.body.rawContent.trim();

  // 2. Check if it's just an empty string
  if (rawContent === "") {
    return res.status(400).json({ 
      error: "Validation Failed", 
      message: "rawContent cannot be empty." 
    });
  }

  try {
    const { source, rawContent: rawContentBody } = req.body;

    // AI Processing: Summarize messy content
    const prompt = `
You are a DHL incident management AI.

Analyze the following messy incident report and return ONLY valid JSON.

Raw report:
"${rawContent}"

Return this JSON format:
{
  "title": "short professional incident title",
  "summary": "clean and professional summary",
  "category": "Delivery Delay | Address Issue | Damaged Parcel | System Error | Customer Complaint | Other",
  "priority": "Low | Medium | High | Critical",
  "department": "Customer Support | Warehouse | Delivery Operations | IT Support | Claims Department",
  "reason": "short reason for the classification"
}
`;
    
    const text = await generateWithRetry(prompt);
    const parsed = JSON.parse(extractJson(text));

    const newEmbedding = await getEmbedding(parsed.summary);

    const existingIncidents = await Incident
      .find({ embedding: { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(5);

    let isDuplicate = false;
    let duplicateId = null;
    let highestScore = 0;
    let bestDuplicate = null;

    for (let inc of existingIncidents) {
      if (!inc.embedding || inc.category !== parsed.category) continue;

      const score = cosineSimilarity(newEmbedding, inc.embedding);

      if (score > highestScore) {
        highestScore = score;
        bestDuplicate = inc;
      }
    }

    if (highestScore >= 0.78 && bestDuplicate) {
      isDuplicate = true;
      duplicateId = bestDuplicate._id;
    }

    // auto merge logic
    if (isDuplicate && duplicateId) {
      await Incident.findByIdAndUpdate(duplicateId, {
        $push: {
          relatedReports: {
            source,
            rawContent: rawContentBody,
            cleanSummary: parsed.summary,
            priority: parsed.priority,
            createdAt: new Date()
          }
        }
      });
    }

    const newIncident = new Incident({
      source,
      rawContent: rawContentBody,
      title: parsed.title,
      cleanSummary: parsed.summary,
      category: parsed.category,
      priority: parsed.priority,
      department: parsed.department,
      status: 'Pending',
      embedding: newEmbedding,
      isDuplicate,
      duplicateOf: duplicateId
    });

    await newIncident.save();

    // clustering
    const cluster = await Incident.find({
      embedding: { $exists: true }
    });

    const similarGroup = cluster.filter(inc => {
      const score = cosineSimilarity(newEmbedding, inc.embedding);
      return score > 0.8;
    });

    // auto merge
    if (isDuplicate) {
      await Incident.findByIdAndUpdate(duplicateId, {
        $push: {
          relatedReports: rawContentBody
        }
      });
    }
    res.status(201).json({ message: "Incident logged & summarized!", incident: newIncident });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getIncidents = async (req, res) => {
  try {
    // Finds all incidents and sorts them by newest first
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.status(200).json(incidents);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch incidents from database" });
  }
};

exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.status(200).json(incident);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch incident from database" });
  }
};

exports.updateIncidentStatus = async (req, res) => {
  const { status } = req.body;

  const updated = await Incident.findByIdAndUpdate(
    req.params.id,
    { status, updatedAt: new Date() },
    { new: true }
  );

  res.json(updated);
};

exports.deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.status(200).json({ message: "Incident deleted successfully!" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ error: "Failed to delete incident" });
  }
};

exports.getClusters = async (req, res) => {
  try {
    const incidents = await Incident.find();

    const clusters = {};

    for (let inc of incidents) {
      const key = inc.category || "Other";

      if (!clusters[key]) {
        clusters[key] = [];
      }

      clusters[key].push(inc);
    }

    res.json(clusters);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch clusters" });
  }
};

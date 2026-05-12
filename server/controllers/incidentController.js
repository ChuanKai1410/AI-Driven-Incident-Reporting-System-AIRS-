const { GoogleGenerativeAI } = require("@google/generative-ai");
const Incident = require("../models/Incident");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

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
  "summary": [
    "key operational point 1",
    "key operational point 2",
    "key operational point 3"
  ],
  "category": "Delivery Delay | Address Issue | Damaged Parcel | System Error | Customer Complaint | Other",
  "priority": "Low | Medium | High | Critical",
  "department": "Customer Support | Warehouse | Delivery Operations | IT Support | Claims Department",
  "reason": "short reason for the classification"
}
IMPORTANT:
- summary must be concise operational bullet points
- each point must be short and actionable
- do not return paragraph format
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

    // AUTO MERGE DUPLICATE
    if (isDuplicate && duplicateId) {

      const mergedIncident = await Incident.findByIdAndUpdate(
        duplicateId,
        {
          $push: {
            relatedReports: {
              source,
              rawContent: rawContentBody,
              cleanSummary: parsed.summary,
              priority: parsed.priority,
              createdAt: new Date()
            }
          }
        },
        { returnDocument: "after" }
      );

      return res.status(200).json({
        message: "Duplicate incident merged successfully",
        incident: mergedIncident
      });
    }

    // CREATE NEW INCIDENT ONLY IF NOT DUPLICATE
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
    { returnDocument: "after" }
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
    const incidents = await Incident.find({
      embedding: { $exists: true, $ne: [] }
    }).sort({ createdAt: -1 });

    const visited = new Set();
    const clusters = [];

    for (let i = 0; i < incidents.length; i++) {
      const base = incidents[i];

      if (visited.has(base._id.toString())) continue;

      const group = [base];
      visited.add(base._id.toString());

      for (let j = i + 1; j < incidents.length; j++) {
        const compare = incidents[j];

        if (visited.has(compare._id.toString())) continue;
        if (!base.embedding || !compare.embedding) continue;

        const score = cosineSimilarity(base.embedding, compare.embedding);

        if (score >= 0.75) {
          group.push({
            ...compare.toObject(),
            similarityScore: score
          });

          visited.add(compare._id.toString());
        }
      }

      clusters.push({
        clusterName: `${base.category || "Other"} Pattern`,
        clusterType: "Embedding Similarity Cluster",
        representativeIncident: base,
        incidentCount: group.length,
        averageSimilarity:
          group.length > 1
            ? group
                .slice(1)
                .reduce((sum, inc) => sum + (inc.similarityScore || 1), 0) /
              (group.length - 1)
            : 1,
        incidents: group
      });
    }

    res.json(clusters);
  } catch (err) {
    console.error("Cluster Error:", err.message);
    res.status(500).json({ error: "Failed to fetch semantic clusters" });
  }
};

exports.uploadIncidentFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let rawContent = "";
    const filePath = req.file.path;
    const originalName = req.file.originalname.toLowerCase();

    if (originalName.endsWith(".txt")) {
      rawContent = fs.readFileSync(filePath, "utf-8");
    } 
    else if (originalName.endsWith(".pdf")) {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      rawContent = pdfData.text;
    } 
    else if (originalName.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ path: filePath });
      rawContent = result.value;
    } 
    else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "Unsupported file type" });
    }

    fs.unlinkSync(filePath);

    req.body.rawContent = rawContent;
    req.body.source = "Manual Upload";

    return exports.createIncident(req, res);

  } catch (err) {
    console.error("Upload Error:", err.message);
    res.status(500).json({ error: "Failed to process uploaded file" });
  }
};

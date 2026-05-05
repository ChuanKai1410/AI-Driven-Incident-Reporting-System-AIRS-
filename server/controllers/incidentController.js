const { GoogleGenerativeAI } = require("@google/generative-ai");
const Incident = require("../models/Incident");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const prompt = `
You are a DHL logistics incident analyst.

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
    
    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();

    // Clean up potential markdown formatting from Gemini response
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedData = JSON.parse(responseText);

    const newIncident = new Incident({
      source,
      rawContent: rawContentBody,
      title: parsedData.title,
      cleanSummary: parsedData.summary,
      category: parsedData.category,
      priority: parsedData.priority,
      department: parsedData.department,
      status: 'Pending'
    });

    await newIncident.save();
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
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value. Allowed values: Pending, In Progress, Resolved, Rejected" });
    }

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    res.status(200).json({ message: "Incident status updated!", incident });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: "Failed to update incident status" });
  }
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

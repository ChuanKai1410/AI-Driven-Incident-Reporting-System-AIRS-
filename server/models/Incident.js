const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  source: String,
  rawContent: String,

  title: String,
  cleanSummary: String,

  category: String,        // Delivery Delay, Damaged Parcel, Address Issue, System Error, Complaint
  priority: String,        // Low, Medium, High, Critical
  department: String,      // Customer Support, Warehouse, Delivery, IT Support

  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending' 
  },

  isDuplicate: { 
    type: Boolean, 
    default: false 
  },

  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    default: null
  },

  embedding: [Number],

  relatedReports: [
    {
      source: String,
      rawContent: String,
      cleanSummary: String,
      priority: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  createdAt: { 
    type: Date, 
    default: Date.now 
  },

  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;

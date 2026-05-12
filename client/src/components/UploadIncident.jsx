import React, { useState } from 'react';
import axios from 'axios';

const UploadIncident = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await axios.post("http://localhost:5000/api/incidents/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Operational report successfully processed by AIRS AI engine.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full col-span-full">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              AI Incident Intake Console
            </h2>

            <p className="text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Upload operational reports in TXT, PDF or DOCX format. AIRS automatically extracts raw operational data, analyzes incident patterns using Gemini AI, detects semantic similarities, and converts fragmented reports into structured operational intelligence.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-2xl bg-red-100">
            <div className="text-3xl">📥</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 border border-red-100">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
              Supported Formats
            </p>

            <p className="mt-2 font-bold text-slate-800">
              TXT / PDF / DOCX
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-red-100">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
              AI Processing
            </p>

            <p className="mt-2 font-bold text-slate-800">
              Gemini AI
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-red-100">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
              Semantic Detection
            </p>

            <p className="mt-2 font-bold text-slate-800">
              Embedding Analysis
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-red-100">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
              Automation
            </p>

            <p className="mt-2 font-bold text-slate-800">
              Operational Intake
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Upload Operational Report
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              AIRS will automatically extract, analyze and structure the uploaded operational incident report.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
            />

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
            >
              {uploading ? "Processing..." : "Upload & Analyze"}
            </button>
          </div>
        </div>

        {/* Upload Status */}
        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600 font-medium">
                AI Processing Operational Report...
              </p>

              <p className="text-sm text-red-600 font-semibold">
                Gemini AI Active
              </p>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div className="bg-red-500 h-3 rounded-full animate-pulse w-3/4" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                📄 Text Extraction
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                🧠 AI Analysis
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                🔁 Similarity Detection
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                📊 Operational Structuring
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadIncident;

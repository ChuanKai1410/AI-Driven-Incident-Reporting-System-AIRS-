import React, { useState } from 'react';
import axios from 'axios';

const UploadIncident = () => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/api/incidents/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("File uploaded and processed successfully.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to upload file.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-3 items-center">
      <input
        type="file"
        accept=".txt,.pdf,.docx"
        onChange={(e) => setFile(e.target.files[0])}
        className="text-sm"
      />

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
      >
        Upload & Process
      </button>
    </div>
  );
};

export default UploadIncident;

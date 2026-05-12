import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { ArrowLeft, AlertTriangle, FileText, Bot, Tag, ShieldAlert, Building2, Trash2, User } from 'lucide-react';
import axios from 'axios';

function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const res = await api.get(`/api/incidents/${id}`);
        setIncident(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchIncident();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/api/incidents/${id}/status`, { status: newStatus });
      const res = await api.get(`/api/incidents/${id}`);
      setIncident(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this incident?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/incidents/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      alert("Incident deleted successfully.");
      navigate("/incidents");
    } catch (err) {
      console.error(err);
      alert("Failed to delete incident.");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-slate-500">Loading incident details...</div>;
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Incident Not Found</h2>
        <p className="text-slate-500 mb-6">The incident you're looking for doesn't exist or has been removed.</p>
        <Link to="/incidents" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div>
          <button onClick={() => navigate('/incidents')} className="text-slate-500 hover:text-slate-700 flex items-center gap-2 mb-4 text-sm font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Incidents
          </button>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{incident.title || 'Untitled Incident'}</h1>
              <p className="text-slate-500 mt-1">Reported via {incident.source} • {new Date(incident.createdAt).toLocaleString()}</p>
            </div>
            
            {/* Status Dropdown */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-sm font-medium text-slate-600 pl-2">Status:</span>
                <select 
                  value={incident.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                  className="block pl-3 pr-8 py-1.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-red-500 disabled:opacity-50 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Duplicate Warning */}
        {incident.isDuplicate && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-800 font-medium">Duplicate Incident Detected</h3>
              <p className="text-amber-700 text-sm mt-1">This incident has been flagged as a potential duplicate of another report.</p>
            </div>
          </div>
        )}

        {/* Consolidated Warning */}
        {incident.relatedReports?.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <p className="text-blue-800 text-sm font-medium">
              This incident has been automatically consolidated from multiple duplicate reports.
            </p>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard icon={<Tag className="h-5 w-5 text-blue-500" />} label="Category" value={incident.category || 'Uncategorized'} />
          <InfoCard icon={<ShieldAlert className={`h-5 w-5 ${getPriorityColor(incident.priority)}`} />} label="Priority" value={incident.priority || 'Not Set'} />
          <InfoCard icon={<Building2 className="h-5 w-5 text-indigo-500" />} label="Suggested Department" value={incident.department || 'Not Assigned'} />
          <InfoCard icon={<User className="h-5 w-5 text-slate-500" />} label="Created By" value={incident.createdBy || 'Unknown'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Clean Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50/50 flex items-center gap-2">
              <Bot className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-800">AI Clean Summary</h2>
            </div>
            <div className="p-6 flex-1">
              {Array.isArray(incident.cleanSummary) ? (
                <ul className="space-y-3 list-disc list-inside">
                  {incident.cleanSummary.map((point, index) => (
                    <li
                      key={index}
                      className="text-slate-700 leading-relaxed"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {incident.cleanSummary || 'No summary available.'}
                </p>
              )}
            </div>
          </div>

          {/* Raw Content */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full max-h-96">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2 shrink-0">
              <FileText className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-800">Raw Content</h2>
            </div>
            <div className="p-6 bg-slate-50 text-slate-600 font-mono text-sm leading-relaxed flex-1 overflow-y-auto whitespace-pre-wrap">
              {incident.rawContent || 'No raw content available.'}
            </div>
          </div>
        </div>

        {incident.relatedReports?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-purple-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Related Reports Timeline
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Duplicate operational reports consolidated into this incident
                </p>
              </div>

              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                {incident.relatedReports.length} Merged Reports
              </span>
            </div>

            {/* Timeline */}
            <div className="p-6 space-y-6">
              {incident.relatedReports.map((report, index) => (
                <div
                  key={index}
                  className="relative pl-8 border-l-2 border-purple-200"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-[-9px] top-1 w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow" />

                  {/* Report Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    
                    {/* Top Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {report.source || "Unknown Source"}
                        </span>

                        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          {report.priority || "Unclassified"}
                        </span>
                      </div>

                      <span className="text-xs text-slate-500">
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        AI Operational Summary
                      </p>

                      {Array.isArray(report.cleanSummary) ? (
                        <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
                          {report.cleanSummary.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {report.cleanSummary}
                        </p>
                      )}
                    </div>

                    {/* Raw Content */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-purple-700 font-medium hover:text-purple-800">
                        View Raw Report
                      </summary>

                      <div className="mt-3 bg-white border border-slate-200 rounded-lg p-4 text-xs font-mono text-slate-600 whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {report.rawContent}
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  );
}

// Helper component
function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
      <div className="p-2 bg-slate-50 rounded-lg shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'Critical': return 'text-red-600';
    case 'High': return 'text-orange-500';
    case 'Medium': return 'text-blue-500';
    case 'Low': return 'text-slate-500';
    default: return 'text-slate-400';
  }
}

export default IncidentDetail;

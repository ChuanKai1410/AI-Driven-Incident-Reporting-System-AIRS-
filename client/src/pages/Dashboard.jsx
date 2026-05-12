import React, { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    // Fetch data from your MERN backend
    api.get('/api/incidents')
      .then(res => {
        setIncidents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    api.get('/api/incidents/clusters')
      .then(res => setClusters(res.data))
      .catch(err => console.error(err));
  }, []);

  const pieData = clusters.map(cluster => ({
    name: cluster.clusterName,
    value: cluster.incidentCount
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

  const stats = {
    total: incidents.length,
    pending: incidents.filter(i => i.status === 'Pending').length,
    inProgress: incidents.filter(i => i.status === 'In Progress').length,
    resolved: incidents.filter(i => i.status === 'Resolved').length,
    critical: incidents.filter(i => i.priority === 'Critical').length,
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <LayoutDashboard className="text-red-600 h-8 w-8" />
              Incident Dashboard
            </h1>
            <p className="text-slate-500 mt-1">Real-time overview of automated incident reports</p>
          </div>
          <Link
            to="/incidents"
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            View All Incidents
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard title="Total Incidents" value={stats.total} icon={<FileText className="h-6 w-6 text-blue-600" />} bgColor="bg-blue-50" />
          <StatCard title="Pending" value={stats.pending} icon={<Clock className="h-6 w-6 text-amber-600" />} bgColor="bg-amber-50" />
          <StatCard title="In Progress" value={stats.inProgress} icon={<AlertCircle className="h-6 w-6 text-purple-600" />} bgColor="bg-purple-50" />
          <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle2 className="h-6 w-6 text-emerald-600" />} bgColor="bg-emerald-50" />
          <StatCard title="Critical Cases" value={stats.critical} icon={<AlertTriangle className="h-6 w-6 text-red-600" />} bgColor="bg-red-50" />
        </div>

        {/* Cluster Visualization */}
        <div>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 mb-6">
            
            <div className="flex items-start justify-between gap-6">
              
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  AI Operational Intelligence
                </h2>

                <p className="text-slate-600 mt-2 max-w-3xl leading-relaxed">
                  AIRS uses Gemini embeddings and cosine similarity to identify semantically related operational incidents, detect duplicate escalation patterns, and consolidate fragmented reports into centralized operational intelligence clusters.
                </p>
              </div>

              <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-100">
                <div className="text-3xl">🧠</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

              <div className="bg-white rounded-xl p-4 border border-purple-100">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                  AI Embedding Engine
                </p>

                <p className="mt-2 font-bold text-slate-800">
                  Gemini Embeddings
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-purple-100">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                  Similarity Detection
                </p>

                <p className="mt-2 font-bold text-slate-800">
                  Cosine Similarity
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-purple-100">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                  Operational Clusters
                </p>

                <p className="mt-2 font-bold text-slate-800">
                  {clusters.length} Active AI Clusters
                </p>
              </div>

            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 self-start">Semantic Operational Pattern Distribution</h2>
            <PieChart width={400} height={300}>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
            <div className="mt-6 w-full bg-slate-50 border border-slate-200 rounded-xl p-4">
  
              <h3 className="font-semibold text-slate-800 mb-3">
                AI Operational Insights
              </h3>

              <div className="space-y-3 text-sm text-slate-600">

                <div className="flex items-start gap-2">
                  <span>⚠️</span>
                  <p>
                    {clusters.length > 0
                      ? `${clusters[0].incidentCount} semantically related incidents detected in the largest operational cluster.`
                      : "No operational clusters detected."}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span>🧠</span>
                  <p>
                    AIRS identified operational similarities beyond simple keyword matching using embedding vectors.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span>🔁</span>
                  <p>
                    Duplicate escalation patterns were automatically consolidated into unified operational incidents.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Cluster List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-h-[600px] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">AI Embedding-Based Incident Clusters</h2>
            {clusters.map((cluster, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-xl p-5 mb-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      {cluster.clusterName}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {cluster.incidentCount} semantically similar incidents detected
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        cluster.incidentCount >= 3
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {cluster.incidentCount >= 3
                          ? "High Operational Risk"
                          : "Moderate Operational Risk"}
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    Embedding Cluster
                  </span>
                </div>

                <div className="mb-4">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
                    <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-2">
                      AI Pattern Insight
                    </p>
                    <p className="text-sm text-indigo-800 leading-relaxed">
                      AIRS detected semantically related operational reports that may indicate repeated process failures, communication gaps, or recurring logistics bottlenecks.
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 mb-1">Average Similarity</p>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.round(cluster.averageSimilarity * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {Math.round(cluster.averageSimilarity * 100)}% semantic similarity
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Representative Incident
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    <Link to={`/incidents/${cluster.representativeIncident?._id}`} className="hover:text-red-600 hover:underline transition-colors">
                      {cluster.representativeIncident?.title || "Untitled Incident"}
                    </Link>
                  </p>
                </div>

                <div className="space-y-2">
                  {cluster.incidents.map((inc, i) => (
                    <div
                      key={inc._id || i}
                      className="p-3 border border-slate-100 rounded-lg bg-slate-50"
                    >
                      <div className="flex justify-between gap-3">
                        <Link to={`/incidents/${inc._id}`} className="text-sm font-medium text-slate-800 hover:text-red-600 hover:underline transition-colors">
                          {inc.title || "Untitled Incident"}
                        </Link>

                        {inc.similarityScore && (
                          <span className="text-xs text-purple-700 font-semibold">
                            {Math.round(inc.similarityScore * 100)}%
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {inc.cleanSummary}
                      </p>
                      
                      {inc.isDuplicate && (
                        <span className="text-xs text-red-500 font-medium mt-1 block flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Duplicate
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Incident List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">Recent Incidents</h2>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading incidents...</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Title & Source</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Priority</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Created By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incidents.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                        No incidents found
                      </td>
                    </tr>
                  ) : (
                    incidents.map(inc => (
                      <tr key={inc._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            <Link to={`/incidents/${inc._id}`} className="hover:text-red-600 hover:underline transition-colors">
                              {inc.title || 'Untitled Incident'}
                            </Link>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Source: {inc.source}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {inc.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={inc.priority} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={inc.status} />
                        </td>
                        <td className="px-6 py-4">
                          {inc.createdBy || 'Unknown'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// Helper Components for UI
function StatCard({ title, value, icon, bgColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg ${bgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    'Low': 'bg-slate-100 text-slate-700',
    'Medium': 'bg-blue-100 text-blue-700',
    'High': 'bg-orange-100 text-orange-700',
    'Critical': 'bg-red-100 text-red-700 font-bold border border-red-200'
  };
  
  const style = styles[priority] || styles['Low'];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {priority || 'Not Set'}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'Pending': 'bg-amber-100 text-amber-800',
    'In Progress': 'bg-purple-100 text-purple-800',
    'Resolved': 'bg-emerald-100 text-emerald-800',
    'Rejected': 'bg-slate-100 text-slate-600 line-through'
  };
  
  const style = styles[status] || styles['Pending'];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status || 'Unknown'}
    </span>
  );
}

export default Dashboard;

import React, { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clusters, setClusters] = useState({});

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

  const pieData = Object.entries(clusters).map(([key, value]) => ({
    name: key,
    value: value.length
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 self-start">Cluster Distribution</h2>
            <PieChart width={400} height={300}>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          {/* Cluster List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-h-[400px] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Clusters</h2>
            {Object.entries(clusters).map(([category, incList]) => (
              <div key={category} className="cluster-card">
                <h3 className="font-bold text-lg">{category} ({incList.length})</h3>
                {incList.map(inc => (
                  <div key={inc._id} className="incident-item">
                    <strong>
                      <Link to={`/incidents/${inc._id}`} className="hover:text-red-600 hover:underline transition-colors">
                        {inc.title || 'Untitled Incident'}
                      </Link>
                    </strong>
                    <p className="text-sm text-gray-600 mt-1">{inc.cleanSummary}</p>
                    {inc.isDuplicate && (
                      <span style={{ color: 'red', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>⚠ Duplicate</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
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

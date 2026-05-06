import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, List } from 'lucide-react';
import { Link } from 'react-router-dom';

function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/incidents', {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => {
        setIncidents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filter Logic
  const filteredIncidents = incidents.filter(inc => {
    const searchVal = searchTerm.toLowerCase();
    const matchesSearch = (inc.title && inc.title.toLowerCase().includes(searchVal)) || 
                          (inc.source && inc.source.toLowerCase().includes(searchVal));
    
    const matchesStatus = statusFilter ? inc.status === statusFilter : true;
    const matchesCategory = categoryFilter ? inc.category === categoryFilter : true;
    const matchesPriority = priorityFilter ? inc.priority === priorityFilter : true;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <List className="text-red-600 h-8 w-8" />
              Incident List
            </h1>
            <p className="text-slate-500 mt-1">Detailed view and filtering of all incidents</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
          
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="">All Categories</option>
              <option value="Delivery Delay">Delivery Delay</option>
              <option value="Address Issue">Address Issue</option>
              <option value="Damaged Parcel">Damaged Parcel</option>
              <option value="System Error">System Error</option>
              <option value="Customer Complaint">Customer Complaint</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading incidents...</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="px-6 py-4 font-medium">Source</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Priority</th>
                    <th className="px-6 py-4 font-medium">Department</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                        No incidents match your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map(inc => (
                      <tr key={inc._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 truncate max-w-[200px]" title={inc.title}>
                          <Link to={`/incidents/${inc._id}`} className="hover:text-red-600 hover:underline transition-colors">
                            {inc.title || 'Untitled Incident'}
                          </Link>
                        </td>
                        <td className="px-6 py-4">{inc.source}</td>
                        <td className="px-6 py-4">{inc.category || '-'}</td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={inc.priority} />
                        </td>
                        <td className="px-6 py-4">{inc.department || '-'}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={inc.status} />
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(inc.createdAt).toLocaleString()}
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
  );
}

// Reused Helper Components
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

export default IncidentList;

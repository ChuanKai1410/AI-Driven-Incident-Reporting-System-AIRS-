import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    // Fetch data from your MERN backend
    axios.get('http://localhost:5000/api/incidents')
      .then(res => setIncidents(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>📦 DHL Incident Dashboard</h1>
      <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Source</th>
            <th>Summary (AI)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map(inc => (
            <tr key={inc._id}>
              <td>{inc.source}</td>
              <td>{inc.cleanSummary}</td>
              <td><strong>{inc.status}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default App;
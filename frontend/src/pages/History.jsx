import React, { useState, useEffect } from 'react';
import { Clock, Download } from 'lucide-react';
import axios from 'axios';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/history/${id}`);
      setHistory(history.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/history/all`);
        setHistory([]);
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1><Clock size={28} /> Recommendation History</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={handleClearAll} disabled={history.length === 0}>
            Clear All
          </button>
          <button className="btn btn-primary">
            <Download size={20} />
            Export Data
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner"></div>
          </div>
        ) : history.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>You haven't run any analyses yet.</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Crop Match</th>
                <th>Confidence</th>
                <th>Season</th>
                <th>Location</th>
                <th>Date</th>
                <th>Temp</th>
                <th>Rainfall</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--primary-dark)', textTransform: 'capitalize' }}>
                      {item.crop_name}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.confidence > 80 ? 'badge-green' : 'badge-blue'}`}>
                      {item.confidence}%
                    </span>
                  </td>
                  <td>{item.season}</td>
                  <td>{item.location}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.temperature}°C</td>
                  <td>{item.rainfall}mm</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      style={{ background: 'none', border: 'none', color: '#F44336', cursor: 'pointer', padding: '5px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default History;

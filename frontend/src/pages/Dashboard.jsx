import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Plus, BarChart3, MapPin, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/history`);
        setHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Stats calculation
  const totalAnalyses = history.length;
  const uniqueCrops = new Set(history.map(item => item.crop_name)).size;
  const uniqueLocations = new Set(history.map(item => item.location)).size;
  const avgConfidence = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.confidence, 0) / history.length) 
    : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.full_name?.split(' ')[0] || 'Farmer'} 👋</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Here's what's happening on your farm today.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/recommendation')}>
          <Plus size={20} />
          New Recommendation
        </button>
      </div>

      <div className="hero-banner">
        <div className="hero-content">
          <h2>Smart Farming Starts Here</h2>
          <p>Leverage our advanced AI-powered models to get highly accurate crop recommendations tailored to your specific soil and climatic conditions.</p>
          <button className="hero-btn" onClick={() => navigate('/recommendation')}>
            Start Analysis
          </button>
        </div>
        <Leaf size={160} style={{ position: 'absolute', right: '-20px', bottom: '-20px', color: 'rgba(255,255,255,0.1)' }} />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><BarChart3 size={24} /></div>
          <div className="stat-info">
            <h4>Total Analyses</h4>
            <p>{totalAnalyses}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Leaf size={24} /></div>
          <div className="stat-info">
            <h4>Crops Suggested</h4>
            <p>{uniqueCrops}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><MapPin size={24} /></div>
          <div className="stat-info">
            <h4>Locations Analyzed</h4>
            <p>{uniqueLocations}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <h4>Avg. Confidence</h4>
            <p>{avgConfidence}%</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3 style={{ marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} color="var(--primary-color)" />
          Recent Recommendations
        </h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', color: 'var(--text-muted)' }}>
            <Leaf size={48} style={{ opacity: 0.2, marginBottom: '10px' }} />
            <p>No recommendations yet. Start your first analysis!</p>
          </div>
        ) : (
          <div className="crop-grid">
            {history.slice(0, 3).map((item) => (
              <div key={item.id} className="crop-card">
                <div className="crop-card-header">
                  <div style={{ background: 'white', padding: '10px', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
                    <Leaf color="var(--primary-color)" size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', textTransform: 'capitalize' }}>{item.crop_name}</h4>
                    <span className={`badge ${item.confidence > 80 ? 'badge-green' : 'badge-blue'}`}>
                      {item.confidence}% Match
                    </span>
                  </div>
                </div>
                <div className="crop-card-body">
                  <div className="crop-detail"><span><MapPin size={14}/> Location</span> <span>{item.location}</span></div>
                  <div className="crop-detail"><span><Clock size={14}/> Date</span> <span>{new Date(item.date).toLocaleDateString()}</span></div>
                  <div className="crop-detail"><span>Temp</span> <span>{item.temperature}°C</span></div>
                  <div className="crop-detail"><span>Rainfall</span> <span>{item.rainfall}mm</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

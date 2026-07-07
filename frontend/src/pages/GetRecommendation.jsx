import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, MapPin, Droplets, Thermometer, Wind, Check, Leaf, Bot } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GetRecommendation = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  
  const [formData, setFormData] = useState({
    farm_location: '',
    farm_size: '',
    growing_season: 'Kharif',
    water_availability: 'Adequate',
    soil_type: 'Loamy',
    ph: 6.5,
    n: 50,
    p: 50,
    k: 50,
    temperature: 25,
    humidity: 60,
    rainfall: 100
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['farm_size', 'ph', 'n', 'p', 'k', 'temperature', 'humidity', 'rainfall'].includes(name) 
        ? Number(value) : value
    }));
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError("Authentication required. Please log in.");
      return;
    }

    if (!formData.farm_location.trim() || !formData.farm_size) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await axios.post(`${API_URL}/api/predict`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const rawPredictions = response.data.predictions || [];
      const processedResults = rawPredictions
        .filter(p => p.confidence > 5)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);

      setResults(processedResults);
      localStorage.setItem('cropwise-last-prediction', JSON.stringify({
        crop: processedResults[0]?.crop || '',
        confidence: processedResults[0]?.confidence || 0,
        season: formData.growing_season,
        location: formData.farm_location,
        soilType: formData.soil_type,
        water: formData.water_availability,
        n: formData.n,
        p: formData.p,
        k: formData.k,
        temperature: formData.temperature,
        humidity: formData.humidity,
        rainfall: formData.rainfall,
        ph: formData.ph
      }));
      setToast('Analysis complete! Predictions saved to history.');
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      console.error("API Error:", err);
      if (!err.response) {
        setError("Server not reachable. Please check your connection.");
      } else if (err.response.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else {
        setError(err.response?.data?.detail || 'Failed to get recommendation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1><Sprout size={28} /> AI Crop Analysis</h1>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div className="form-card" style={{ flex: '1 1 600px' }}>
          <form onSubmit={handleSubmit}>
            
            {/* Section 1: Location & Season */}
            <div className="form-section">
              <h3><MapPin size={20} /> Location & Season</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Farm Location</label>
                  <input type="text" name="farm_location" className="form-control" placeholder="e.g. Punjab, India" value={formData.farm_location} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Farm Size (acres)</label>
                  <input type="number" name="farm_size" className="form-control" placeholder="0.0" step="0.1" value={formData.farm_size} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Growing Season</label>
                  <select name="growing_season" className="form-control" value={formData.growing_season} onChange={handleChange}>
                    <option value="Kharif">Kharif (Monsoon)</option>
                    <option value="Rabi">Rabi (Winter)</option>
                    <option value="Zaid">Zaid (Summer)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Water Availability</label>
                  <select name="water_availability" className="form-control" value={formData.water_availability} onChange={handleChange}>
                    <option value="Abundant">Abundant</option>
                    <option value="Adequate">Adequate</option>
                    <option value="Scarce">Scarce</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Soil Information */}
            <div className="form-section">
              <h3><Sprout size={20} /> Soil Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Soil Type</label>
                  <select name="soil_type" className="form-control" value={formData.soil_type} onChange={handleChange}>
                    <option value="Sandy">Sandy</option>
                    <option value="Clay">Clay</option>
                    <option value="Loamy">Loamy</option>
                    <option value="Black">Black</option>
                    <option value="Red">Red</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Soil pH ({formData.ph})</label>
                  <input type="range" name="ph" min="0" max="14" step="0.1" className="form-control" style={{padding: '0', height: '2px'}} value={formData.ph} onChange={handleChange} />
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px'}}>
                    <span>Acidic (0)</span><span>Neutral (7)</span><span>Alkaline (14)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Soil Nutrients */}
            <div className="form-section">
              <h3><Leaf size={20} /> Soil Nutrients (NPK)</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nitrogen (N)</label>
                  <input type="number" name="n" className="form-control" value={formData.n} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Phosphorus (P)</label>
                  <input type="number" name="p" className="form-control" value={formData.p} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Potassium (K)</label>
                  <input type="number" name="k" className="form-control" value={formData.k} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* Section 4: Climate Data */}
            <div className="form-section">
              <h3><Thermometer size={20} /> Climate Data</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Avg Temperature (°C)</label>
                  <input type="number" name="temperature" className="form-control" step="0.1" value={formData.temperature} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Avg Humidity (%)</label>
                  <input type="number" name="humidity" className="form-control" step="0.1" value={formData.humidity} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Rainfall (mm)</label>
                  <input type="number" name="rainfall" className="form-control" step="0.1" value={formData.rainfall} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
              {loading ? <div className="spinner" style={{width: '20px', height: '20px', borderLeftColor: 'white'}}></div> : 'Get AI Recommendations'}
            </button>
          </form>
        </div>

        {/* Results Pane */}
        {results && Array.isArray(results) && (
          <div style={{ flex: '1 1 350px', animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--primary-dark)' }}>Analysis Results</h2>
            {results.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {results.map((res, idx) => {
                  const getConfidenceColor = (conf) => {
                    if (conf > 80) return '#4CAF50';
                    if (conf >= 50) return '#FFC107';
                    return '#F44336';
                  };
                  const color = getConfidenceColor(res.confidence);
                  return (
                    <div key={idx} className={`result-card ${idx === 0 ? 'top-match' : ''}`} style={{ animation: `slideUp 0.4s ease-out ${idx * 0.15}s both` }}>
                      {idx === 0 && <div className="match-percentage" style={{ background: '#F57C00', display: 'flex', alignItems: 'center', gap: '5px' }}>🏆 Best Choice</div>}
                      <h3 style={{ marginTop: idx === 0 ? '10px' : '0' }}>{res.crop}</h3>
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                          <div style={{ flex: 1, background: '#E0E0E0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${res.confidence}%`, background: color, height: '100%', transition: 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s' }}></div>
                          </div>
                          <span style={{ fontWeight: 'bold', fontSize: '14px', color: color }}>{res.confidence}%</span>
                        </div>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.5', marginBottom: '20px' }}>{res.explanation}</p>
                      
                      <div className="result-features">
                        <div className="feature-item"><Check size={16} color="var(--primary-light)"/> {formData.growing_season}</div>
                        <div className="feature-item"><Droplets size={16} color="#1976D2"/> {formData.water_availability} Needs</div>
                      </div>
                      <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/ai-advisor')}>
                        <Bot size={16} /> Ask AI Advisor
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '20px', background: 'var(--surface, #f5f5f5)', borderRadius: '8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No recommendations found for the given inputs.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div className="toast-container">
          <div className="toast success">
            <Check size={20} color="#4CAF50" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
};

export default GetRecommendation;

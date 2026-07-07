import React, { useState } from 'react';
import { Sprout, RefreshCw, Send } from 'lucide-react';

const PredictionForm = ({ onPredict, isLoading }) => {
  const initialState = {
    soil_type: 'Loamy',
    n: '',
    p: '',
    k: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');

  const soilTypes = ['Sandy', 'Clay', 'Loamy', 'Black', 'Red'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    for (const key in formData) {
      if (formData[key] === '') return false;
    }
    // simple bounds checks
    if (formData.ph < 0 || formData.ph > 14) {
      setError('pH must be between 0 and 14');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      if (!error) setError('Please fill all fields with valid numbers.');
      return;
    }
    
    // Convert string inputs to floats
    const payload = {
      ...formData,
      n: parseFloat(formData.n),
      p: parseFloat(formData.p),
      k: parseFloat(formData.k),
      temperature: parseFloat(formData.temperature),
      humidity: parseFloat(formData.humidity),
      ph: parseFloat(formData.ph),
      rainfall: parseFloat(formData.rainfall)
    };
    
    onPredict(payload);
  };

  const handleReset = () => {
    setFormData(initialState);
    setError('');
  };

  return (
    <div className="card">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
        <Sprout className="text-primary" /> Enter Conditions
      </h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          
          <div className="form-group full-width">
            <label className="form-label">Soil Type</label>
            <select 
              name="soil_type" 
              value={formData.soil_type} 
              onChange={handleChange} 
              className="form-select"
            >
              {soilTypes.map(soil => (
                <option key={soil} value={soil}>{soil}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nitrogen (N)</label>
            <input type="number" step="0.01" name="n" value={formData.n} onChange={handleChange} className="form-input" placeholder="Ratio of Nitrogen" />
          </div>

          <div className="form-group">
            <label className="form-label">Phosphorus (P)</label>
            <input type="number" step="0.01" name="p" value={formData.p} onChange={handleChange} className="form-input" placeholder="Ratio of Phosphorus" />
          </div>

          <div className="form-group">
            <label className="form-label">Potassium (K)</label>
            <input type="number" step="0.01" name="k" value={formData.k} onChange={handleChange} className="form-input" placeholder="Ratio of Potassium" />
          </div>

          <div className="form-group">
            <label className="form-label">Temperature (°C)</label>
            <input type="number" step="0.01" name="temperature" value={formData.temperature} onChange={handleChange} className="form-input" placeholder="Temperature" />
          </div>

          <div className="form-group">
            <label className="form-label">Humidity (%)</label>
            <input type="number" step="0.01" name="humidity" value={formData.humidity} onChange={handleChange} className="form-input" placeholder="Relative Humidity" />
          </div>

          <div className="form-group">
            <label className="form-label">pH Value</label>
            <input type="number" step="0.01" name="ph" value={formData.ph} onChange={handleChange} className="form-input" placeholder="Soil pH (0-14)" />
          </div>

          <div className="form-group">
            <label className="form-label">Rainfall (mm)</label>
            <input type="number" step="0.01" name="rainfall" value={formData.rainfall} onChange={handleChange} className="form-input" placeholder="Rainfall per year" />
          </div>
        </div>

        <div className="action-buttons">
          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 1 }}>
            {isLoading ? <RefreshCw className="spinner" size={18} /> : <Send size={18} />}
            {isLoading ? 'Analyzing...' : 'Get Recommendation'}
          </button>
          <button type="button" onClick={handleReset} className="btn btn-outline" disabled={isLoading}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default PredictionForm;

import React, { useState } from 'react';
import { BookOpen, Search, MapPin, Droplets, Thermometer, Calendar } from 'lucide-react';

const cropsData = [
  { name: 'Rice', season: 'Kharif', soil: 'Clay / Loamy', temp: '20°C - 40°C', water: 'High (100-200cm)', growth: '120-150 days', ph: '6.0 - 7.0' },
  { name: 'Wheat', season: 'Rabi', soil: 'Loamy', temp: '15°C - 25°C', water: 'Moderate (50-100cm)', growth: '120-150 days', ph: '6.0 - 7.5' },
  { name: 'Maize', season: 'Kharif', soil: 'Well-drained Loamy', temp: '21°C - 27°C', water: 'Moderate (50-100cm)', growth: '90-120 days', ph: '5.8 - 7.0' },
  { name: 'Cotton', season: 'Kharif', soil: 'Black / Alluvial', temp: '21°C - 30°C', water: 'Moderate (50-100cm)', growth: '150-180 days', ph: '5.8 - 8.0' },
  { name: 'Sugarcane', season: 'Annual', soil: 'Deep Loamy', temp: '20°C - 35°C', water: 'High (150-250cm)', growth: '10-18 months', ph: '6.5 - 7.5' },
  { name: 'Soybean', season: 'Kharif', soil: 'Well-drained Loamy', temp: '20°C - 30°C', water: 'Moderate (40-60cm)', growth: '90-120 days', ph: '6.0 - 6.8' },
  { name: 'Potato', season: 'Rabi', soil: 'Sandy Loam', temp: '15°C - 20°C', water: 'Moderate (50-70cm)', growth: '90-120 days', ph: '5.0 - 6.5' },
  { name: 'Tomato', season: 'Zaid / Kharif', soil: 'Well-drained Loamy', temp: '21°C - 24°C', water: 'Moderate (40-60cm)', growth: '90-150 days', ph: '6.0 - 7.0' },
  { name: 'Groundnut', season: 'Kharif', soil: 'Sandy Loam', temp: '25°C - 30°C', water: 'Moderate (50-70cm)', growth: '100-140 days', ph: '6.0 - 6.5' },
  { name: 'Chickpea', season: 'Rabi', soil: 'Heavy Clay / Loamy', temp: '20°C - 25°C', water: 'Low (40-50cm)', growth: '90-120 days', ph: '6.0 - 9.0' },
  { name: 'Mustard', season: 'Rabi', soil: 'Light to Heavy Loam', temp: '15°C - 25°C', water: 'Low (35-45cm)', growth: '110-160 days', ph: '6.0 - 7.5' },
  { name: 'Millet', season: 'Kharif', soil: 'Sandy / Shallow', temp: '26°C - 29°C', water: 'Low (30-50cm)', growth: '65-90 days', ph: '5.5 - 6.5' },
  { name: 'Barley', season: 'Rabi', soil: 'Sandy / Loamy', temp: '12°C - 32°C', water: 'Low to Moderate', growth: '120-150 days', ph: '7.0 - 8.0' },
  { name: 'Lentil', season: 'Rabi', soil: 'Well-drained Loamy', temp: '18°C - 30°C', water: 'Low (30-40cm)', growth: '110-140 days', ph: '5.5 - 7.0' },
  { name: 'Onion', season: 'Rabi / Kharif', soil: 'Sandy Loam', temp: '15°C - 25°C', water: 'Moderate', growth: '100-150 days', ph: '5.8 - 6.5' },
  { name: 'Banana', season: 'Annual', soil: 'Rich Loamy', temp: '26°C - 30°C', water: 'High (150-250cm)', growth: '12-15 months', ph: '6.5 - 7.5' }
];

const CropGuide = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');
  const [soilFilter, setSoilFilter] = useState('');

  const filteredCrops = cropsData.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeason = seasonFilter ? crop.season.includes(seasonFilter) : true;
    const matchesSoil = soilFilter ? crop.soil.includes(soilFilter) : true;
    return matchesSearch && matchesSeason && matchesSoil;
  });

  return (
    <div>
      <div className="page-header">
        <h1><BookOpen size={28} /> Crop Knowledge Base</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Learn about optimal growing conditions for various crops.</p>
      </div>

      <div className="search-bar" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center' }}>
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search crops..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="form-control" 
          style={{ flex: '0 1 200px' }}
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
        >
          <option value="">All Seasons</option>
          <option value="Kharif">Kharif</option>
          <option value="Rabi">Rabi</option>
          <option value="Zaid">Zaid</option>
          <option value="Annual">Annual</option>
        </select>
        <select 
          className="form-control" 
          style={{ flex: '0 1 200px' }}
          value={soilFilter}
          onChange={(e) => setSoilFilter(e.target.value)}
        >
          <option value="">All Soils</option>
          <option value="Loam">Loamy</option>
          <option value="Clay">Clay</option>
          <option value="Sand">Sandy</option>
          <option value="Black">Black</option>
          <option value="Red">Red</option>
        </select>
      </div>

      <div className="crop-grid">
        {filteredCrops.map((crop, index) => (
          <div key={index} className="crop-card">
            <div className="crop-card-header">
              <div style={{ background: 'var(--primary-color)', color: 'white', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{crop.name[0]}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-main)' }}>{crop.name}</h3>
                <span className={`badge ${crop.season === 'Kharif' ? 'badge-green' : crop.season === 'Rabi' ? 'badge-blue' : 'badge-orange'}`} style={{ marginTop: '4px' }}>
                  {crop.season} Season
                </span>
              </div>
            </div>
            
            <div className="crop-card-body">
              <div className="crop-detail">
                <span><MapPin size={16} /> Soil</span>
                <span>{crop.soil}</span>
              </div>
              <div className="crop-detail">
                <span><Thermometer size={16} /> Temp</span>
                <span>{crop.temp}</span>
              </div>
              <div className="crop-detail">
                <span><Droplets size={16} /> Water</span>
                <span>{crop.water}</span>
              </div>
              <div className="crop-detail">
                <span><Calendar size={16} /> Period</span>
                <span>{crop.growth}</span>
              </div>
              <div className="crop-detail" style={{ marginBottom: 0 }}>
                <span><strong>pH</strong> Level</span>
                <span>{crop.ph}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredCrops.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No crops found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default CropGuide;

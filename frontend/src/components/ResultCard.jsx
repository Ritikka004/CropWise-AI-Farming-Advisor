import React from 'react';
import { Leaf, Award, Wheat } from 'lucide-react';

const ResultCard = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
        <div className="no-results">
          <Wheat size={64} style={{ color: 'var(--primary-light)', opacity: 0.5 }} />
          <h3>Waiting for Data</h3>
          <p>Fill out the form on the left and click "Get Recommendation" to see AI-powered crop suggestions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card results-container">
      <h2 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>
        Top Recommendations
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: 0 }}>
        Based on our Machine Learning analysis of your soil and environmental data.
      </p>

      {results.map((result, index) => (
        <div key={index} className="result-card" style={{ animationDelay: `${index * 0.15}s` }}>
          <div className="result-header">
            <h3 className="result-title">
              {index === 0 ? <Award className="text-primary" /> : <Leaf size={20} />}
              {result.crop}
            </h3>
            <span className="confidence-badge">
              {result.confidence}% Match
            </span>
          </div>
          <p className="result-explanation">
            {result.explanation}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ResultCard;

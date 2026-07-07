import React from 'react';
import { Sparkles, MessageSquareQuote } from 'lucide-react';

const ChatSidebar = ({ predictionSummary }) => {
  return (
    <div className="chat-sidebar-card">
      <div className="chat-sidebar-heading">
        <Sparkles size={18} />
        <span>Prediction Context</span>
      </div>
      {predictionSummary ? (
        <div className="chat-sidebar-content">
          <div className="chat-sidebar-item"><strong>Crop</strong><span>{predictionSummary.crop}</span></div>
          <div className="chat-sidebar-item"><strong>Confidence</strong><span>{predictionSummary.confidence}%</span></div>
          <div className="chat-sidebar-item"><strong>Season</strong><span>{predictionSummary.season}</span></div>
          <div className="chat-sidebar-item"><strong>Location</strong><span>{predictionSummary.location}</span></div>
          <div className="chat-sidebar-item"><strong>Soil</strong><span>{predictionSummary.soilType}</span></div>
          <div className="chat-sidebar-item"><strong>Water</strong><span>{predictionSummary.water}</span></div>
        </div>
      ) : (
        <div className="chat-sidebar-empty">
          <MessageSquareQuote size={32} />
          <p>Make a prediction first to activate the advisor.</p>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;

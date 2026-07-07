import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Sparkles, MessageCircleMore } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import ChatSidebar from '../components/ChatSidebar';

const AIFarmingAdvisor = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: 'Hello! I can explain the machine learning recommendation and help with fertilizer, irrigation, pests, and best practices.'
    }
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [predictionSummary, setPredictionSummary] = useState(null);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const saved = localStorage.getItem('cropwise-ai-advisor');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.messages || []);
        setPredictionSummary(parsed.predictionSummary || null);
      } catch (error) {
        console.error('Failed to restore advisor state', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cropwise-ai-advisor', JSON.stringify({ messages, predictionSummary }));
  }, [messages, predictionSummary]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const predictionContext = useMemo(() => {
    const savedPrediction = localStorage.getItem('cropwise-last-prediction');
    if (!savedPrediction) return null;
    try {
      return JSON.parse(savedPrediction);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (predictionContext) {
      setPredictionSummary({
        crop: predictionContext.crop || 'Pending',
        confidence: predictionContext.confidence || 0,
        season: predictionContext.season || 'Unknown',
        location: predictionContext.location || 'Unknown',
        soilType: predictionContext.soilType || 'Unknown',
        water: predictionContext.water || 'Unknown'
      });
    }
  }, [predictionContext]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || loading) return;

    const userMessage = { type: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft('');
    setLoading(true);

    try {
      if (!token) {
        throw new Error('Please sign in to use the advisor.');
      }

      const predictionPayload = {
        predicted_crop: predictionSummary?.crop || predictionContext?.crop || 'Unknown',
        confidence: predictionSummary?.confidence || predictionContext?.confidence || 0,
        season: predictionSummary?.season || predictionContext?.season || 'Unknown',
        farm_location: predictionSummary?.location || predictionContext?.location || 'Unknown',
        soil_type: predictionSummary?.soilType || predictionContext?.soilType || 'Unknown',
        n: predictionContext?.n || 0,
        p: predictionContext?.p || 0,
        k: predictionContext?.k || 0,
        temperature: predictionContext?.temperature || 0,
        humidity: predictionContext?.humidity || 0,
        rainfall: predictionContext?.rainfall || 0,
        water_availability: predictionSummary?.water || predictionContext?.water || 'Unknown',
        ph: predictionContext?.ph || 0,
        growing_season: predictionSummary?.season || predictionContext?.season || 'Unknown'
      };

      const response = await axios.post(
        `${API_URL}/api/ai/chat`,
        {
          message: trimmed,
          prediction: predictionPayload,
          history: nextMessages.map(({ type, content }) => ({ role: type, content }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [...prev, { type: 'assistant', content: response.data.response }]);
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'The advisor is temporarily unavailable.';
      setMessages((prev) => [...prev, { type: 'assistant', content: `Sorry, I could not answer right now. ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        type: 'assistant',
        content: 'Hello! I can explain the machine learning recommendation and help with fertilizer, irrigation, pests, and best practices.'
      }
    ]);
  };

  return (
    <div className="ai-advisor-page">
      <div className="page-header">
        <h1><Bot size={28} /> AI Farming Advisor</h1>
      </div>

      <div className="ai-advisor-layout">
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div>
              <h3><Sparkles size={18} /> CropWise AI Advisor</h3>
              <p>Smart guidance based on your latest prediction.</p>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <ChatMessage key={`${message.type}-${index}`} message={message} />
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div className="chat-avatar"><Bot size={18} /></div>
                <div className="chat-bubble typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            loading={loading}
            onClear={handleClear}
          />
        </div>

        <ChatSidebar predictionSummary={predictionSummary} />
      </div>
    </div>
  );
};

export default AIFarmingAdvisor;

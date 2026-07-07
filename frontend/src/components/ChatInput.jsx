import React from 'react';
import { SendHorizonal, Trash2 } from 'lucide-react';

const ChatInput = ({ value, onChange, onSend, onKeyDown, loading, onClear }) => {
  return (
    <div className="chat-input-area">
      <textarea
        className="chat-textarea"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Ask about soil, fertilizer, irrigation, or pests..."
        rows={1}
      />
      <div className="chat-actions">
        <button type="button" className="icon-button" onClick={onClear} title="Clear chat">
          <Trash2 size={18} />
        </button>
        <button type="button" className="icon-button primary" onClick={onSend} disabled={loading || !value.trim()}>
          <SendHorizonal size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;

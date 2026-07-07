import React from 'react';
import { Bot, UserCircle2 } from 'lucide-react';

const renderMarkdown = (text) => {
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let paragraphLines = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      const content = paragraphLines.join(' ');
      elements.push(<p key={elements.length}>{content}</p>);
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={elements.length}>
          {listItems.map((item, idx) => (
            <li key={`${item}-${idx}`}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (/^##\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      elements.push(<h4 key={elements.length}>{trimmed.replace(/^##\s+/, '')}</h4>);
      return;
    }

    if (/^-\s+/.test(trimmed)) {
      flushParagraph();
      listItems.push(trimmed.replace(/^-\s+/, ''));
      return;
    }

    flushList();
    paragraphLines.push(trimmed);
  });

  flushParagraph();
  flushList();

  return <div className="markdown-block">{elements}</div>;
};

const ChatMessage = ({ message }) => {
  const isUser = message.type === 'user';
  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="chat-avatar">
        {isUser ? <UserCircle2 size={18} /> : <Bot size={18} />}
      </div>
      <div className="chat-bubble">
        {renderMarkdown(message.content)}
      </div>
    </div>
  );
};

export default ChatMessage;

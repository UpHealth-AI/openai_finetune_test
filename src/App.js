import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        messages: updatedMessages,
        model: process.env.REACT_APP_MODEL,
      });

      const botReply = response.data.choices[0].message;
      setMessages([...updatedMessages, botReply]);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: '⚠️ Error getting response. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="header">
        <img src="/joy.png" alt="joy" className="joy-image" />
        <h1>Joy</h1>
      </div>
  
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <em>ChatGPT is typing...</em>
          </div>
        )}
      </div>
  
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default App;

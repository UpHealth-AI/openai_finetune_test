import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import joyLogo from './joy.png'; // Add your image to `src/` folder

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
        <img src={joyLogo} alt="Joy" className="logo" />
        <h1>Joy</h1>
      </div>

      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`bubble ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="bubble assistant">
            <em>Joy is thinking...</em>
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

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Login from './Login';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [user, setUser] = useState(null);
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const welcomeMessage = {
        role: 'assistant',
        content: `Hi ${user.displayName}, I’m Joy, your assistant trained in mental wellness. My goal is to be helpful and supportive. Ask me for activities to reduce stress or let’s talk about whatever’s on your mind. 😊`,
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);
  
  const sendMessage = async (manualInput = null) => {
    const messageToSend = manualInput || input;
    if (!messageToSend.trim()) return;

    const userMessage = { role: 'user', content: messageToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        messages: updatedMessages,
      });

      const botReply = response.data.choices[0].message;
      setMessages([...updatedMessages, botReply]);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: '⚠️ Error getting response. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  const handlePromptClick = (prompt) => {
    setShowOverlay(false);
    sendMessage(prompt);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!user) return <Login setUser={setUser} />;

  return (
    <div className="App">
      {showOverlay && (
        <div className="overlay">
          <div className="overlay-buttons">
            {[
              'I want to vent',
              'Make me smile',
              'Improve my mood',
              'Give me a task',
            ].map((text) => (
              <div
                key={text}
                className="prompt-box"
                onClick={() => handlePromptClick(text)}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="header">
        <img src="/joy.png" alt="joy" className="joy-image" />
        <h1>Joy</h1>
      </div>

      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, i) => {
          if (
            msg.role === 'user' &&
            msg.content.includes(
              'Please respond using emojis in your replies but only if appropriate and mix them in your responses instead of jsut adding it at the end all the time'
            )
          )
            return null;

          return (
            <div key={i} className={`bubble ${msg.role}`}>
              {msg.content}
            </div>
          );
        })}
        {loading && (
          <div className="bubble assistant typing-indicator">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button onClick={() => sendMessage()} disabled={loading}>
          {loading ? '⏳' : '⬆️'}
        </button>
      </div>
    </div>
  );
}

export default App;

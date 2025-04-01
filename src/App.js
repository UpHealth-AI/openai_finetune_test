// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Login from './Login';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { gapi } from 'gapi-script';
import { CLIENT_ID, API_KEY, SCOPES, DISCOVERY_DOC } from './calendarConfig';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
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
      const firstName = user.displayName?.split(' ')[0] || 'there';
      const welcomeMessage = {
        role: 'assistant',
        content: `Hi ${firstName}, I’m Joy. I’m here to help you make sense of what you’re feeling, reduce stress, and feel more in control of your day. We can reflect, talk things through, or just pause for a moment. What’s on your mind today?`,
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  const fetchCalendarEvents = () => {
    function initClient() {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: [DISCOVERY_DOC],
          scope: SCOPES,
        })
        .then(() => gapi.auth2.getAuthInstance().signIn())
        .then(() =>
          gapi.client.calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour before now
            timeMax: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour ahead
            showDeleted: false,
            singleEvents: true,
            maxResults: 5,
            orderBy: 'startTime',
          })
        )
        .then((response) => {
          setEvents(response.result.items || []);
        })
        .catch((err) => console.error('Error loading calendar', err));
    }

    gapi.load('client:auth2', initClient);
  };

  useEffect(() => {
    if (user) fetchCalendarEvents();
  }, [user]);

  const sendMessage = async (manualInput = null) => {
    setShowOverlay(false);

    const messageToSend = manualInput || input;
    if (!messageToSend.trim()) return;

    const userMessage = { role: 'user', content: messageToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Add calendar context message if any events found
    let contextualMessages = [...updatedMessages];
    if (events.length > 0) {
      const nearestEvent = events[0];
      const when = new Date(nearestEvent.start.dateTime || nearestEvent.start.date).toLocaleString();
      const contextMsg = {
        role: 'user',
        content: `FYI: I just had or will soon have a meeting titled "${nearestEvent.summary}" scheduled at ${when}.`,
      };
      contextualMessages = [contextMsg, ...contextualMessages];
    }

    try {
      const response = await axios.post('/api/chat', {
        messages: contextualMessages,
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
      setTimeout(() => inputRef.current?.focus(), 10);
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
      <div className="header">
        <img src="/joy.png" alt="joy" className="joy-image" />
        <h1>Joy</h1>
      </div>

      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`bubble ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="bubble assistant typing-indicator">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}
      </div>

      {showOverlay && (
        <div className="prompt-row">
          {[
            'I want to vent',
            'Make me smile',
            'Improve my mood',
            'Give me a task',
          ].map((text) => (
            <button
              key={text}
              className="prompt-pill"
              onClick={() => handlePromptClick(text)}
            >
              {text}
            </button>
          ))}
        </div>
      )}

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

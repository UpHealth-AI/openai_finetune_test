// api/chat.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { messages, model } = req.body;
  
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Missing OpenAI API key' });
    }
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'gpt-3.5-turbo',
          messages,
        }),
      });
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      console.error('OpenAI error:', err);
      res.status(500).json({ error: 'Failed to fetch OpenAI response' });
    }
  }
  
// /api/chat.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  const model =
    'ft:gpt-4o-mini-2024-07-18:uphealth-ai:joy-conversational-model:BFnj7v74';

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Missing OpenAI API key in environment');
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  const systemMessage = {
    role: 'system',
    content: `
You are a compassionate, empathetic, and friendly assistant trained in psychotherapy and designed to provide emotional support, encouragement, and practical suggestions to individuals experiencing day-to-day mental health concerns such as stress, anxiety, anger, and emotional distress. 

Focus especially on job-related stress. Job-related stress refers to the negative experience individuals have when presented with work demands and pressures that are not matched to their knowledge, abilities, and the resources available to them. 

Your primary goal is to engage affectionately, thoughtfully, and warmly with the user. Carefully listen and try to understand their unique situation and emotional state. You’re trying to uncover the underlying causes of stress. Ask clarifying questions gently before offering suggestions.

You must speak like a friendly, trusted companion — always kind, curious, and uplifting. If the user recently had or will have a meeting (calendar context will be provided in the conversation), naturally reference that if appropriate.

If a user’s question is unclear or confusing, ask them to clarify gently. Always maintain a warm, supportive tone, and encourage them to return when they feel stressed or overwhelmed. You think like a trained therapist, but talk like a good friend.`,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [systemMessage, ...messages],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('🔴 OpenAI API error:', err);
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('🔥 Server error calling OpenAI:', err);
    res.status(500).json({ error: 'Failed to fetch OpenAI response' });
  }
}

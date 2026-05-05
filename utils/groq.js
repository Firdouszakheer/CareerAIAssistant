const fetch = require('node-fetch');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.1-8b-instant';

/**
 * Call Groq API.
 * @param {Array}  messages   OpenAI-format message array
 * @param {number} maxTokens
 * @param {number} temperature
 * @returns {Promise<string>} assistant message content
 */
async function callGroq(messages, maxTokens = 2048, temperature = 0.7) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not set in environment variables.');

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Safely extract JSON from a string (handles markdown code fences).
 */
function extractJSON(raw) {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const cleaned = match ? match[1] : raw;
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No valid JSON found in AI response.');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { callGroq, extractJSON };

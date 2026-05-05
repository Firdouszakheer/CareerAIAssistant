const express = require('express');
const router = express.Router();
const { callGroq, extractJSON } = require('../utils/groq');

// ─── POST /api/career/advice ──────────────────────────────────────────────────
router.post('/advice', async (req, res) => {
  try {
    const { interest, academic, skills, goal } = req.body;

    if (!interest || !academic) {
      return res.status(400).json({ error: 'interest and academic are required.' });
    }

    const system = `You are Lumina, an expert AI career advisor. You give personalized, data-driven career guidance.
Respond ONLY with a valid JSON object in exactly this structure (no markdown, no extra text):
{
  "summary": "2-3 sentence personalized summary acknowledging their specific background",
  "recommendations": [
    {
      "title": "Career Title",
      "category": "Healthcare|Technology|Business|Finance|Design|Education|Science|Legal",
      "salary_range": "$XX,000 – $XX,000",
      "demand": "High Demand|Growing|Stable|Competitive",
      "match_score": 92,
      "description": "2-3 sentences explaining why this fits THIS person specifically",
      "roadmap": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
      "skills_needed": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"],
      "time_to_entry": "1-2 years",
      "why_good_fit": "One sentence about why their background suits this path"
    }
  ],
  "insight": "One unique data-backed observation about their career trajectory"
}
Provide exactly 3 recommendations. Be specific and reference their actual background.`;

    const user = `My profile:
- Interested in: ${interest}
- Academic background: ${academic}
- Current skills: ${skills || 'Not specified'}
- Career goal: ${goal || 'Not specified'}

Generate my personalized career blueprint.`;

    const raw = await callGroq(
      [{ role: 'system', content: system }, { role: 'user', content: user }],
      2048
    );

    const data = extractJSON(raw);
    res.json({ success: true, data });

  } catch (err) {
    console.error('[career/advice]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/career/chat ────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { message, history, profile, recommendations } = req.body;

    if (!message) return res.status(400).json({ error: 'message is required.' });

    const systemPrompt = `You are Lumina, a concise and friendly AI career advisor.
User profile — Interest: ${profile?.interest || 'not specified'}, Academic: ${profile?.academic || 'not specified'}, Skills: ${profile?.skills || 'not specified'}, Goal: ${profile?.goal || 'not specified'}.
Previously recommended careers: ${(recommendations || []).join(', ')}.
Answer follow-up questions helpfully and specifically. Keep responses under 150 words.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message },
    ];

    const reply = await callGroq(messages, 512, 0.75);
    res.json({ success: true, reply });

  } catch (err) {
    console.error('[career/chat]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

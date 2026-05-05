const express = require('express');
const router = express.Router();
const { callGroq, extractJSON } = require('../utils/groq');

/**
 * POST /api/search/missing-field
 *
 * When user hasn't filled a field (skills, academic, goal),
 * we ask Groq to infer/suggest values based on what they DID provide,
 * or search for contextual data about the interest field.
 */
router.post('/missing-field', async (req, res) => {
  try {
    const { missingField, knownData } = req.body;
    // missingField: 'skills' | 'academic' | 'goal'
    // knownData: { interest, academic, skills, goal }

    if (!missingField || !knownData?.interest) {
      return res.status(400).json({ error: 'missingField and knownData.interest are required.' });
    }

    const fieldDescriptions = {
      skills: 'common skills, tools, and technologies',
      academic: 'typical academic backgrounds, degrees, and GPA requirements',
      goal: 'common career goals and motivations',
    };

    const system = `You are a career data assistant. Respond ONLY with a valid JSON object — no markdown, no extra text.`;

    const user = `The user is interested in "${knownData.interest}" as a career field.
They have not provided their ${missingField}.

Search your knowledge about "${knownData.interest}" careers and provide helpful ${fieldDescriptions[missingField] || missingField}.

Respond with this JSON structure:
{
  "field": "${missingField}",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"],
  "context": "1-2 sentences of helpful context about ${missingField} for ${knownData.interest} careers",
  "recommended_default": "the single most common/recommended value for this field"
}`;

    const raw = await callGroq(
      [{ role: 'system', content: system }, { role: 'user', content: user }],
      600
    );

    const data = extractJSON(raw);
    res.json({ success: true, data });

  } catch (err) {
    console.error('[search/missing-field]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/search/career-info
 *
 * Search for rich info about a specific career title.
 */
router.post('/career-info', async (req, res) => {
  try {
    const { careerTitle } = req.body;
    if (!careerTitle) return res.status(400).json({ error: 'careerTitle is required.' });

    const system = `You are a career data expert. Respond ONLY with valid JSON — no markdown, no extra text.`;

    const user = `Provide detailed career information for: "${careerTitle}"

Respond with:
{
  "title": "${careerTitle}",
  "category": "field/industry",
  "salary_range": "$XX,000 – $XX,000",
  "demand": "High Demand|Growing|Stable|Competitive",
  "growth_rate": "XX%",
  "description": "2-3 sentence overview",
  "top_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "entry_paths": ["path1", "path2", "path3"],
  "top_companies": ["company1", "company2", "company3"],
  "work_environment": "Remote|Hybrid|On-site|Varies",
  "education_required": "degree/certification requirements"
}`;

    const raw = await callGroq(
      [{ role: 'system', content: system }, { role: 'user', content: user }],
      800
    );

    const data = extractJSON(raw);
    res.json({ success: true, data });

  } catch (err) {
    console.error('[search/career-info]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

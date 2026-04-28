/**
 * Manifesto Analyzer Route
 * Feature 1: AI Manifesto Analyzer
 * Uses Gemini 1.5 Flash with large context window
 */
const express = require('express');
const router = express.Router();
const { aiLimiter } = require('../middleware/rateLimit');

let model = null;
const getModel = () => {
  if (!model && process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  }
  return model;
};

const MANIFESTO_PROMPT = (text) => `
You are an expert Indian political analyst. Analyze this election manifesto/political document and provide a structured analysis in JSON format.

Document:
"""
${text}
"""

Return ONLY a valid JSON object with this exact structure:
{
  "partyOrTitle": "Detected party name or document title",
  "electionType": "Lok Sabha / State Assembly / Unknown",
  "keyPromises": ["promise 1", "promise 2", "promise 3", "promise 4", "promise 5"],
  "impactGroups": {
    "youth": "What this means for youth and students (2-3 sentences)",
    "farmers": "What this means for farmers and rural voters (2-3 sentences)",
    "women": "What this means for women (2-3 sentences)",
    "minorities": "What this means for minorities and marginalized groups (2-3 sentences)",
    "economy": "Economic implications and job creation (2-3 sentences)"
  },
  "feasibilityScore": 7,
  "feasibilityReason": "Brief reason for the feasibility score (1-2 sentences)",
  "redFlags": ["any concerning promises or vague claims"],
  "positiveHighlights": ["specific actionable and concrete promises"],
  "overallSentiment": "Positive / Negative / Mixed / Neutral",
  "readabilityLevel": "Simple / Moderate / Complex"
}
`;

// POST /api/manifesto/analyze
router.post('/analyze', aiLimiter, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Manifesto text is required' });
    if (text.length < 50) return res.status(400).json({ error: 'Text too short. Paste at least a paragraph from the manifesto.' });
    if (text.length > 50000) return res.status(400).json({ error: 'Text too long. Please paste a section (max 50,000 characters).' });

    const ai = getModel();
    if (!ai) {
      // Demo response when no API key
      return res.json({
        isDemo: true,
        partyOrTitle: 'Sample Party Manifesto',
        electionType: 'Lok Sabha',
        keyPromises: [
          'Create 2 crore jobs annually',
          'Double farmer income by 2026',
          'Free healthcare for all citizens',
          'Build 100 smart cities',
          'Provide free education up to Class 12',
        ],
        impactGroups: {
          youth: 'Significant focus on skill development and job creation for graduates entering the workforce.',
          farmers: 'Loan waiver and MSP guarantee are central promises for the agricultural sector.',
          women: 'Promises of 33% reservation and maternal support schemes.',
          minorities: 'Minority welfare schemes mentioned but without specific funding allocations.',
          economy: 'Infrastructure investment projected to boost GDP by 1-2% annually.',
        },
        feasibilityScore: 6,
        feasibilityReason: 'Several promises are ambitious but lack specific funding timelines.',
        redFlags: ['Vague employment targets without sector breakdown', 'No fiscal roadmap for free healthcare'],
        positiveHighlights: ['Specific MSP formula mentioned', 'Concrete timeline for infrastructure projects'],
        overallSentiment: 'Positive',
        readabilityLevel: 'Moderate',
      });
    }

    const result = await ai.generateContent(MANIFESTO_PROMPT(text));
    const responseText = result.response.text().trim();

    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI analysis. Please try again.' });
    }

    res.json(analysis);
  } catch (err) {
    console.error('[Manifesto]', err.message);
    res.status(500).json({ error: 'Analysis failed. Please try again.', details: err.message });
  }
});

module.exports = router;

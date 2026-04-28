/**
 * Fake News Detection Route
 * Google Service: Gemini API
 * Analyzes election-related news headlines for credibility
 */
const express = require('express');
const router = express.Router();
const { aiLimiter } = require('../middleware/rateLimit');

let GoogleGenerativeAI;
try { ({ GoogleGenerativeAI } = require('@google/generative-ai')); } catch { /* optional */ }

const FAKE_NEWS_PROMPT = `You are an expert fact-checker specializing in Indian election and political news.

Analyze the provided news headline or paragraph and return a JSON response with this EXACT structure:
{
  "verdict": "TRUE" | "MISLEADING" | "FAKE",
  "confidence": <number 0-100>,
  "biasScore": <number 0-10, where 0=neutral, 10=highly biased>,
  "emotionalLanguage": <number 0-10, where 0=calm, 10=highly emotional>,
  "emotionalWords": [<list of emotional/loaded words found>],
  "explanation": "<2-3 sentence explanation of your analysis>",
  "neutralRewrite": "<neutral, factual rewrite of the same information>",
  "redFlags": [<list of red flags or suspicious elements, or empty array>],
  "sources": ["<suggested authoritative sources to verify>"]
}

Guidelines:
- TRUE: Factually accurate based on known information
- MISLEADING: Contains some truth but is framed deceptively or lacks context
- FAKE: Demonstrably false, fabricated, or satire
- Be rigorous and cite your reasoning
- Flag emotional language that may manipulate readers
- Provide neutral rewrite that conveys facts without manipulation
- Always return valid JSON only, no other text`;

/**
 * POST /api/fakenews
 * @body {string} text - News headline or paragraph to analyze
 */
router.post('/', aiLimiter, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    if (text.trim().length < 10) {
      return res.status(400).json({ error: 'Text too short (min 10 characters)' });
    }
    if (text.length > 3000) {
      return res.status(400).json({ error: 'Text too long (max 3000 characters)' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !GoogleGenerativeAI) {
      // Demo response
      return res.json({
        verdict: 'MISLEADING',
        confidence: 72,
        biasScore: 6,
        emotionalLanguage: 7,
        emotionalWords: ['shocking', 'explosive', 'slams'],
        explanation: 'Demo mode: Add your Gemini API key to enable real AI analysis. This is a sample response showing the structure of the fake news detector output.',
        neutralRewrite: 'This is a demo neutral rewrite. Real analysis will rewrite your news in unbiased, factual language.',
        redFlags: ['Emotional headline language', 'No named sources cited', 'Missing context'],
        sources: ['eci.gov.in', 'pib.gov.in', 'thehindu.com', 'factchecker.in'],
        isDemo: true,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `${FAKE_NEWS_PROMPT}\n\nAnalyze this news:\n"${text}"`;
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    // Parse JSON from Gemini response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate required fields
    const required = ['verdict', 'confidence', 'biasScore', 'emotionalLanguage', 'explanation', 'neutralRewrite'];
    for (const field of required) {
      if (analysis[field] === undefined) throw new Error(`Missing field: ${field}`);
    }

    res.json({ ...analysis, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[FakeNews] Error:', err.message);
    res.status(500).json({
      error: 'Analysis failed',
      details: err.message,
    });
  }
});

module.exports = router;

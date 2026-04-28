/**
 * Constituency Researcher Route
 * Feature 2: Pincode → Constituency AI Researcher
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

const CONSTITUENCY_PROMPT = (pincode, state) => `
You are an expert on Indian electoral geography and politics. Research the constituency for this location.

Input: Pincode ${pincode}${state ? `, State: ${state}` : ''}

Return ONLY a valid JSON object with this exact structure. Use your best knowledge about Indian constituencies:
{
  "pincode": "${pincode}",
  "district": "District name",
  "state": "State name",
  "lokSabhaConstituency": "Lok Sabha constituency name",
  "vidhanSabhaConstituency": "Vidhan Sabha / State Assembly constituency name",
  "currentMP": {
    "name": "Current MP name (2024 onwards)",
    "party": "Party name",
    "since": "Year elected",
    "marginOfVictory": "Approx votes margin in last election"
  },
  "currentMLA": {
    "name": "Current MLA name if known",
    "party": "Party name",
    "since": "Year elected"
  },
  "historicalTrend": "Brief 2-3 sentence description of the constituency's political history and dominant parties",
  "voterProfile": "Brief description of the voter demographics — urban/rural, major communities, economic profile",
  "keyIssues": ["Top issue 1", "Top issue 2", "Top issue 3"],
  "isSwingSeat": true,
  "totalVoters": "Approximate registered voter count",
  "lastTurnout": "Voter turnout percentage in 2024 elections",
  "eci_url": "https://eci.gov.in",
  "confidence": "High / Medium / Low",
  "disclaimer": "Data is AI-generated and may not be 100% accurate. Verify at eci.gov.in"
}
`;

// POST /api/constituency/research
router.post('/research', aiLimiter, async (req, res) => {
  try {
    const { pincode, state } = req.body;
    if (!pincode) return res.status(400).json({ error: 'Pincode is required' });
    if (!/^\d{6}$/.test(pincode)) return res.status(400).json({ error: 'Please enter a valid 6-digit Indian pincode' });

    const ai = getModel();
    if (!ai) {
      return res.json({
        isDemo: true,
        pincode,
        district: 'Demo District',
        state: state || 'Maharashtra',
        lokSabhaConstituency: 'Mumbai North (Demo)',
        vidhanSabhaConstituency: 'Bandra (Demo)',
        currentMP: { name: 'Demo MP Name', party: 'Add Gemini API key', since: '2024', marginOfVictory: '~50,000 votes' },
        currentMLA: { name: 'Demo MLA Name', party: 'Add Gemini API key', since: '2024' },
        historicalTrend: 'Add your Gemini API key to get real constituency data for this pincode.',
        voterProfile: 'This is a demo response. Real data requires the Gemini API key.',
        keyIssues: ['Infrastructure', 'Employment', 'Healthcare'],
        isSwingSeat: false,
        totalVoters: '~12 Lakh',
        lastTurnout: '62%',
        eci_url: 'https://eci.gov.in',
        confidence: 'Low',
        disclaimer: 'This is demo data. Add your Gemini API key for real AI-powered research.',
      });
    }

    const result = await model.generateContent(CONSTITUENCY_PROMPT(pincode, state));
    const responseText = result.response.text().trim();

    let data;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return res.status(500).json({ error: 'Could not parse constituency data. Try again.' });
    }

    res.json(data);
  } catch (err) {
    console.error('[Constituency]', err.message);
    res.status(500).json({ error: 'Research failed. Please try again.', details: err.message });
  }
});

module.exports = router;

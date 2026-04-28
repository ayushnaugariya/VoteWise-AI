/**
 * Chat Route - Gemini AI Integration
 * Google Service: Gemini API (gemini-1.5-flash)
 * Handles Indian election Q&A with conversational context
 */
const express = require('express');
const router = express.Router();
const { aiLimiter } = require('../middleware/rateLimit');
const { optionalAuth } = require('../middleware/auth');

let GoogleGenerativeAI;
try { ({ GoogleGenerativeAI } = require('@google/generative-ai')); } catch { /* optional */ }

const ELECTION_SYSTEM_PROMPT = `You are VoteWise AI, an expert assistant on Indian elections and democracy.

Your expertise covers:
- Election Commission of India (ECI) processes and powers
- Lok Sabha (General Elections) and Rajya Sabha elections  
- State Legislative Assembly (Vidhan Sabha/Vidhan Parishad) elections
- Electronic Voting Machines (EVMs) and VVPAT paper trail
- Model Code of Conduct (MCC) during elections
- Voter registration via Form 6, NVSP portal, Voter Helpline 1950
- NOTA (None of the Above) - Article 49-O
- Candidate nomination, scrutiny, and withdrawal process
- Counting day procedures and result declaration
- Delimitation of constituencies and reserved seats
- Role of MPs, MLAs, President, Prime Minister, Governors
- Constitutional provisions (Articles 324-329, 80, 81, 170, 171)
- Difference between General Elections and By-elections
- Electoral bonds, campaign finance regulations
- Election disputes, Election Petitions in High Courts/Supreme Court
- Schedule Castes/Tribes reserved constituencies
- Overseas and NRI voting rights
- Voting age (18 years) and voter ID (EPIC card)

Guidelines:
1. Be accurate, factual, and politically neutral
2. Focus on Indian democratic processes and constitutional provisions
3. Encourage civic participation, especially among youth
4. If unsure, acknowledge it rather than guessing
5. Provide actionable steps where relevant (e.g., how to register)
6. Use simple language accessible to first-time voters
7. Mirror the language the user writes in (Hindi/English/etc.)`;

/**
 * POST /api/chat
 * @body {string} message - User's question
 * @body {Array} history - Previous conversation messages
 */
router.post('/', aiLimiter, optionalAuth, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !GoogleGenerativeAI) {
      return res.json({
        response: `🗳️ **VoteWise AI** is ready to help!\n\nYou asked: *"${message.substring(0, 80)}..."*\n\n**Setup Required**: Add your Gemini API key to \`.env\` file to activate AI responses.\n\nGet your free key at: https://aistudio.google.com/app/apikey`,
        source: 'demo',
        timestamp: new Date().toISOString(),
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    });

    const scrubbedHistory = [];
    let expectedRole = 'user';

    for (const msg of history.slice(-10)) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      if (role === expectedRole && msg.content) {
        scrubbedHistory.push({ role, parts: [{ text: msg.content }] });
        expectedRole = role === 'user' ? 'model' : 'user';
      }
    }

    const chatHistory = [
      { role: 'user', parts: [{ text: `SYSTEM INSTRUCTION: ${ELECTION_SYSTEM_PROMPT}\n\nUnderstood?` }] },
      { role: 'model', parts: [{ text: 'Yes, I understand and will strictly follow these instructions.' }] },
      ...scrubbedHistory
    ];

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const response = result.response.text();

    res.json({
      response,
      source: 'gemini-1.5-flash',
      timestamp: new Date().toISOString(),
      userId: req.user?.uid || null,
    });
  } catch (err) {
    console.error('[Chat] Gemini error:', err.message);
    res.status(500).json({
      error: 'Failed to get AI response',
      details: err.message,
    });
  }
});

/** GET /api/chat/suggestions - Suggested election prompts */
router.get('/suggestions', (req, res) => {
  res.json({
    suggestions: [
      'How do I register to vote in India?',
      'What is NOTA and how does it work?',
      'How are Lok Sabha elections conducted?',
      'What is the difference between MP and MLA?',
      'What is the Model Code of Conduct?',
      'How does EVM voting work?',
      'What documents do I need to vote?',
      'How to check my name on voter list?',
      'What is VVPAT?',
      'When is the next general election?',
    ],
  });
});

module.exports = router;

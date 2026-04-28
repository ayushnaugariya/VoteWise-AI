/**
 * Google Translate Route
 * Google Service: Cloud Translation API
 * Translates election content to Indian regional languages
 */
const express = require('express');
const router = express.Router();
const { aiLimiter } = require('../middleware/rateLimit');

let Translate;
try { ({ Translate } = require('@google-cloud/translate').v2); } catch { /* optional */ }

const SUPPORTED_LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  bn: 'Bengali',
  mr: 'Marathi',
  gu: 'Gujarati',
  kn: 'Kannada',
};

/**
 * POST /api/translate
 * @body {string} text - Text to translate
 * @body {string} target - Target language code (hi, ta, te, bn, etc.)
 * @body {string} [source] - Source language code (default: 'en')
 */
router.post('/', aiLimiter, async (req, res) => {
  try {
    const { text, target, source = 'en' } = req.body;

    if (!text || !target) {
      return res.status(400).json({ error: 'text and target language are required' });
    }
    if (!SUPPORTED_LANGUAGES[target]) {
      return res.status(400).json({
        error: `Unsupported language: ${target}`,
        supported: Object.keys(SUPPORTED_LANGUAGES),
      });
    }
    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text too long (max 5000 characters)' });
    }
    if (target === source) {
      return res.json({ translatedText: text, source, target });
    }

    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey || !Translate) {
      return res.json({
        translatedText: `[${SUPPORTED_LANGUAGES[target]} translation] ${text}`,
        source,
        target,
        isDemo: true,
        message: 'Add GOOGLE_TRANSLATE_API_KEY to .env for real translations',
      });
    }

    const translateClient = new Translate({ key: apiKey });
    const [translation] = await translateClient.translate(text, { from: source, to: target });

    res.json({
      translatedText: translation,
      source,
      target,
      targetLanguage: SUPPORTED_LANGUAGES[target],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Translate] Error:', err.message);
    res.status(500).json({
      error: 'Translation failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

/** GET /api/translate/languages - Supported languages list */
router.get('/languages', (req, res) => {
  res.json({ languages: SUPPORTED_LANGUAGES });
});

module.exports = router;

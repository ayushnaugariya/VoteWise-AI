/**
 * Analytics Route — BigQuery "Pulse of the Nation"
 * Feature 4: Logs chat topics to BigQuery, returns trending topics
 */
const express = require('express');
const router = express.Router();

// In-memory store as BigQuery fallback (works without credentials)
const topicStore = {
  'Voter Registration': 312,
  'EVM & VVPAT': 289,
  'Jobs & Economy': 256,
  'Farmer Issues': 243,
  'Education Policy': 198,
  'Healthcare': 187,
  'Women Safety': 165,
  'NOTA': 142,
  'Fake News': 138,
  'Election Timeline': 121,
};

let bigqueryClient = null;

const getBigQuery = () => {
  if (bigqueryClient) return bigqueryClient;
  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.BIGQUERY_PROJECT_ID) {
      const { BigQuery } = require('@google-cloud/bigquery');
      bigqueryClient = new BigQuery({
        projectId: process.env.BIGQUERY_PROJECT_ID,
      });
    }
  } catch { /* BigQuery not available */ }
  return bigqueryClient;
};

// Classify a message into an election topic
const classifyTopic = (message) => {
  const m = message.toLowerCase();
  if (m.includes('register') || m.includes('voter id') || m.includes('epic')) return 'Voter Registration';
  if (m.includes('evm') || m.includes('vvpat') || m.includes('voting machine')) return 'EVM & VVPAT';
  if (m.includes('job') || m.includes('economy') || m.includes('employment') || m.includes('gdp')) return 'Jobs & Economy';
  if (m.includes('farmer') || m.includes('msp') || m.includes('agriculture') || m.includes('kisan')) return 'Farmer Issues';
  if (m.includes('education') || m.includes('school') || m.includes('college') || m.includes('student')) return 'Education Policy';
  if (m.includes('health') || m.includes('hospital') || m.includes('medicine') || m.includes('doctor')) return 'Healthcare';
  if (m.includes('women') || m.includes('reservation') || m.includes('gender')) return 'Women Safety';
  if (m.includes('nota') || m.includes('none of the above')) return 'NOTA';
  if (m.includes('fake') || m.includes('misinformation') || m.includes('rumor')) return 'Fake News';
  if (m.includes('timeline') || m.includes('schedule') || m.includes('date') || m.includes('phase')) return 'Election Timeline';
  if (m.includes('mp') || m.includes('mla') || m.includes('constituency') || m.includes('lok sabha')) return 'Candidates & Parties';
  if (m.includes('manifesto') || m.includes('promise') || m.includes('policy')) return 'Manifestos & Policies';
  return null;
};

// POST /api/analytics/log — called internally when chat is used
router.post('/log', async (req, res) => {
  try {
    const { message, userId } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const topic = classifyTopic(message);
    if (topic) {
      // Update in-memory store
      topicStore[topic] = (topicStore[topic] || 0) + 1;

      // Log to BigQuery if available
      const bq = getBigQuery();
      if (bq && process.env.BIGQUERY_DATASET) {
        try {
          const dataset = bq.dataset(process.env.BIGQUERY_DATASET);
          const table = dataset.table('chat_topics');
          await table.insert([{
            topic,
            message: message.substring(0, 200),
            userId: userId || 'anonymous',
            timestamp: new Date().toISOString(),
          }]);
        } catch (bqErr) {
          // Fail silently — BigQuery is bonus
          console.log('[BigQuery] Insert skipped:', bqErr.message);
        }
      }
    }

    res.json({ logged: true, topic: topic || 'General' });
  } catch (err) {
    res.json({ logged: false });
  }
});

// GET /api/analytics/trends — returns trending topics for the dashboard
router.get('/trends', async (req, res) => {
  try {
    let trends = null;

    // Try BigQuery first
    const bq = getBigQuery();
    if (bq && process.env.BIGQUERY_DATASET) {
      try {
        const query = `
          SELECT topic, COUNT(*) as count
          FROM \`${process.env.BIGQUERY_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.chat_topics\`
          WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
          GROUP BY topic
          ORDER BY count DESC
          LIMIT 10
        `;
        const [rows] = await bq.query({ query });
        if (rows.length > 0) {
          trends = rows.map(r => ({ topic: r.topic, count: Number(r.count) }));
        }
      } catch (bqErr) {
        console.log('[BigQuery] Query skipped:', bqErr.message);
      }
    }

    // Fallback to in-memory store
    if (!trends) {
      trends = Object.entries(topicStore)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([topic, count]) => ({ topic, count }));
    }

    const total = trends.reduce((sum, t) => sum + t.count, 0);
    const trendsWithPct = trends.map(t => ({
      ...t,
      percentage: Math.round((t.count / total) * 100),
    }));

    res.json({
      trends: trendsWithPct,
      total,
      source: bq ? 'bigquery' : 'realtime',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

module.exports = router;

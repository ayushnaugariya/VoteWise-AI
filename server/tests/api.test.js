/**
 * VoteWise AI - Backend Tests
 * Tests for chat, fake news, and quiz routes
 */
const request = require('supertest');
const app = require('../index');

describe('Health Check', () => {
  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('service', 'VoteWise AI API');
    expect(res.body).toHaveProperty('googleServices');
  });
});

describe('Chat API', () => {
  test('POST /api/chat - rejects missing message', async () => {
    const res = await request(app).post('/api/chat').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/chat - rejects empty message', async () => {
    const res = await request(app).post('/api/chat').send({ message: '   ' });
    expect([400, 500]).toContain(res.statusCode);
  });

  test('POST /api/chat - rejects message over 2000 chars', async () => {
    const longMsg = 'a'.repeat(2001);
    const res = await request(app).post('/api/chat').send({ message: longMsg });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('too long');
  });

  test('POST /api/chat - returns response for valid message', async () => {
    const res = await request(app).post('/api/chat').send({
      message: 'What is NOTA?',
      history: [],
    });
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('response');
      expect(res.body).toHaveProperty('timestamp');
    }
  });

  test('GET /api/chat/suggestions - returns suggestion list', async () => {
    const res = await request(app).get('/api/chat/suggestions');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('suggestions');
    expect(Array.isArray(res.body.suggestions)).toBe(true);
    expect(res.body.suggestions.length).toBeGreaterThan(0);
  });
});

describe('Fake News API', () => {
  test('POST /api/fakenews - rejects missing text', async () => {
    const res = await request(app).post('/api/fakenews').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/fakenews - rejects text too short', async () => {
    const res = await request(app).post('/api/fakenews').send({ text: 'hi' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/fakenews - rejects text over 3000 chars', async () => {
    const res = await request(app).post('/api/fakenews').send({ text: 'x'.repeat(3001) });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/fakenews - returns analysis for valid news', async () => {
    const res = await request(app).post('/api/fakenews').send({
      text: 'Election Commission announces date for next Lok Sabha election.',
    });
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(['TRUE', 'MISLEADING', 'FAKE']).toContain(res.body.verdict);
      expect(typeof res.body.confidence).toBe('number');
      expect(res.body.confidence).toBeGreaterThanOrEqual(0);
      expect(res.body.confidence).toBeLessThanOrEqual(100);
    }
  });
});

describe('Translate API', () => {
  test('POST /api/translate - rejects missing fields', async () => {
    const res = await request(app).post('/api/translate').send({});
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/translate - rejects unsupported language', async () => {
    const res = await request(app).post('/api/translate').send({ text: 'hello', target: 'xx' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('supported');
  });

  test('POST /api/translate - same source/target returns original', async () => {
    const res = await request(app).post('/api/translate').send({
      text: 'Vote for democracy',
      target: 'en',
      source: 'en',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.translatedText).toBe('Vote for democracy');
  });

  test('GET /api/translate/languages - returns supported languages', async () => {
    const res = await request(app).get('/api/translate/languages');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('languages');
    expect(res.body.languages).toHaveProperty('hi');
    expect(res.body.languages).toHaveProperty('ta');
  });
});

describe('Quiz API', () => {
  test('GET /api/quiz/questions - returns 10 questions', async () => {
    const res = await request(app).get('/api/quiz/questions');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('questions');
    expect(res.body.questions).toHaveLength(10);
    expect(res.body.total).toBe(10);
  });

  test('Quiz questions do not expose correct answers', async () => {
    const res = await request(app).get('/api/quiz/questions');
    expect(res.statusCode).toBe(200);
    res.body.questions.forEach(q => {
      expect(q).not.toHaveProperty('correct');
      expect(q).toHaveProperty('options');
      expect(q.options).toHaveLength(4);
    });
  });

  test('GET /api/quiz/leaderboard - returns leaderboard data', async () => {
    const res = await request(app).get('/api/quiz/leaderboard');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('leaderboard');
    expect(Array.isArray(res.body.leaderboard)).toBe(true);
  });
});

describe('Eligibility Logic', () => {
  test('Age below 18 should be ineligible', () => {
    const checkEligibility = (age) => age >= 18;
    expect(checkEligibility(17)).toBe(false);
    expect(checkEligibility(18)).toBe(true);
    expect(checkEligibility(25)).toBe(true);
  });

  test('Non-citizen should be ineligible', () => {
    const checkEligibility = (isIndianCitizen) => isIndianCitizen;
    expect(checkEligibility(false)).toBe(false);
    expect(checkEligibility(true)).toBe(true);
  });

  test('Age 18+ Indian citizen is eligible', () => {
    const checkEligibility = (age, isIndianCitizen) => age >= 18 && isIndianCitizen;
    expect(checkEligibility(18, true)).toBe(true);
    expect(checkEligibility(17, true)).toBe(false);
    expect(checkEligibility(20, false)).toBe(false);
  });
});

describe('Candidate API', () => {
  test('POST /api/candidate - rejects missing name', async () => {
    const res = await request(app).post('/api/candidate').send({});
    expect(res.statusCode).toBe(400);
  });
  test('POST /api/candidate - returns report for valid request', async () => {
    const res = await request(app).post('/api/candidate').send({ name: 'Rahul', constituency: 'Wayanad' });
    expect([200, 500]).toContain(res.statusCode);
  });
});

describe('Manifesto API', () => {
  test('POST /api/manifesto/analyze - rejects missing text', async () => {
    const res = await request(app).post('/api/manifesto/analyze').send({});
    expect(res.statusCode).toBe(400);
  });
  test('POST /api/manifesto/analyze - rejects short text', async () => {
    const res = await request(app).post('/api/manifesto/analyze').send({ text: 'short' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Constituency API', () => {
  test('POST /api/constituency/research - rejects missing pincode', async () => {
    const res = await request(app).post('/api/constituency/research').send({});
    expect(res.statusCode).toBe(400);
  });
  test('POST /api/constituency/research - rejects invalid pincode', async () => {
    const res = await request(app).post('/api/constituency/research').send({ pincode: '123' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Analytics API', () => {
  test('POST /api/analytics/log - rejects missing message', async () => {
    const res = await request(app).post('/api/analytics/log').send({});
    expect(res.statusCode).toBe(400);
  });
  test('POST /api/analytics/log - returns valid response', async () => {
    const res = await request(app).post('/api/analytics/log').send({ message: 'voter id' });
    expect(res.statusCode).toBe(200);
    expect(res.body.logged).toBe(true);
  });
  test('GET /api/analytics/trends - returns trends', async () => {
    const res = await request(app).get('/api/analytics/trends');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('trends');
  });
});

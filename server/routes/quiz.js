/**
 * Quiz Route
 * Provides democracy quiz questions and saves scores to Firestore
 * Google Service: Firebase Admin (Firestore)
 */
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

let adminDb = null;
try {
  const admin = require('firebase-admin');
  if (admin.apps.length) adminDb = admin.firestore();
} catch { /* optional */ }

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'What is the minimum age to vote in Indian general elections?',
    options: ['16 years', '18 years', '21 years', '25 years'],
    correct: 1,
    explanation: 'The 61st Constitutional Amendment (1988) lowered the voting age from 21 to 18 years.',
  },
  {
    id: 2,
    question: 'What does NOTA stand for?',
    options: ['None of the Alternatives', 'None of the Above', 'No Other Than Available', 'Not on the Agenda'],
    correct: 1,
    explanation: 'NOTA (None of the Above) allows voters to reject all candidates. It was introduced in 2013 per Supreme Court order.',
  },
  {
    id: 3,
    question: 'Which body conducts elections in India?',
    options: ['Supreme Court', 'Parliament', 'Election Commission of India', 'UPSC'],
    correct: 2,
    explanation: 'The Election Commission of India (ECI), established under Article 324, is an autonomous constitutional authority.',
  },
  {
    id: 4,
    question: 'How many Lok Sabha constituencies are there in India?',
    options: ['442', '543', '550', '552'],
    correct: 1,
    explanation: 'There are 543 elected members in the Lok Sabha from 543 constituencies across India.',
  },
  {
    id: 5,
    question: 'What is EVM?',
    options: ['Electronic Voter Management', 'Electronic Voting Machine', 'Electoral Vote Monitor', 'Election Verification Method'],
    correct: 1,
    explanation: 'EVM (Electronic Voting Machine) replaced paper ballots in Indian elections for reliability and accuracy.',
  },
  {
    id: 6,
    question: 'What is the term of a Lok Sabha member?',
    options: ['3 years', '4 years', '5 years', '6 years'],
    correct: 2,
    explanation: 'Lok Sabha has a term of 5 years unless dissolved earlier by the President on advice of the Cabinet.',
  },
  {
    id: 7,
    question: 'Which document is used as Voter ID in India?',
    options: ['Aadhaar Card', 'EPIC Card', 'PAN Card', 'Passport'],
    correct: 1,
    explanation: 'EPIC (Electors Photo Identity Card) is the official voter ID card issued by the Election Commission.',
  },
  {
    id: 8,
    question: 'What is the Model Code of Conduct (MCC)?',
    options: [
      'A law passed by Parliament',
      'A set of guidelines for political parties during elections',
      'Supreme Court judgment',
      'Constitution amendment',
    ],
    correct: 1,
    explanation: 'MCC is a set of guidelines issued by the ECI to regulate conduct of political parties and candidates during elections.',
  },
  {
    id: 9,
    question: 'What is VVPAT?',
    options: [
      'Voter Verified Paper Audit Trail',
      'Vote Validation Protocol and Technology',
      'Verified Voter Polling and Tallying',
      'Voter Verification and Processing Terminal',
    ],
    correct: 0,
    explanation: 'VVPAT gives voters a paper receipt to verify their vote was recorded correctly, providing a paper audit trail.',
  },
  {
    id: 10,
    question: 'Article 324 of the Indian Constitution deals with?',
    options: ['Right to Education', 'Superintendence of Elections', 'Emergency Powers', 'Freedom of Press'],
    correct: 1,
    explanation: 'Article 324 vests the superintendence, direction and control of elections in the Election Commission of India.',
  },
];

/** GET /api/quiz/questions - Get all quiz questions */
router.get('/questions', (req, res) => {
  // Don't send correct answers to client
  const questions = QUIZ_QUESTIONS.map(({ correct, explanation, ...q }) => q);
  res.json({ questions, total: questions.length });
});

/**
 * POST /api/quiz/submit
 * @body {Array} answers - Array of {questionId, selectedOption}
 */
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers must be an array' });
    }

    let score = 0;
    const results = answers.map(({ questionId, selectedOption }) => {
      const question = QUIZ_QUESTIONS.find(q => q.id === questionId);
      if (!question) return null;
      const isCorrect = selectedOption === question.correct;
      if (isCorrect) score++;
      return {
        questionId,
        selectedOption,
        isCorrect,
        correctOption: question.correct,
        explanation: question.explanation,
        question: question.question,
      };
    }).filter(Boolean);

    const percentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);

    // Determine badge earned
    let badge = null;
    if (percentage >= 90) badge = 'democracy_hero';
    else if (percentage >= 70) badge = 'election_expert';
    else if (percentage >= 40) badge = 'first_time_voter';

    const quizResult = {
      userId: req.user?.uid,
      score,
      total: QUIZ_QUESTIONS.length,
      percentage,
      badge,
      completedAt: new Date().toISOString(),
    };

    // Save to Firestore if available (Google Service: Firestore)
    if (adminDb && req.user?.uid) {
      try {
        await adminDb.collection('quiz_scores').add(quizResult);
        await adminDb.collection('users').doc(req.user.uid).set(
          { lastQuizScore: percentage, badge, lastActive: new Date().toISOString() },
          { merge: true }
        );
      } catch (dbErr) {
        console.warn('[Quiz] Firestore save failed:', dbErr.message);
      }
    }

    res.json({ ...quizResult, results });
  } catch (err) {
    console.error('[Quiz] Submit error:', err.message);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

/** GET /api/quiz/leaderboard - Top 10 scores */
router.get('/leaderboard', async (req, res) => {
  try {
    if (!adminDb) {
      return res.json({
        leaderboard: [
          { displayName: 'Priya S.', score: 10, percentage: 100, badge: 'democracy_hero' },
          { displayName: 'Rahul K.', score: 9, percentage: 90, badge: 'democracy_hero' },
          { displayName: 'Ananya M.', score: 8, percentage: 80, badge: 'election_expert' },
        ],
        isDemo: true,
      });
    }

    const snapshot = await adminDb.collection('quiz_scores')
      .orderBy('score', 'desc')
      .limit(10)
      .get();

    const leaderboard = snapshot.docs.map(doc => {
      const data = doc.data();
      return { displayName: data.displayName || 'Anonymous', score: data.score, percentage: data.percentage, badge: data.badge };
    });

    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;

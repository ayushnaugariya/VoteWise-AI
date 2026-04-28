import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiClock, FiAward, FiArrowRight, FiRotateCcw } from 'react-icons/fi';
import { MdOutlineQuiz, MdEmojiEvents } from 'react-icons/md';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BADGES = {
  democracy_hero: { label: 'Democracy Hero 🏆', desc: '90%+ score — you truly know Indian democracy!', color: 'from-yellow-400 to-amber-500' },
  election_expert: { label: 'Election Expert 🎓', desc: '70%+ score — excellent knowledge!', color: 'from-blue-500 to-blue-600' },
  first_time_voter: { label: 'First Time Voter 🗳️', desc: 'Great start! Keep learning!', color: 'from-green-500 to-emerald-600' },
};

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [phase, setPhase] = useState('intro'); // intro | quiz | result
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [leaderboard, setLeaderboard] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    api.get('/quiz/questions').then(({ data }) => setQuestions(data.questions)).catch(() => {});
    api.get('/quiz/leaderboard').then(({ data }) => setLeaderboard(data.leaderboard || [])).catch(() => {});
  }, []);

  // Timer per question
  useEffect(() => {
    if (phase !== 'quiz' || selected !== null) return;
    if (timer === 0) { handleNext(true); return; }
    const t = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, phase, selected]);

  const startQuiz = () => {
    setPhase('quiz');
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setTimer(30);
    setResult(null);
  };

  const handleSelect = (optionIndex) => {
    if (selected !== null) return;
    setSelected(optionIndex);
  };

  const handleNext = (timedOut = false) => {
    const answer = { questionId: questions[current]?.id, selectedOption: timedOut ? -1 : selected };
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (current + 1 >= questions.length) {
      submitQuiz(newAnswers);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setTimer(30);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setLoading(true);
    try {
      const { data } = await api.post('/quiz/submit', { answers: finalAnswers });
      setResult(data);
      setPhase('result');
    } catch (err) {
      toast.error('Could not save score. Check your connection.');
      // Remove flawed local fallback to ensure accurate scoring
      setPhase('intro');
    } finally {
      setLoading(false);
    }
  };

  const q = questions[current];

  return (
    <div className="max-w-2xl mx-auto px-6 py-12" role="main">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-white text-3xl mx-auto mb-4" aria-hidden="true">
          <MdOutlineQuiz />
        </div>
        <h1 className="page-header mb-3">Democracy <span className="gradient-text">Quiz</span></h1>
        <p className="text-gray-500 dark:text-gray-400">Test your knowledge of Indian elections and democracy. 10 questions, 30 seconds each.</p>
      </div>

      {/* ── Intro ──── */}
      {phase === 'intro' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card p-8 mb-6 text-center">
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[['10', 'Questions'], ['30s', 'Per Question'], ['3', 'Badges to Earn']].map(([val, label]) => (
                <div key={label} className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
                  <div className="text-3xl font-extrabold gradient-text">{val}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {Object.entries(BADGES).map(([key, { label, color }]) => (
                <span key={key} className={`px-4 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${color}`}>{label}</span>
              ))}
            </div>
            <button onClick={startQuiz} disabled={questions.length === 0} className="btn-primary px-10 py-4 text-base">
              {questions.length === 0 ? 'Loading...' : 'Start Quiz'} <FiArrowRight aria-hidden="true" />
            </button>
          </div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MdEmojiEvents className="text-yellow-500" aria-hidden="true" /> Leaderboard
              </h2>
              <ol aria-label="Quiz leaderboard">
                {leaderboard.map(({ displayName, percentage, badge }, i) => (
                  <li key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-600' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>
                        {i + 1}
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{percentage}%</span>
                      {badge && <span className="badge-blue text-xs">{badge.replace(/_/g, ' ')}</span>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Quiz ──── */}
      {phase === 'quiz' && q && (
        <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Question {current + 1} of {questions.length}</span>
              <span className={`flex items-center gap-1 font-semibold ${timer <= 10 ? 'text-red-500' : 'text-gray-500'}`}>
                <FiClock aria-hidden="true" /> {timer}s
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2" role="progressbar" aria-valuenow={current + 1} aria-valuemax={questions.length} aria-label={`Question ${current + 1} of ${questions.length}`}>
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                style={{ width: `${((current + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="card p-8 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{q.question}</h2>
            <fieldset>
              <legend className="sr-only">Select your answer</legend>
              <div className="space-y-3">
                {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={selected !== null}
                    aria-pressed={selected === idx}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                      selected === null
                        ? 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300'
                        : selected === idx
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-100 dark:border-gray-800 text-gray-400 opacity-60'
                    }`}
                  >
                    <span className="font-bold mr-3 text-gray-400">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          {selected !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <button onClick={() => handleNext()} disabled={loading} className="btn-primary w-full justify-center">
                {current + 1 >= questions.length ? (loading ? 'Submitting...' : 'Submit Quiz') : 'Next Question'}
                <FiArrowRight aria-hidden="true" />
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ── Result ──── */}
      {phase === 'result' && result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="card p-8 text-center mb-6">
            <div className="text-7xl font-extrabold gradient-text mb-2">{result.percentage}%</div>
            <p className="text-gray-500 mb-4">You scored {result.score} out of {result.total}</p>
            {result.badge && BADGES[result.badge] && (
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold bg-gradient-to-r ${BADGES[result.badge].color} mb-2`}>
                <FiAward aria-hidden="true" />
                {BADGES[result.badge].label}
              </div>
            )}
            {result.badge && BADGES[result.badge] && (
              <p className="text-sm text-gray-500 mt-2">{BADGES[result.badge].desc}</p>
            )}
            <button onClick={startQuiz} className="btn-secondary mt-6 mx-auto">
              <FiRotateCcw aria-hidden="true" /> Try Again
            </button>
          </div>

          {/* Answer review */}
          {result.results?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Answer Review</h2>
              <ol className="space-y-3">
                {result.results.map((r, i) => (
                  <li key={i} className={`p-4 rounded-xl border ${r.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{r.question}</p>
                    <div className="flex items-center gap-2 text-sm">
                      {r.isCorrect
                        ? <FiCheckCircle className="text-green-500" aria-hidden="true" />
                        : <FiXCircle className="text-red-500" aria-hidden="true" />
                      }
                      <span className={r.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {r.isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    {!r.isCorrect && <p className="text-xs text-gray-500 mt-1">💡 {r.explanation}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

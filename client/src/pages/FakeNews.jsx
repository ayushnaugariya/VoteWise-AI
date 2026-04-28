import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertTriangle, FiCheckCircle, FiXCircle, FiSearch,
  FiInfo, FiZap, FiRefreshCw
} from 'react-icons/fi';
import { MdOutlineFactCheck } from 'react-icons/md';
import api from '../utils/api';
import toast from 'react-hot-toast';

const VERDICT_CONFIG = {
  TRUE: { label: 'Likely True', icon: <FiCheckCircle />, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' },
  MISLEADING: { label: 'Misleading', icon: <FiAlertTriangle />, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800' },
  FAKE: { label: 'Likely Fake', icon: <FiXCircle />, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' },
};

const SAMPLE_HEADLINES = [
  'ECI has cancelled all upcoming elections due to technical issues with EVMs',
  'Voter turnout in 2024 Lok Sabha elections was the highest ever recorded',
  'Government has passed a law to lower voting age to 16 years',
];

function ScoreMeter({ label, value, max = 10, color = 'blue' }) {
  const pct = ((value / max) * 100).toFixed(0);
  const colorMap = { blue: 'bg-blue-500', red: 'bg-red-500', yellow: 'bg-yellow-500', green: 'bg-green-500' };
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-300 font-medium">{label}</span>
        <span className="font-bold text-gray-900 dark:text-white">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={`${label}: ${value} out of ${max}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`${colorMap[color]} h-2.5 rounded-full`}
        />
      </div>
    </div>
  );
}

function ConfidenceRing({ value }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (value / 100) * circumference;
  const color = value >= 70 ? '#22c55e' : value >= 40 ? '#eab308' : '#ef4444';
  return (
    <div className="flex flex-col items-center" aria-label={`Confidence: ${value}%`}>
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <motion.circle
          cx="48" cy="48" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - strokeDash }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ marginTop: '-72px' }}>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}%</span>
        <span className="text-xs text-gray-400">confidence</span>
      </div>
    </div>
  );
}

export default function FakeNews() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/fakenews', { text: text.trim() });
      setResult(data);
    } catch (err) {
      toast.error(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verdict = result ? VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.MISLEADING : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12" role="main">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-3xl mx-auto mb-4" aria-hidden="true">
          <MdOutlineFactCheck />
        </div>
        <h1 className="page-header mb-3">
          Election Fact
          <span className="gradient-text"> Checker</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Paste any election-related headline or news paragraph. Gemini AI will analyze it for credibility, bias, and emotional manipulation.
        </p>
      </div>

      {/* Input Card */}
      <div className="card p-6 mb-6">
        <label htmlFor="news-input" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Paste news headline or paragraph
        </label>
        <textarea
          id="news-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="E.g., 'Election Commission postponed elections due to EVM malfunctions nationwide...'"
          className="input-field min-h-[120px] resize-none mb-4"
          aria-describedby="news-input-hint"
          maxLength={3000}
        />
        <p id="news-input-hint" className="text-xs text-gray-400 mb-4">{text.length}/3000 characters</p>

        {/* Sample headlines */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Try a sample:</p>
          <div className="flex flex-col gap-2">
            {SAMPLE_HEADLINES.map(h => (
              <button
                key={h}
                onClick={() => setText(h)}
                className="text-left text-xs text-blue-600 dark:text-blue-400 hover:underline"
                aria-label={`Use sample: ${h}`}
              >
                → "{h}"
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={analyze}
          disabled={!text.trim() || loading}
          className={`btn-primary w-full justify-center ${(!text.trim() || loading) ? 'opacity-60 cursor-not-allowed' : ''}`}
          aria-label="Analyze news for credibility"
        >
          {loading ? (
            <><FiRefreshCw className="animate-spin" aria-hidden="true" /> Analyzing with Gemini AI...</>
          ) : (
            <><FiSearch aria-hidden="true" /> Analyze Credibility</>
          )}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
            role="region"
            aria-label="Analysis results"
            aria-live="polite"
          >
            {/* Verdict */}
            <div className={`card p-6 border-2 ${verdict.bg}`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">AI Verdict</p>
                  <div className={`flex items-center gap-2 text-2xl font-bold ${verdict.color}`}>
                    {verdict.icon}
                    <span>{verdict.label}</span>
                  </div>
                </div>
                <div className="relative">
                  <ConfidenceRing value={result.confidence} />
                </div>
              </div>
              {result.isDemo && (
                <p className="mt-3 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2">
                  ⚠️ Demo mode — Add Gemini API key to get real AI analysis
                </p>
              )}
            </div>

            {/* Score Meters */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiZap className="text-yellow-500" aria-hidden="true" /> Content Analysis
              </h2>
              <div className="space-y-4">
                <ScoreMeter label="Bias Score" value={result.biasScore} color={result.biasScore > 6 ? 'red' : result.biasScore > 3 ? 'yellow' : 'green'} />
                <ScoreMeter label="Emotional Language" value={result.emotionalLanguage} color={result.emotionalLanguage > 6 ? 'red' : result.emotionalLanguage > 3 ? 'yellow' : 'blue'} />
              </div>
              {result.emotionalWords?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">Emotional Words Detected</p>
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Emotional words">
                    {result.emotionalWords.map(word => (
                      <span key={word} role="listitem" className="badge-red text-xs">{word}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Explanation */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FiInfo className="text-blue-500" aria-hidden="true" /> AI Explanation
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{result.explanation}</p>
            </div>

            {/* Neutral Rewrite */}
            <div className="card p-6 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
              <h2 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                <FiCheckCircle aria-hidden="true" /> Neutral Rewrite
              </h2>
              <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed italic">
                "{result.neutralRewrite}"
              </p>
            </div>

            {/* Red Flags */}
            {result.redFlags?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                  <FiAlertTriangle aria-hidden="true" /> Red Flags
                </h2>
                <ul className="space-y-2">
                  {result.redFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-red-500 mt-0.5" aria-hidden="true">•</span> {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Verify Sources */}
            {result.sources?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Verify At</h2>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map(src => (
                    <span key={src} className="badge-blue text-xs">{src}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

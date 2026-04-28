import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload, FiFileText, FiAlertTriangle, FiCheckCircle,
  FiRefreshCw, FiArrowRight, FiZap, FiBarChart2, FiFlag
} from 'react-icons/fi';
import { MdOutlineAnalytics, MdPeopleAlt } from 'react-icons/md';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SAMPLE_TEXT = `Our party commits to creating 2 crore jobs annually through Make in India 2.0. We will double farmer income by 2026 through guaranteed MSP at 1.5x production cost. Free healthcare for all citizens below the poverty line under PM Health Shield. We will build 100 smart cities with world-class infrastructure. Education will be made free and compulsory up to Class 12, with special focus on skill development for youth. Women will receive 33% reservation in all government jobs. A monthly stipend of Rs 2000 will be given to all unemployed graduates.`;

const IMPACT_GROUPS = [
  { key: 'youth', label: 'Youth & Students', icon: '🎓' },
  { key: 'farmers', label: 'Farmers', icon: '🌾' },
  { key: 'women', label: 'Women', icon: '👩' },
  { key: 'minorities', label: 'Minorities', icon: '🤝' },
  { key: 'economy', label: 'Economy', icon: '📈' },
];

function FeasibilityMeter({ score }) {
  const color = score >= 7 ? 'bg-green-500' : score >= 4 ? 'bg-yellow-500' : 'bg-red-500';
  const label = score >= 7 ? 'High Feasibility' : score >= 4 ? 'Moderate Feasibility' : 'Low Feasibility';
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700 dark:text-gray-300">Feasibility Score</span>
        <span className="font-bold text-gray-900 dark:text-white">{score}/10 — {label}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`${color} h-3 rounded-full`}
        />
      </div>
    </div>
  );
}

export default function Manifesto() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('File too large. Max 2MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target.result);
    reader.readAsText(file);
  };

  const analyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/manifesto/analyze', { text: text.trim() });
      setResult(data);
      setActiveTab('overview');
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const sentimentColor = result?.overallSentiment === 'Positive' ? 'text-green-600' :
    result?.overallSentiment === 'Negative' ? 'text-red-600' : 'text-yellow-600';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12" role="main">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl mx-auto mb-4" aria-hidden="true">
          <MdOutlineAnalytics />
        </div>
        <h1 className="page-header mb-3">
          Manifesto
          <span className="gradient-text"> Analyzer</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Paste any election manifesto text. Gemini AI analyzes promises, feasibility, and impact on different groups of citizens.
        </p>
      </div>

      {/* Input */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <label htmlFor="manifesto-input" className="font-semibold text-gray-900 dark:text-white">
            <FiFileText className="inline mr-2 text-indigo-500" aria-hidden="true" />
            Paste Manifesto Text
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setText(SAMPLE_TEXT)}
              className="text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors"
              aria-label="Load sample manifesto text"
            >
              Load Sample
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
              aria-label="Upload text file"
            >
              <FiUpload className="text-xs" aria-hidden="true" /> Upload .txt
            </button>
            <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFile} aria-label="File upload" />
          </div>
        </div>
        <textarea
          id="manifesto-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the party manifesto, election promises, or political speech here..."
          className="input-field min-h-[160px] resize-none mb-3"
          maxLength={50000}
          aria-describedby="manifesto-hint"
        />
        <div className="flex items-center justify-between">
          <p id="manifesto-hint" className="text-xs text-gray-400">{text.length.toLocaleString()}/50,000 characters</p>
          <button
            onClick={analyze}
            disabled={!text.trim() || loading}
            className={`btn-primary ${(!text.trim() || loading) ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-label="Analyze manifesto with AI"
          >
            {loading
              ? <><FiRefreshCw className="animate-spin" aria-hidden="true" /> Analyzing...</>
              : <><FiZap aria-hidden="true" /> Analyze with AI</>
            }
          </button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Demo banner */}
            {result.isDemo && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-yellow-700 dark:text-yellow-300">
                ⚠️ Demo mode — add Gemini API key to analyze real manifestos
              </div>
            )}

            {/* Summary Header */}
            <div className="card p-6 mb-4">
              <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{result.partyOrTitle}</h2>
                  <p className="text-sm text-gray-500">{result.electionType}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className={`font-semibold text-sm ${sentimentColor}`}>
                    {result.overallSentiment} Sentiment
                  </span>
                  <span className="badge-blue">{result.readabilityLevel} Read</span>
                  {result.isSwingSeat && <span className="badge-red">Swing Seat</span>}
                </div>
              </div>
              <FeasibilityMeter score={result.feasibilityScore || 5} />
              {result.feasibilityReason && (
                <p className="text-xs text-gray-400 mt-2">{result.feasibilityReason}</p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl" role="tablist">
              {[
                { id: 'overview', label: 'Key Promises' },
                { id: 'impact', label: 'Citizen Impact' },
                { id: 'analysis', label: 'Red Flags' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  role="tab"
                  aria-selected={activeTab === id}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="card p-6" role="tabpanel">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiFlag className="text-indigo-500" aria-hidden="true" /> Top Promises
                </h3>
                <ol className="space-y-3">
                  {(result.keyPromises || []).map((p, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{p}</span>
                    </li>
                  ))}
                </ol>
                {result.positiveHighlights?.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-semibold uppercase text-gray-400 mb-3">✅ Specific & Actionable</p>
                    {result.positiveHighlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400 mb-1.5">
                        <FiCheckCircle className="mt-0.5 shrink-0" aria-hidden="true" /> {h}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'impact' && (
              <div className="card p-6 space-y-4" role="tabpanel">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <MdPeopleAlt className="text-indigo-500" aria-hidden="true" /> Impact by Citizen Group
                </h3>
                {IMPACT_GROUPS.map(({ key, label, icon }) => (
                  result.impactGroups?.[key] && (
                    <div key={key} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm mb-1">{icon} {label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{result.impactGroups[key]}</p>
                    </div>
                  )
                ))}
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-4" role="tabpanel">
                {result.redFlags?.length > 0 && (
                  <div className="card p-6 border-2 border-red-100 dark:border-red-900">
                    <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                      <FiAlertTriangle aria-hidden="true" /> Red Flags & Vague Claims
                    </h3>
                    {result.redFlags.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <span className="text-red-500 mt-0.5 shrink-0" aria-hidden="true">⚠</span> {f}
                      </div>
                    ))}
                  </div>
                )}
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FiBarChart2 className="text-blue-500" aria-hidden="true" /> Analyst Summary
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">Feasibility score: {result.feasibilityScore}/10</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{result.feasibilityReason}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

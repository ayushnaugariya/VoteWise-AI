import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin, FiSearch, FiRefreshCw, FiUser, FiInfo,
  FiTrendingUp, FiAlertCircle, FiExternalLink
} from 'react-icons/fi';
import { MdHowToVote, MdOutlineAccountBalance } from 'react-icons/md';
import { RiGovernmentLine } from 'react-icons/ri';
import api from '../utils/api';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi (NCT)', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

const SAMPLE_PINCODES = [
  { pincode: '110001', label: 'New Delhi' },
  { pincode: '400001', label: 'Mumbai' },
  { pincode: '600001', label: 'Chennai' },
  { pincode: '560001', label: 'Bengaluru' },
];

function InfoCard({ icon, title, children }) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

export default function Constituency() {
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const research = async () => {
    if (!pincode.trim() || loading) return;
    if (!/^\d{6}$/.test(pincode)) { toast.error('Enter a valid 6-digit pincode'); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/constituency/research', { pincode, state });
      setResult(data);
      toast.success('Constituency data found!');
    } catch (err) {
      const backendError = err.response?.data?.details || err.response?.data?.error || err.message;
      toast.error(backendError || 'Research failed');
    } finally {
      setLoading(false);
    }
  };

  const confidenceColor = {
    'High': 'text-green-600 dark:text-green-400',
    'Medium': 'text-yellow-600 dark:text-yellow-400',
    'Low': 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12" role="main">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-3xl mx-auto mb-4" aria-hidden="true">
          <FiMapPin />
        </div>
        <h1 className="page-header mb-3">
          Constituency
          <span className="gradient-text"> Researcher</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Enter your 6-digit pincode. Gemini AI will find your Lok Sabha constituency, current MP, MLA, and local political history.
        </p>
      </div>

      {/* Search */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="sm:col-span-2">
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <FiMapPin className="inline mr-1" aria-hidden="true" /> Pincode
            </label>
            <input
              id="pincode"
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && research()}
              placeholder="e.g. 110001"
              className="input-field font-mono text-lg"
              maxLength={6}
              inputMode="numeric"
              aria-describedby="pincode-hint"
            />
            <p id="pincode-hint" className="text-xs text-gray-400 mt-1">India 6-digit postal pincode</p>
          </div>
          <div>
            <label htmlFor="state-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              State (optional)
            </label>
            <select
              id="state-select"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="input-field"
              aria-label="Select state for more accurate results"
            >
              <option value="">Auto-detect</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Sample pincodes */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-gray-400 self-center">Try:</span>
          {SAMPLE_PINCODES.map(({ pincode: p, label }) => (
            <button
              key={p}
              onClick={() => setPincode(p)}
              className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
              aria-label={`Try ${label} pincode ${p}`}
            >
              {label} ({p})
            </button>
          ))}
        </div>

        <button
          onClick={research}
          disabled={pincode.length !== 6 || loading}
          className={`btn-primary w-full justify-center ${(pincode.length !== 6 || loading) ? 'opacity-60 cursor-not-allowed' : ''}`}
          aria-label="Research constituency"
        >
          {loading
            ? <><FiRefreshCw className="animate-spin" aria-hidden="true" /> Researching with AI...</>
            : <><FiSearch aria-hidden="true" /> Find My Constituency</>
          }
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Demo banner */}
            {result.isDemo && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-yellow-700 dark:text-yellow-300">
                ⚠️ Demo mode — add Gemini API key for real AI-powered constituency research
              </div>
            )}

            {/* Location Header */}
            <div className="card p-6">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1">📍 {result.district}, {result.state}</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{result.lokSabhaConstituency}</h2>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Lok Sabha Constituency</p>
                  {result.vidhanSabhaConstituency && (
                    <p className="text-sm text-gray-500 mt-1">🏛️ Vidhan Sabha: {result.vidhanSabhaConstituency}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {result.isSwingSeat && (
                    <span className="badge-red">⚡ Swing Seat</span>
                  )}
                  <span className={`text-xs font-semibold ${confidenceColor[result.confidence] || 'text-gray-500'}`}>
                    AI Confidence: {result.confidence}
                  </span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                {[
                  { label: 'Total Voters', value: result.totalVoters, icon: <MdHowToVote className="text-blue-500" /> },
                  { label: 'Last Turnout', value: result.lastTurnout, icon: <FiTrendingUp className="text-green-500" /> },
                  { label: 'MP Since', value: result.currentMP?.since || 'Unknown', icon: <RiGovernmentLine className="text-purple-500" /> },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                    <div className="flex justify-center mb-1" aria-hidden="true">{icon}</div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{value}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* MP Info */}
            {result.currentMP?.name && (
              <InfoCard icon={<FiUser className="text-blue-500" aria-hidden="true" />} title="Current Member of Parliament (MP)">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{result.currentMP.name}</p>
                    <p className="text-sm text-gray-500">{result.currentMP.party} · Since {result.currentMP.since}</p>
                  </div>
                  {result.currentMP.marginOfVictory && (
                    <span className="badge-blue text-xs">Won by {result.currentMP.marginOfVictory}</span>
                  )}
                </div>
              </InfoCard>
            )}

            {/* MLA Info */}
            {result.currentMLA?.name && (
              <InfoCard icon={<MdOutlineAccountBalance className="text-purple-500" aria-hidden="true" />} title="Current MLA (State Assembly)">
                <p className="font-bold text-gray-900 dark:text-white">{result.currentMLA.name}</p>
                <p className="text-sm text-gray-500">{result.currentMLA.party} · Since {result.currentMLA.since}</p>
              </InfoCard>
            )}

            {/* Historical Trend */}
            {result.historicalTrend && (
              <InfoCard icon={<FiTrendingUp className="text-orange-500" aria-hidden="true" />} title="Political History">
                <p className="text-sm text-gray-600 dark:text-gray-300">{result.historicalTrend}</p>
              </InfoCard>
            )}

            {/* Voter Profile */}
            {result.voterProfile && (
              <InfoCard icon={<FiInfo className="text-green-500" aria-hidden="true" />} title="Voter Demographics">
                <p className="text-sm text-gray-600 dark:text-gray-300">{result.voterProfile}</p>
              </InfoCard>
            )}

            {/* Key Issues */}
            {result.keyIssues?.length > 0 && (
              <InfoCard icon={<FiAlertCircle className="text-red-500" aria-hidden="true" />} title="Key Local Issues">
                <div className="flex flex-wrap gap-2" role="list" aria-label="Key local issues">
                  {result.keyIssues.map((issue, i) => (
                    <span key={i} role="listitem" className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-sm border border-red-100 dark:border-red-800">
                      {issue}
                    </span>
                  ))}
                </div>
              </InfoCard>
            )}

            {/* Disclaimer + ECI Link */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-start gap-3">
              <FiInfo className="text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm">
                <p className="text-blue-700 dark:text-blue-300">{result.disclaimer}</p>
                <a
                  href="https://eci.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 font-medium text-blue-600 hover:underline"
                  aria-label="Verify at Election Commission of India website (opens in new tab)"
                >
                  Verify at eci.gov.in <FiExternalLink aria-hidden="true" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckCircle, FiAlertTriangle, FiArrowRight, FiUser,
  FiMapPin, FiSearch, FiShield, FiAward, FiFileText,
  FiAlertCircle, FiStar, FiExternalLink, FiInfo
} from 'react-icons/fi';
import { MdHowToVote, MdGavel, MdAccountBalance } from 'react-icons/md';
import axios from 'axios';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi (NCT)', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

function RatingBadge({ rating }) {
  const color = rating >= 7 ? 'green' : rating >= 5 ? 'yellow' : 'red';
  const label = rating >= 7 ? 'Good Record' : rating >= 5 ? 'Mixed Record' : 'Poor Record';
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm
      ${color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
        color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
      <FiStar aria-hidden="true" />
      {rating}/10 — {label}
    </div>
  );
}

function ConfidenceBadge({ level }) {
  const map = { HIGH: ['green', '✅ High Confidence'], MEDIUM: ['yellow', '⚠️ Medium Confidence'], LOW: ['red', '⚠️ Low Confidence'] };
  const [color, label] = map[level] || map.LOW;
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full
      ${color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
        color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
      {label}
    </span>
  );
}

export default function CandidateReport() {
  const [form, setForm] = useState({ name: '', constituency: '', state: '' });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!form.name.trim() || !form.constituency.trim()) return;
    setLoading(true);
    setReport(null);
    setError('');
    try {
      const { data } = await axios.post('/api/candidate', form);
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10" role="main">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-3xl mx-auto mb-4" aria-hidden="true">
          <MdGavel />
        </div>
        <h1 className="page-header mb-3">
          Candidate
          <span className="gradient-text"> Report Card</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Know who you're voting for. Get an AI-generated report on a candidate's background, criminal record, assets, and track record — before you vote.
        </p>
      </div>

      {/* Search Form */}
      <div className="card p-8 mb-6">
        <div className="space-y-4">
          {/* Candidate Name */}
          <div>
            <label htmlFor="candidate-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <FiUser className="inline mr-1.5" aria-hidden="true" />
              Candidate Name <span className="text-red-500">*</span>
            </label>
            <input
              id="candidate-name"
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g., Narendra Modi, Rahul Gandhi"
              className="input-field"
              required
              aria-required="true"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Constituency */}
          <div>
            <label htmlFor="constituency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <FiMapPin className="inline mr-1.5" aria-hidden="true" />
              Constituency <span className="text-red-500">*</span>
            </label>
            <input
              id="constituency"
              type="text"
              value={form.constituency}
              onChange={(e) => update('constituency', e.target.value)}
              placeholder="e.g., Varanasi, Amethi, South Mumbai"
              className="input-field"
              required
              aria-required="true"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* State (optional) */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <FiMapPin className="inline mr-1.5" aria-hidden="true" />
              State (optional — improves accuracy)
            </label>
            <select
              id="state"
              value={form.state}
              onChange={(e) => update('state', e.target.value)}
              className="input-field"
              aria-label="Select state for better accuracy"
            >
              <option value="">Select state (optional)</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !form.name.trim() || !form.constituency.trim()}
            className={`btn-primary w-full justify-center mt-2 ${(loading || !form.name.trim() || !form.constituency.trim()) ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-label="Generate candidate report card"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                Generating Report…
              </>
            ) : (
              <>
                <FiSearch aria-hidden="true" />
                Generate Report Card
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-center gap-2" role="alert">
            <FiAlertCircle aria-hidden="true" />
            {error}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300 mb-6">
        <FiInfo className="shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          This tool uses AI to summarize publicly available information. Always verify criminal records and asset declarations at{' '}
          <a href="https://affidavit.eci.gov.in" target="_blank" rel="noopener noreferrer" className="font-semibold underline">affidavit.eci.gov.in</a>{' '}
          before making your voting decision.
        </p>
      </div>

      {/* Report Card */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="region"
            aria-label="Candidate report card"
            aria-live="polite"
          >
            {/* Top Identity Card */}
            <div className="card p-6 mb-4 border-2 border-violet-200 dark:border-violet-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{report.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                    {report.party} · {report.constituency}
                    {report.position && <> · <span className="text-blue-600 dark:text-blue-400">{report.position}</span></>}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <RatingBadge rating={report.overallRating} />
                  {report.dataConfidence && <ConfidenceBadge level={report.dataConfidence} />}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <FiUser />, label: 'Age', value: report.age },
                  { icon: <FiAward />, label: 'Experience', value: report.experience },
                  { icon: <FiFileText />, label: 'Education', value: report.education },
                  { icon: <MdAccountBalance />, label: 'Assets', value: report.assetsValue },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                    <div className="text-violet-500 flex justify-center mb-1" aria-hidden="true">{icon}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{value || 'N/A'}</p>
                  </div>
                ))}
              </div>

              {report.ratingReason && (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                  💬 {report.ratingReason}
                </p>
              )}
            </div>

            {/* Criminal Record */}
            <div className={`card p-6 mb-4 border-2 ${report.criminalCases > 0 ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10' : 'border-green-200 dark:border-green-800'}`}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MdGavel className={report.criminalCases > 0 ? 'text-red-500' : 'text-green-500'} aria-hidden="true" />
                Criminal Record
              </h3>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-3xl font-black ${report.criminalCases > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {report.criminalCases}
                </span>
                <span className="text-gray-600 dark:text-gray-300 text-sm">
                  declared criminal case{report.criminalCases !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{report.criminalDetails}</p>
            </div>

            {/* Red Flags & Positives */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Red Flags */}
              <div className="card p-5 border-2 border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                  <FiAlertTriangle aria-hidden="true" /> Red Flags
                </h3>
                {report.redFlags?.length > 0 ? (
                  <ul className="space-y-2">
                    {report.redFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-red-500 mt-0.5 shrink-0">⚠</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No major red flags found.</p>
                )}
              </div>

              {/* Positives */}
              <div className="card p-5 border-2 border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                  <FiCheckCircle aria-hidden="true" /> Positives
                </h3>
                {report.positives?.length > 0 ? (
                  <ul className="space-y-2">
                    {report.positives.map((pos, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                        {pos}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No notable positives recorded.</p>
                )}
              </div>
            </div>

            {/* Key Achievements */}
            {report.keyAchievements?.length > 0 && (
              <div className="card p-6 mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiAward className="text-violet-500" aria-hidden="true" />
                  Key Achievements
                </h3>
                <ul className="space-y-2">
                  {report.keyAchievements.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-violet-500 mt-0.5 shrink-0">🏅</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Verify Links */}
            <div className="card p-6 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FiShield className="text-blue-500" aria-hidden="true" />
                Verify This Information Yourself
              </h3>
              <div className="flex flex-wrap gap-2">
                {(report.verifyLinks || ['https://affidavit.eci.gov.in', 'https://myneta.info', 'https://eci.gov.in']).map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg"
                    aria-label={`Verify on ${link} (opens in new tab)`}
                  >
                    <FiExternalLink aria-hidden="true" />
                    {link.replace('https://', '')}
                  </a>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-yellow-800 dark:text-yellow-200">
              <FiAlertTriangle className="shrink-0 mt-0.5" aria-hidden="true" />
              <p>{report.disclaimer}</p>
            </div>

            {/* Search Again */}
            <button
              onClick={() => { setReport(null); setForm({ name: '', constituency: '', state: '' }); }}
              className="mt-4 btn-secondary w-full justify-center"
              aria-label="Search for a different candidate"
            >
              <FiSearch aria-hidden="true" />
              Search Another Candidate
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

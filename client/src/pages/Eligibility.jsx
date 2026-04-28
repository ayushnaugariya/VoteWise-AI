import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckCircle, FiXCircle, FiAlertTriangle, FiArrowRight,
  FiUser, FiMapPin, FiGlobe, FiFileText
} from 'react-icons/fi';
import { MdHowToVote } from 'react-icons/md';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi (NCT)', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

const REGISTRATION_DOCS = [
  'EPIC Card (Voter ID)', 'Aadhaar Card', 'Passport', 'Driving License',
  'PAN Card', 'MNREGA Job Card', 'Bank/Post Office Passbook with Photo',
  'Smart Card issued by RGI', 'Pension Document with Photo',
];

export const checkEligibility = ({ age, citizenship, hasId }) => {
  const reasons = [];
  let eligible = true;

  if (age < 18) { eligible = false; reasons.push(`You must be at least 18 years old (you are ${age})`); }
  if (!citizenship) { eligible = false; reasons.push('Only Indian citizens can vote in General/State elections'); }
  if (!hasId) reasons.push('You will need a valid ID to vote (EPIC card or 12 alternatives)');

  return { eligible, reasons };
};

export default function Eligibility() {
  const [form, setForm] = useState({ age: '', citizenship: '', state: '', hasId: false });
  const [result, setResult] = useState(null);

  const handleCheck = () => {
    if (!form.age || !form.citizenship || !form.state) return;
    const age = parseInt(form.age, 10);
    if (isNaN(age) || age < 0 || age > 120) return;
    const res = checkEligibility({
      age,
      citizenship: form.citizenship === 'yes',
      hasId: form.hasId,
    });
    setResult({ ...res, age, state: form.state });
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-2xl mx-auto px-6 py-12" role="main">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-3xl mx-auto mb-4" aria-hidden="true">
          <MdHowToVote />
        </div>
        <h1 className="page-header mb-3">
          Voting
          <span className="gradient-text"> Eligibility Checker</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Find out if you're eligible to vote in Indian elections and what you need to register.
        </p>
      </div>

      {/* Form */}
      <div className="card p-8 mb-6">
        <fieldset>
          <legend className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Enter Your Details
          </legend>

          <div className="space-y-5">
            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <FiUser className="inline mr-1" aria-hidden="true" />
                Your Age
              </label>
              <input
                id="age"
                type="number"
                min="0"
                max="120"
                value={form.age}
                onChange={(e) => update('age', e.target.value)}
                placeholder="Enter your age"
                className="input-field"
                aria-describedby="age-hint"
                required
              />
              <p id="age-hint" className="text-xs text-gray-400 mt-1">Minimum voting age in India is 18 years</p>
            </div>

            {/* Citizenship */}
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiGlobe className="inline mr-1" aria-hidden="true" />
                Are you an Indian citizen?
              </span>
              <div className="flex gap-3" role="radiogroup" aria-label="Indian citizenship status">
                {[
                  { value: 'yes', label: 'Yes, I am an Indian citizen' },
                  { value: 'no', label: 'No, I am not' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => update('citizenship', value)}
                    role="radio"
                    aria-checked={form.citizenship === value}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.citizenship === value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <FiMapPin className="inline mr-1" aria-hidden="true" />
                Your State / UT
              </label>
              <select
                id="state"
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                className="input-field"
                required
                aria-label="Select your state or union territory"
              >
                <option value="">Select your state</option>
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Has Voter ID */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasId}
                  onChange={(e) => update('hasId', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label="I have a Voter ID (EPIC card) or valid alternate ID"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I have a Voter ID (EPIC card) or valid alternate ID
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={!form.age || !form.citizenship || !form.state}
            className={`btn-primary w-full justify-center mt-6 ${(!form.age || !form.citizenship || !form.state) ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-label="Check voting eligibility"
          >
            Check My Eligibility
            <FiArrowRight aria-hidden="true" />
          </button>
        </fieldset>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="region"
            aria-label="Eligibility result"
            aria-live="polite"
          >
            {/* Main result card */}
            <div className={`card p-6 border-2 mb-4 ${
              result.eligible
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {result.eligible
                  ? <FiCheckCircle className="text-4xl text-green-600 dark:text-green-400" aria-hidden="true" />
                  : <FiXCircle className="text-4xl text-red-600 dark:text-red-400" aria-hidden="true" />
                }
                <div>
                  <h2 className={`text-2xl font-bold ${result.eligible ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {result.eligible ? 'You Are Eligible to Vote!' : 'Not Currently Eligible'}
                  </h2>
                  <p className="text-sm text-gray-500">In {result.state}, India</p>
                </div>
              </div>

              {result.reasons.length > 0 && (
                <ul className="space-y-2 mt-4">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <FiAlertTriangle className="text-yellow-500 mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="text-gray-700 dark:text-gray-300">{r}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Next Steps */}
            <div className="card p-6 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiArrowRight className="text-blue-500" aria-hidden="true" />
                {result.eligible ? 'How to Register / Verify Your Vote' : 'What You Can Do'}
              </h3>
              {result.eligible ? (
                <ol className="space-y-3">
                  {[
                    { step: 'Check voter list', desc: 'Visit voters.eci.gov.in and search by name/EPIC number' },
                    { step: 'Register online (Form 6)', desc: 'Go to nvsp.in or use the Voter Helpline App to register' },
                    { step: 'Or visit BLO office', desc: 'Your local Booth Level Officer can help register in-person' },
                    { step: 'Download EPIC card', desc: 'Download your e-EPIC from voterportal.eci.gov.in' },
                  ].map(({ step, desc }, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{step}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li>Wait until you turn 18 to register as a voter</li>
                  <li>Only Indian citizens can vote in Lok Sabha/Vidhan Sabha elections</li>
                  <li>NRIs holding OCI/PIO cards are not eligible to vote</li>
                  <li>Call Voter Helpline: <strong>1950</strong> for guidance</li>
                </ul>
              )}
            </div>

            {/* Documents needed */}
            {result.eligible && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiFileText className="text-purple-500" aria-hidden="true" />
                  Accepted ID Documents at Polling Booth
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REGISTRATION_DOCS.map(doc => (
                    <li key={doc} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <FiCheckCircle className="text-green-500 shrink-0 text-xs" aria-hidden="true" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

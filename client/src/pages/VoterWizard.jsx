import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckCircle, FiXCircle, FiArrowRight, FiChevronDown, FiChevronUp,
  FiExternalLink, FiAlertCircle, FiInfo
} from 'react-icons/fi';
import { MdHowToVote } from 'react-icons/md';

const STEPS = [
  {
    id: 'age',
    question: 'How old are you?',
    icon: '🎂',
    type: 'number',
    placeholder: 'Enter your age',
    helper: 'Minimum voting age in India is 18 years',
    validate: (v) => {
      const n = parseInt(v, 10);
      if (!v || isNaN(n)) return 'Please enter your age';
      if (n < 1 || n > 120) return 'Please enter a valid age';
      return null;
    },
    getResult: (v) => {
      const n = parseInt(v, 10);
      return n >= 18
        ? { ok: true, message: `✅ You are ${n} years old — eligible by age!` }
        : { ok: false, message: `❌ You are ${n} years old. You must be at least 18 to vote.` };
    },
  },
  {
    id: 'citizen',
    question: 'Are you an Indian citizen?',
    icon: '🇮🇳',
    type: 'choice',
    choices: [
      { value: 'yes', label: 'Yes, I am an Indian citizen' },
      { value: 'no', label: 'No, I hold a foreign citizenship' },
      { value: 'oci', label: 'I hold OCI / PIO card' },
    ],
    validate: (v) => v ? null : 'Please select an option',
    getResult: (v) => {
      if (v === 'yes') return { ok: true, message: '✅ Indian citizens are eligible to vote.' };
      if (v === 'oci') return { ok: false, message: '❌ OCI/PIO card holders are NOT eligible to vote in Indian elections.' };
      return { ok: false, message: '❌ Only Indian citizens can vote in Lok Sabha and Vidhan Sabha elections.' };
    },
  },
  {
    id: 'state',
    question: 'Which state / UT do you live in?',
    icon: '🗺️',
    type: 'state',
    validate: (v) => v ? null : 'Please select your state',
    getResult: (v) => ({ ok: true, message: `✅ You are registering as a voter in ${v}.` }),
  },
  {
    id: 'residence',
    question: 'Have you been living in this state for at least 6 months?',
    icon: '🏠',
    type: 'choice',
    choices: [
      { value: 'yes', label: 'Yes, I have lived here for 6+ months' },
      { value: 'no', label: 'No, I recently moved here' },
    ],
    validate: (v) => v ? null : 'Please select an option',
    getResult: (v) => {
      if (v === 'yes') return { ok: true, message: '✅ You meet the residency requirement.' };
      return { ok: false, message: '⚠️ You should register in the state where you have been an ordinary resident for at least 6 months.' };
    },
  },
  {
    id: 'id',
    question: 'Do you have any of these valid ID documents?',
    icon: '🪪',
    type: 'choice',
    choices: [
      { value: 'epic', label: '✅ Yes — I have a Voter ID (EPIC card)' },
      { value: 'alt', label: '📄 Yes — I have Aadhaar / Passport / PAN / Driving Licence' },
      { value: 'no', label: '❌ No, I don\'t have any ID yet' },
    ],
    validate: (v) => v ? null : 'Please select an option',
    getResult: (v) => {
      if (v === 'epic') return { ok: true, message: '✅ You already have a Voter ID — you can vote directly!' };
      if (v === 'alt') return { ok: true, message: '✅ Aadhaar & other IDs are accepted as alternate identity proof at polling booths.' };
      return { ok: false, message: '⚠️ You will need to get an ID before election day. Apply via Voter Helpline App or NVSP.' };
    },
  },
  {
    id: 'enrolled',
    question: 'Is your name in the Electoral Roll (Voter List)?',
    icon: '📋',
    type: 'choice',
    choices: [
      { value: 'yes', label: 'Yes, I have checked — my name is on the list' },
      { value: 'no', label: 'No, my name is not on the list' },
      { value: 'unsure', label: 'I am not sure — I have not checked yet' },
    ],
    validate: (v) => v ? null : 'Please select an option',
    getResult: (v) => {
      if (v === 'yes') return { ok: true, message: '✅ You are enrolled and ready to vote!' };
      if (v === 'no') return { ok: false, message: '⚠️ You need to register using Form 6 on NVSP.in or the Voter Helpline App.' };
      return { ok: false, message: '⚠️ Check your name at voters.eci.gov.in/search-in-electoral-roll' };
    },
  },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi (NCT)', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

const STATE_DOCS = {
  default: {
    form: 'Form 6 (New Registration)',
    portal: 'https://voters.eci.gov.in',
    app: 'Voter Helpline App',
    docs: ['Aadhaar Card', 'Date of Birth proof (Birth Certificate / Marksheet)', 'Passport-size photograph', 'Address proof (Utility bill / Bank statement)'],
    link: 'https://nvsp.in',
  },
};

function getStateDocs(state) {
  return STATE_DOCS[state] || STATE_DOCS.default;
}

function FinalResult({ answers }) {
  const results = STEPS.map(step => ({
    ...step,
    value: answers[step.id],
    result: step.getResult(answers[step.id]),
  }));

  const allOk = results.every(r => r.result.ok);
  const blockers = results.filter(r => !r.result.ok);
  const stateDocs = getStateDocs(answers.state);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} role="region" aria-label="Registration result" aria-live="polite">
      {/* Status Banner */}
      <div className={`card p-6 mb-6 border-2 text-center ${allOk ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'}`}>
        <div className="text-5xl mb-3" aria-hidden="true">{allOk ? '🗳️' : '⚠️'}</div>
        <h2 className={`text-2xl font-bold mb-2 ${allOk ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
          {allOk ? 'You Are Ready to Vote! 🎉' : 'Action Required Before You Vote'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {allOk
            ? 'All eligibility checks passed. You are ready to exercise your democratic right!'
            : `${blockers.length} issue${blockers.length > 1 ? 's' : ''} need to be resolved before you can vote.`}
        </p>
      </div>

      {/* Checklist Summary */}
      <div className="card p-6 mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Eligibility Checklist</h3>
        <ul className="space-y-3">
          {results.map((r) => (
            <li key={r.id} className="flex items-start gap-3 text-sm">
              {r.result.ok
                ? <FiCheckCircle className="text-green-500 mt-0.5 shrink-0" aria-hidden="true" />
                : <FiXCircle className="text-red-500 mt-0.5 shrink-0" aria-hidden="true" />}
              <span className="text-gray-700 dark:text-gray-300">{r.result.message}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Registration Steps */}
      <div className="card p-6 mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiArrowRight className="text-blue-500" aria-hidden="true" />
          {allOk ? 'How to Vote on Election Day' : 'Steps to Complete Registration'}
        </h3>
        <ol className="space-y-4">
          {allOk ? (
            [
              { step: 'Check your polling booth', desc: 'Visit voters.eci.gov.in → Search Electoral Roll → Note your booth number' },
              { step: 'Carry your ID', desc: 'Bring your Voter ID (EPIC) or any of 12 valid alternative documents' },
              { step: 'Go to your booth', desc: 'Arrive at the correct polling station on election day' },
              { step: 'Cast your vote!', desc: 'Your vote is secret and sacred. Use the EVM machine — NOTA is also an option.' },
            ].map(({ step, desc }, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{step}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </li>
            ))
          ) : (
            [
              { step: `Fill ${stateDocs.form}`, desc: `Visit ${stateDocs.portal} or use the ${stateDocs.app} to apply online` },
              { step: 'Attach required documents', desc: stateDocs.docs.join(', ') },
              { step: 'Submit & track', desc: 'Track your application status online or visit your local BLO office' },
              { step: 'Download e-EPIC', desc: 'After approval, download your digital Voter ID from voterportal.eci.gov.in' },
            ].map(({ step, desc }, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{step}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </li>
            ))
          )}
        </ol>
      </div>

      {/* Documents */}
      {!allOk && (
        <div className="card p-6 mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📄 Documents Required for Registration</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stateDocs.docs.map(doc => (
              <li key={doc} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <FiCheckCircle className="text-green-500 shrink-0 text-xs" aria-hidden="true" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Links */}
      <div className="card p-6 mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🔗 Official Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { href: 'https://voters.eci.gov.in', label: 'Search Electoral Roll (voters.eci.gov.in)' },
            { href: 'https://nvsp.in', label: 'Register / Update Voter ID (nvsp.in)' },
            { href: 'https://voterportal.eci.gov.in', label: 'Download e-EPIC Card' },
            { href: 'https://1950.in', label: 'Voter Helpline — Call 1950' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              aria-label={`${label} (opens in new tab)`}
            >
              <FiExternalLink aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function VoterWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [done, setDone] = useState(false);
  const [expanded, setExpanded] = useState({});

  const step = STEPS[currentStep];

  const handleNext = () => {
    const err = step.validate(currentInput);
    if (err) { setInputError(err); return; }
    setInputError('');
    const newAnswers = { ...answers, [step.id]: currentInput };
    setAnswers(newAnswers);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentInput('');
    } else {
      setDone(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentInput(answers[STEPS[currentStep - 1].id] || '');
      setInputError('');
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setAnswers({});
    setCurrentInput('');
    setDone(false);
    setInputError('');
  };

  const progress = done ? 100 : Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10" role="main">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-3xl mx-auto mb-4" aria-hidden="true">
          <MdHowToVote />
        </div>
        <h1 className="page-header mb-3">
          Voter Registration
          <span className="gradient-text"> Wizard</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Answer a few quick questions — we'll check if you're eligible and tell you exactly how to register.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Step {done ? STEPS.length : currentStep + 1} of {STEPS.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Wizard progress">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Completed Steps Summary (collapsible) */}
      {Object.keys(answers).length > 0 && !done && (
        <div className="card mb-4">
          <button
            onClick={() => setExpanded(p => ({ ...p, prev: !p.prev }))}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300"
            aria-expanded={!!expanded.prev}
          >
            <span>Your answers so far</span>
            {expanded.prev ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          <AnimatePresence>
            {expanded.prev && (
              <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-4 pb-3 space-y-1">
                {STEPS.slice(0, currentStep).map(s => {
                  const res = s.getResult(answers[s.id]);
                  return (
                    <li key={s.id} className="flex items-center gap-2 text-xs">
                      {res.ok ? <FiCheckCircle className="text-green-500" /> : <FiXCircle className="text-red-500" />}
                      <span className="text-gray-600 dark:text-gray-300">{s.question} → <strong>{answers[s.id]}</strong></span>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Step / Result */}
      {!done ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="card p-8"
          >
            <div className="text-4xl mb-4 text-center" aria-hidden="true">{step.icon}</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-6">{step.question}</h2>

            {/* Input types */}
            {step.type === 'number' && (
              <div>
                <input
                  type="number"
                  id={`wizard-${step.id}`}
                  min={1}
                  max={120}
                  value={currentInput}
                  onChange={(e) => { setCurrentInput(e.target.value); setInputError(''); }}
                  placeholder={step.placeholder}
                  className="input-field text-center text-2xl font-bold"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  aria-describedby={`${step.id}-hint`}
                />
                {step.helper && <p id={`${step.id}-hint`} className="text-xs text-gray-400 text-center mt-2">{step.helper}</p>}
              </div>
            )}

            {step.type === 'choice' && (
              <div className="space-y-3" role="radiogroup" aria-label={step.question}>
                {step.choices.map(c => (
                  <button
                    key={c.value}
                    onClick={() => { setCurrentInput(c.value); setInputError(''); }}
                    role="radio"
                    aria-checked={currentInput === c.value}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      currentInput === c.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {step.type === 'state' && (
              <select
                id={`wizard-${step.id}`}
                value={currentInput}
                onChange={(e) => { setCurrentInput(e.target.value); setInputError(''); }}
                className="input-field"
                aria-label="Select your state or union territory"
              >
                <option value="">Select your state / UT</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {inputError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400" role="alert">
                <FiAlertCircle aria-hidden="true" />
                {inputError}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {currentStep > 0 && (
                <button onClick={handleBack} className="btn-secondary flex-1 justify-center" aria-label="Go to previous step">
                  ← Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="btn-primary flex-1 justify-center"
                aria-label={currentStep === STEPS.length - 1 ? 'See my eligibility result' : 'Go to next step'}
              >
                {currentStep === STEPS.length - 1 ? 'See My Result →' : 'Next →'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <>
          <FinalResult answers={answers} />
          <button onClick={restart} className="mt-4 btn-secondary w-full justify-center" aria-label="Start over from the beginning">
            🔄 Start Over
          </button>
        </>
      )}

      {/* Info Footer */}
      <div className="mt-6 flex items-start gap-2 text-xs text-gray-400 px-2">
        <FiInfo className="shrink-0 mt-0.5" aria-hidden="true" />
        <p>This wizard guides you based on ECI guidelines. For official registration, always use nvsp.in or the Voter Helpline App.</p>
      </div>
    </div>
  );
}

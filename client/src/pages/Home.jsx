import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdHowToVote, MdOutlineFactCheck, MdOutlineQuiz, MdTranslate
} from 'react-icons/md';
import {
  FiMessageSquare, FiClock, FiShield, FiMic, FiArrowRight, FiCheckCircle
} from 'react-icons/fi';
import { RiGovernmentLine } from 'react-icons/ri';

const features = [
  {
    icon: <FiMessageSquare className="text-2xl" aria-hidden="true" />,
    title: 'AI Chat Assistant',
    desc: 'Ask any question about Indian elections and get instant, accurate answers powered by Gemini AI.',
    color: 'from-blue-500 to-blue-600',
    link: '/chat',
    badge: 'Gemini AI',
  },
  {
    icon: <FiClock className="text-2xl" aria-hidden="true" />,
    title: 'Election Timeline',
    desc: 'Visualize the complete Indian election process from announcement to government formation.',
    color: 'from-purple-500 to-purple-600',
    link: '/timeline',
    badge: 'Interactive',
  },
  {
    icon: <MdOutlineFactCheck className="text-2xl" aria-hidden="true" />,
    title: 'Fake News Detector',
    desc: 'Paste any election headline. AI analyzes bias, emotional language, and returns a verdict.',
    color: 'from-red-500 to-rose-600',
    link: '/fakenews',
    badge: 'Gemini AI',
  },
  {
    icon: <FiShield className="text-2xl" aria-hidden="true" />,
    title: 'Eligibility Checker',
    desc: 'Find out if you can vote, what documents you need, and how to register step-by-step.',
    color: 'from-green-500 to-emerald-600',
    link: '/eligibility',
    badge: 'Instant',
  },
  {
    icon: <MdOutlineQuiz className="text-2xl" aria-hidden="true" />,
    title: 'Democracy Quiz',
    desc: 'Test your knowledge with 10 MCQs about Indian democracy. Earn badges and see your rank.',
    color: 'from-yellow-500 to-amber-600',
    link: '/quiz',
    badge: 'Earn Badges',
  },
  {
    icon: <MdTranslate className="text-2xl" aria-hidden="true" />,
    title: 'Multilingual',
    desc: 'Access content in Hindi, Tamil, Telugu, Bengali, Marathi via Google Translate API.',
    color: 'from-indigo-500 to-indigo-600',
    link: '/chat',
    badge: '6 Languages',
  },
];

const stats = [
  { value: '543', label: 'Lok Sabha Seats', suffix: '' },
  { value: '96', label: 'Crore Registered Voters', suffix: 'Cr+' },
  { value: '7', label: 'Election Phases', suffix: '' },
  { value: '18', label: 'Voting Age', suffix: '+' },
];

const steps = [
  'Election Announcement by ECI',
  'Model Code of Conduct kicks in',
  'Candidate Nominations Filed',
  'Voting Day – EVM + VVPAT',
  'Counting & Result Declaration',
  'Government Formation',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* ── Hero ──────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center px-6 py-24"
        aria-labelledby="hero-heading"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow" aria-hidden="true" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow" aria-hidden="true" style={{ animationDelay: '1.5s' }} />

        <div className="relative max-w-5xl mx-auto text-center">


          {/* Heading */}
          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 leading-tight"
          >
            Understand Elections
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400">
              Smarter with AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-blue-200 max-w-3xl mx-auto mb-10"
          >
            Your AI-powered guide to Indian elections — learn voting process, check eligibility,
            detect fake news, and ace democracy quizzes in your language.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/chat"
              className="btn-primary text-base px-8 py-4 shadow-glow-blue"
              aria-label="Start chatting with AI election assistant"
            >
              <FiMessageSquare aria-hidden="true" />
              Start Chatting with AI
            </Link>
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-white/10 border border-white/30 rounded-xl backdrop-blur-sm hover:bg-white/20 hover:border-white/50 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Take the democracy quiz"
            >
              Take Democracy Quiz
              <FiArrowRight aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Quick process steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 flex flex-wrap justify-center gap-2"
            aria-label="Election process steps"
          >
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-xs text-blue-200">
                  {step}
                </span>
                {i < steps.length - 1 && (
                  <FiArrowRight className="text-blue-400 text-xs hidden sm:block" aria-hidden="true" />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────── */}
      <section className="bg-white dark:bg-gray-900 py-14" aria-label="Election statistics">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label, suffix }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-display font-extrabold gradient-text">
                  {value}<span className="text-2xl">{suffix}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-950" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 id="features-heading" className="section-title mb-4">
              Everything You Need to Be an
              <span className="gradient-text"> Informed Voter</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Six powerful AI tools to help every Indian citizen understand and participate in democracy.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map(({ icon, title, desc, color, link, badge }) => (
              <motion.div key={title} variants={itemVariants}>
                <Link
                  to={link}
                  className="card-hover group block p-6 h-full"
                  aria-label={`Go to ${title}`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                  </div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <span className="badge-blue text-xs shrink-0">{badge}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                    Explore <FiArrowRight aria-hidden="true" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* ── CTA ───────────────────────────────── */}
      <section
        className="py-24 px-6 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #1e3a8a, #7c3aed)' }}
        aria-labelledby="cta-heading"
      >
        <div className="max-w-3xl mx-auto">
          <MdHowToVote className="text-6xl mx-auto mb-6 text-blue-300" aria-hidden="true" />
          <h2 id="cta-heading" className="text-4xl font-display font-bold mb-4">
            Your Vote is Your Voice
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            Join millions of informed voters. Start learning about Indian democracy today.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {['First-time voter?', 'Check eligibility', 'Register online', 'Voter Helpline: 1950'].map(s => (
              <div key={s} className="flex items-center gap-2 text-sm text-blue-200">
                <FiCheckCircle className="text-green-400" aria-hidden="true" /> {s}
              </div>
            ))}
          </div>
          <Link
            to="/chat"
            className="btn-saffron px-10 py-4 text-base shadow-glow-saffron"
            aria-label="Ask an AI election question now"
          >
            <FiMic aria-hidden="true" />
            Ask AI Now — It's Free
          </Link>
        </div>
      </section>
    </div>
  );
}

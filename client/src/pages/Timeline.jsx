import { motion } from 'framer-motion';
import {
  FiBell, FiUsers, FiCheckSquare, FiBarChart2,
  FiFlag, FiStar, FiArrowRight
} from 'react-icons/fi';
import { MdHowToVote, MdOutlineGavel, MdBarChart } from 'react-icons/md';

const steps = [
  {
    id: 1,
    icon: <FiBell className="text-2xl" aria-hidden="true" />,
    title: 'Election Announcement',
    subtitle: 'ECI notifies election schedule',
    desc: 'The Election Commission of India (ECI) announces the election schedule, including polling dates and the Model Code of Conduct (MCC) enforcement date.',
    facts: ['MCC comes into force immediately', 'ECI uses Article 324 powers', 'Schedule released weeks in advance'],
    color: 'from-blue-500 to-blue-600',
    duration: '4–6 weeks before polling',
  },
  {
    id: 2,
    icon: <FiUsers className="text-2xl" aria-hidden="true" />,
    title: 'Candidate Nominations',
    subtitle: 'Filing, scrutiny & withdrawal',
    desc: 'Candidates file nomination papers with Returning Officers. Papers are scrutinized for eligibility. Candidates can withdraw within the specified period.',
    facts: ['Security deposit required (₹25,000 for Lok Sabha)', 'Candidates must be 25+ years for Lok Sabha', 'Withdrawal period is 2 days after scrutiny'],
    color: 'from-purple-500 to-purple-600',
    duration: '~14 days',
  },
  {
    id: 3,
    icon: <FiFlag className="text-2xl" aria-hidden="true" />,
    title: 'Election Campaigning',
    subtitle: 'Canvassing under MCC rules',
    desc: 'Political parties and candidates campaign through rallies, advertisements, door-to-door visits. All activities must comply with the Model Code of Conduct.',
    facts: ['Campaign ends 48 hours before polling (Silence period)', 'Expenditure limits enforced', 'Paid news is monitored'],
    color: 'from-orange-500 to-amber-600',
    duration: '2–4 weeks',
  },
  {
    id: 4,
    icon: <MdHowToVote className="text-2xl" aria-hidden="true" />,
    title: 'Voting Day',
    subtitle: 'EVM + VVPAT polling',
    desc: 'Voters cast ballots using Electronic Voting Machines (EVMs). VVPAT (Voter Verifiable Paper Audit Trail) provides a paper slip for verification.',
    facts: ['Polling hours: 7 AM – 6 PM (general)', 'Voters need EPIC card or 12 alternate IDs', 'NOTA option available'],
    color: 'from-green-500 to-emerald-600',
    duration: '1 day (may be multi-phase)',
  },
  {
    id: 5,
    icon: <FiBarChart2 className="text-2xl" aria-hidden="true" />,
    title: 'Vote Counting',
    subtitle: 'EVM tallying by Returning Officer',
    desc: 'Votes are counted at designated counting centers. EVMs are opened in the presence of candidates and their representatives. Results are declared round by round.',
    facts: ['Postal ballots counted first', 'Candidates can ask for recount', 'Results announced by Returning Officer'],
    color: 'from-red-500 to-rose-600',
    duration: 'Counting Day (after polling ends)',
  },
  {
    id: 6,
    icon: <FiStar className="text-2xl" aria-hidden="true" />,
    title: 'Result Declaration',
    subtitle: 'Winners certified by ECI',
    desc: 'The winning candidate receives a certificate of election. The Election Commission declares final results. Winning party/coalition invited to form government.',
    facts: ['Simple majority wins in FPTP system', 'Election petitions can be filed in High Court', 'Results published in official gazette'],
    color: 'from-yellow-500 to-amber-500',
    duration: 'Same day as counting',
  },
  {
    id: 7,
    icon: <MdOutlineGavel className="text-2xl" aria-hidden="true" />,
    title: 'Government Formation',
    subtitle: 'Swearing-in & Cabinet formation',
    desc: 'The President invites the party/coalition with majority to form the government. The Prime Minister and Cabinet are sworn in. New government begins functioning.',
    facts: ['272+ seats needed for Lok Sabha majority', 'President appoints PM on PM\'s advice', 'Cabinet limited to 15% of Lok Sabha strength'],
    color: 'from-indigo-500 to-blue-600',
    duration: '1–2 weeks after results',
  },
];

export default function Timeline() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12" role="main">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="badge-blue mb-4 inline-flex">Election Process</span>
        <h1 className="page-header mb-4">
          Indian Election
          <span className="gradient-text"> Timeline</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          The complete journey of an Indian General Election — from announcement to government formation.
        </p>
      </div>

      {/* Timeline */}
      <ol aria-label="Indian election process steps">
        {steps.map((step, index) => (
          <motion.li
            key={step.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="timeline-step"
          >
            {/* Step dot */}
            <div
              className={`absolute left-0 top-1 w-6 h-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-xs font-bold shadow-lg`}
              aria-hidden="true"
            >
              {step.id}
            </div>

            {/* Card */}
            <motion.div
              whileHover={{ x: 4 }}
              className="card p-6 ml-4"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shrink-0`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                      {step.title}
                    </h2>
                    <span className="badge-blue text-xs">{step.duration}</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{step.subtitle}</p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                {step.desc}
              </p>

              <ul className="space-y-1.5" aria-label={`Key facts for ${step.title}`}>
                {step.facts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FiArrowRight className="text-blue-500 mt-0.5 shrink-0" aria-hidden="true" />
                    {fact}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.li>
        ))}
      </ol>

      {/* Footer note */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <MdBarChart className="text-blue-500 text-xl mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">India uses First Past the Post (FPTP)</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              The candidate with the most votes in a constituency wins, regardless of whether they have more than 50% of votes.
              This is why coalition governments are common in India.
            </p>
            <a
              href="https://eci.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
              aria-label="Learn more at Election Commission of India website (opens in new tab)"
            >
              Learn more at eci.gov.in ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

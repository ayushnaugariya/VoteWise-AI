import { Link } from 'react-router-dom';
import { MdHowToVote } from 'react-icons/md';
import { FiGithub, FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 mt-auto"
    >
      <div className="india-strip" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <MdHowToVote className="text-white" aria-hidden="true" />
              </div>
              <span className="font-display font-bold text-lg text-gray-900 dark:text-white">VoteWise AI</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Smart election education for every Indian voter.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2">
                {[
                  { to: '/chat', label: 'AI Chat Assistant' },
                  { to: '/timeline', label: 'Election Timeline' },
                  { to: '/fakenews', label: 'Fact Checker' },
                  { to: '/eligibility', label: 'Eligibility Checker' },
                  { to: '/quiz', label: 'Democracy Quiz' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Official Resources</h3>
            <ul className="space-y-2">
              {[
                { href: 'https://eci.gov.in', label: 'Election Commission of India' },
                { href: 'https://voters.eci.gov.in', label: 'Voter Registration (NVSP)' },
                { href: 'https://nvsp.in', label: 'National Voters Services Portal' },
                { href: 'https://1950.in', label: 'Voter Helpline 1950' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label={`${label} (opens in new tab)`}
                  >
                    {label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            Made with <FiHeart className="text-red-400" aria-hidden="true" /> for Indian Democracy by{' '}
            <a 
              href="https://www.linkedin.com/in/ayushnaugariya" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-yellow-500 font-bold hover:underline"
            >
              Ayush Naugariya
            </a>
          </p>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} VoteWise AI
          </p>
        </div>
      </div>
    </footer>
  );
}

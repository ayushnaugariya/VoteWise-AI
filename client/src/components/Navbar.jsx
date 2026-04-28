import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { useLang, LANGUAGES } from '../context/LangContext';
import {
  FiSun, FiMoon, FiMenu, FiX, FiUser, FiLogOut,
  FiGlobe, FiChevronDown
} from 'react-icons/fi';
import { MdHowToVote } from 'react-icons/md';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/chat', label: 'AI Chat' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/fakenews', label: 'Fact Check' },
  { to: '/eligibility', label: 'Eligibility' },
  { to: '/voter-wizard', label: 'Register' },
  { to: '/candidate', label: 'Candidates' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/manifesto', label: 'Manifesto' },
  { to: '/constituency', label: 'My Seat' },
  { to: '/analytics', label: 'Pulse' },
];

export default function Navbar() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, logout } = useAuth();
  const { currentLangObj, changeLanguage, LANGUAGES: langs } = useLang();
  const navigate = useNavigate();

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);



  // Navbar shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      role="banner"
      className={`sticky top-0 z-50 relative transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-md shadow-md'
          : 'bg-white dark:bg-gray-950'
      } border-b border-gray-100 dark:border-gray-800`}
    >
      {/* India tricolor strip */}
      <div className="india-strip" aria-hidden="true" />

      {/* Logo — absolutely positioned at the extreme left outside the max-w-7xl container */}
      <Link
        to="/"
        className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 group shrink-0 z-10"
        aria-label="VoteWise AI Home"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-glow-blue group-hover:scale-110 transition-transform">
          <MdHowToVote className="text-white text-xl" aria-hidden="true" />
        </div>
        <span className="font-display font-bold text-xl text-gray-900 dark:text-white whitespace-nowrap">
          Vote<span className="gradient-text">Wise</span>
          <span className="text-xs ml-1 font-normal text-gray-400">AI</span>
        </span>
      </Link>

      {/* Right Controls — absolutely positioned at the extreme right outside the max-w-7xl container */}
      <div className="hidden lg:flex items-center gap-2 absolute right-4 top-1/2 -translate-y-1/2 z-10">
        {/* Custom Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            aria-label="Select language"
            aria-expanded={langOpen}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiGlobe className="text-base" aria-hidden="true" />
            <span>{currentLangObj?.nativeLabel || 'Language'}</span>
            <FiChevronDown className={`text-xs transition-transform ${langOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 card shadow-xl py-1 z-50 animate-fade-in max-h-96 overflow-y-auto">
              {langs.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { 
                    changeLanguage(lang.code); 
                    setLangOpen(false);
                    
                    // Use reliable cookie method for Google Translate
                    document.cookie = `googtrans=/en/${lang.code}; path=/; domain=${window.location.hostname}`;
                    document.cookie = `googtrans=/en/${lang.code}; path=/`;
                    window.location.reload();
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    currentLangObj?.code === lang.code ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDark(!dark)}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {dark ? <FiSun className="text-lg text-yellow-400" /> : <FiMoon className="text-lg" />}
        </button>

        {/* Auth */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User avatar'}
                  className="w-7 h-7 rounded-full ring-2 ring-blue-400"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                  <FiUser className="text-white text-sm" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentUser.displayName?.split(' ')[0] || 'User'}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <FiLogOut className="text-lg" />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary py-2 text-sm">
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Menu Toggle — absolutely positioned at extreme right on mobile */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
      >
        {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
      </button>

      <nav className="max-w-7xl mx-auto px-0" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Spacer — same width as the logo so nav links don't shift left */}
          <div className="shrink-0 w-[148px]" aria-hidden="true" />

          {/* Center: Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Spacer — approximate width of right controls so nav links don't shift right */}
          <div className="hidden lg:block shrink-0 w-[240px]" aria-hidden="true" />
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden py-3 border-t border-gray-100 dark:border-gray-800 animate-slide-up">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 text-sm font-medium rounded-lg mb-1 transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="flex items-center gap-2 px-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setDark(!dark)} aria-label="Toggle dark mode"
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                {dark ? <FiSun className="text-yellow-400" /> : <FiMoon />}
              </button>
              {currentUser ? (
                <button onClick={handleLogout} className="btn-secondary py-2 text-sm flex-1">
                  Sign Out
                </button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-primary py-2 text-sm flex-1 justify-center">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

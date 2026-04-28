import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { MdHowToVote } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, signInWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.state?.from || '/dashboard';
  const message = location.state?.message;

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleGoogle = async () => {
    setLoading(true);
    try { await signInWithGoogle(); navigate(redirect); }
    catch { /* Toast shown in context */ }
    finally { setLoading(false); }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(form.email, form.password);
      } else {
        if (!form.displayName) return;
        await registerWithEmail(form.email, form.password, form.displayName);
      }
      navigate(redirect);
    } catch { /* Toast shown in context */ }
    finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #312e81 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="glass-dark p-8 rounded-2xl shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 justify-center group" aria-label="VoteWise AI Home">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MdHowToVote className="text-white text-2xl" aria-hidden="true" />
              </div>
              <span className="font-display font-bold text-2xl text-white">VoteWise AI</span>
            </Link>
            <p className="text-blue-300 text-sm mt-2">Smart Election Education Platform</p>
          </div>

          {/* Redirect message */}
          {message && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl px-4 py-3 text-yellow-300 text-sm mb-6" role="alert">
              {message}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex bg-white/10 rounded-xl p-1 mb-6" role="tablist" aria-label="Authentication mode">
            {[['login', 'Sign In'], ['register', 'Register']].map(([m, label]) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                role="tab"
                aria-selected={mode === m}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === m ? 'bg-white text-gray-900 shadow' : 'text-blue-200 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl transition-all duration-200 hover:scale-105 mb-4 disabled:opacity-60"
            aria-label="Sign in with Google"
          >
            <FcGoogle className="text-xl" aria-hidden="true" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/20" aria-hidden="true" />
            <span className="text-white/40 text-xs">or</span>
            <div className="flex-1 h-px bg-white/20" aria-hidden="true" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} role="tabpanel" aria-label={mode === 'login' ? 'Sign in form' : 'Register form'}>
            {mode === 'register' && (
              <div className="mb-4">
                <label htmlFor="displayName" className="block text-sm text-blue-200 font-medium mb-1.5">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" aria-hidden="true" />
                  <input
                    id="displayName"
                    type="text"
                    value={form.displayName}
                    onChange={e => update('displayName', e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm text-blue-200 font-medium mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm text-blue-200 font-medium mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 rounded-xl px-4 py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              {!loading && <FiArrowRight aria-hidden="true" />}
            </button>
          </form>

          <p className="text-center text-xs text-blue-300/60 mt-6">
            By continuing, you agree to use this platform for educational purposes only.
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-4">
          <Link to="/" className="text-blue-300 hover:text-white text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

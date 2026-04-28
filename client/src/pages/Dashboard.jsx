import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMessageSquare, FiAward, FiActivity, FiArrowRight,
  FiUser, FiLogOut, FiClock
} from 'react-icons/fi';
import { MdHowToVote, MdOutlineQuiz, MdEmojiEvents } from 'react-icons/md';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

// Sample activity data for chart
const generateActivity = () => Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  chats: Math.floor(Math.random() * 10),
  score: Math.floor(Math.random() * 100),
}));

const BADGE_ICONS = {
  democracy_hero: { icon: '🏆', label: 'Democracy Hero', color: 'from-yellow-400 to-amber-500' },
  election_expert: { icon: '🎓', label: 'Election Expert', color: 'from-blue-500 to-blue-600' },
  first_time_voter: { icon: '🗳️', label: 'First Time Voter', color: 'from-green-500 to-emerald-600' },
};

export default function Dashboard() {
  const { currentUser, userProfile, logout } = useAuth();
  const [stats, setStats] = useState({ totalChats: 0, quizScore: 0, topicsLearned: 0 });
  const [recentChats, setRecentChats] = useState([]);
  const [activityData] = useState(generateActivity());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to user stats from Firestore (Google Service: Firestore)
    const q = query(
      collection(db, 'chat_messages'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsub = onSnapshot(q, (snap) => {
      setRecentChats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setStats(prev => ({ ...prev, totalChats: snap.size }));
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [currentUser]);

  const badge = userProfile?.badge || 'first_time_voter';
  const badgeInfo = BADGE_ICONS[badge] || BADGE_ICONS.first_time_voter;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'User avatar'}
              className="w-16 h-16 rounded-2xl ring-4 ring-blue-500/30 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <FiUser className="text-white text-2xl" aria-hidden="true" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              {currentUser?.displayName?.split(' ')[0] || 'Voter'}'s Dashboard
            </h1>
            <p className="text-gray-500 text-sm">{currentUser?.email}</p>
            <div className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-white text-xs font-semibold bg-gradient-to-r ${badgeInfo.color}`}>
              {badgeInfo.icon} {badgeInfo.label}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
          aria-label="Sign out of account"
        >
          <FiLogOut aria-hidden="true" /> Sign Out
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" role="region" aria-label="User statistics">
        {[
          { icon: <FiMessageSquare className="text-2xl text-blue-500" />, label: 'Total Chats', value: stats.totalChats || userProfile?.totalChats || 0, bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: <MdOutlineQuiz className="text-2xl text-yellow-500" />, label: 'Best Quiz Score', value: `${userProfile?.quizScore || userProfile?.lastQuizScore || 0}%`, bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { icon: <FiActivity className="text-2xl text-green-500" />, label: 'Topics Explored', value: Math.max(stats.totalChats, 3), bg: 'bg-green-50 dark:bg-green-900/20' },
        ].map(({ icon, label, value, bg }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
            role="article"
          >
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`} aria-hidden="true">
              {icon}
            </div>
            <p className="text-3xl font-extrabold font-display text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Activity Chart */}
      <div className="card p-6 mb-8" role="region" aria-label="Weekly activity chart">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <FiActivity className="text-blue-500" aria-hidden="true" /> Weekly Activity
        </h2>
        <div className="h-48" aria-label="Area chart showing weekly chats and scores">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="chatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="chats"
                stroke="#3b82f6"
                fill="url(#chatGrad)"
                strokeWidth={2}
                name="Chats"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Badges */}
        <div className="card p-6" role="region" aria-label="Earned badges">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MdEmojiEvents className="text-yellow-500" aria-hidden="true" /> Badges Earned
          </h2>
          <div className="space-y-3">
            {Object.entries(BADGE_ICONS).map(([key, { icon, label, color }]) => {
              const earned = badge === key || (badge === 'democracy_hero') || (badge === 'election_expert' && key !== 'democracy_hero');
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${earned ? 'opacity-100' : 'opacity-30 grayscale'}`}
                  aria-label={`${label} badge: ${earned ? 'earned' : 'not yet earned'}`}
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{label}</p>
                    <p className="text-xs text-gray-400">{earned ? 'Earned ✓' : 'Keep learning!'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6" role="region" aria-label="Quick actions">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiArrowRight className="text-blue-500" aria-hidden="true" /> Continue Learning
          </h2>
          <div className="space-y-3">
            {[
              { to: '/chat', icon: <FiMessageSquare className="text-blue-500" />, label: 'Ask AI a Question', desc: 'Continue your election learning journey' },
              { to: '/quiz', icon: <MdOutlineQuiz className="text-yellow-500" />, label: 'Retake Quiz', desc: 'Improve your democracy knowledge score' },
              { to: '/timeline', icon: <FiClock className="text-purple-500" />, label: 'Election Timeline', desc: 'Review the election process steps' },
              { to: '/fakenews', icon: <MdHowToVote className="text-red-500" />, label: 'Fact Check News', desc: 'Verify election news with AI' },
            ].map(({ to, icon, label, desc }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                aria-label={label}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{label}</p>
                  <p className="text-xs text-gray-400 truncate">{desc}</p>
                </div>
                <FiArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

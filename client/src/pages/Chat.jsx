import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSend, FiTrash2, FiClock, FiPlus, FiUser,
  FiVolume2, FiVolumeX
} from 'react-icons/fi';
import { MdHowToVote } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { db } from '../firebase/config';
import {
  collection, addDoc, query, where, orderBy,
  onSnapshot, serverTimestamp
} from 'firebase/firestore';
import api from '../utils/api';
import VoiceButton from '../components/VoiceButton';
import { useTTS } from '../hooks/useTTS';
import toast from 'react-hot-toast';

// Suggested prompts for quick start
const SUGGESTIONS = [
  'How do I register to vote in India?',
  'What is NOTA and how does it work?',
  'Explain the Lok Sabha election process',
  'Difference between MP and MLA?',
  'What is Model Code of Conduct?',
  'How does EVM voting work?',
];

// Format markdown-style bold/italic text
const formatText = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
};

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
        <MdHowToVote className="text-white text-sm" aria-hidden="true" />
      </div>
      <div className="chat-bubble-ai px-5 py-4">
        <div className="flex items-center gap-1" aria-label="AI is typing">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: '🗳️ **Jai Hind!** I\'m VoteWise AI, your guide to Indian elections.\n\nI can help you understand:\n- Voter registration and eligibility\n- Election process and timelines\n- NOTA, EVM, VVPAT explained simply\n- Lok Sabha vs Rajya Sabha\n- And much more!\n\nWhat would you like to know?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const { currentUser } = useAuth();
  const { currentLang } = useLang();
  const { speak, stop, speaking, supported: ttsSupported } = useTTS();

  const ttsLang = currentLang === 'hi' ? 'hi-IN' : currentLang === 'ta' ? 'ta-IN' : currentLang === 'te' ? 'te-IN' : currentLang === 'bn' ? 'bn-IN' : 'en-IN';

  const handleSpeak = (msg) => {
    if (speaking && speakingId === msg.id) {
      stop();
      setSpeakingId(null);
    } else {
      setSpeakingId(msg.id);
      speak(msg.content, ttsLang);
      setTimeout(() => setSpeakingId(null), 30000); // reset after max 30s
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load chat sessions from Firestore for logged-in users
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'chat_sessions'),
      where('userId', '==', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [currentUser]);

  /** Save message to Firestore */
  const saveToFirestore = useCallback(async (sessionId, message) => {
    if (!currentUser || !sessionId) return;
    try {
      await addDoc(collection(db, 'chat_messages'), {
        sessionId,
        userId: currentUser.uid,
        ...message,
        timestamp: serverTimestamp(),
      });
      // Update session metadata
      await addDoc(collection(db, 'chat_sessions'), {
        id: sessionId,
        userId: currentUser.uid,
        preview: message.content.substring(0, 60) + '...',
        updatedAt: serverTimestamp(),
      });
    } catch { /* Graceful fail */ }
  }, [currentUser]);

  /** Start new chat session */
  const startNewSession = () => {
    setMessages([{
      id: 'welcome-new',
      role: 'assistant',
      content: '🗳️ New chat started! What would you like to know about Indian elections?',
      timestamp: new Date().toISOString(),
    }]);
    setCurrentSessionId(Date.now().toString());
    inputRef.current?.focus();
  };

  /** Send message to Gemini via backend */
  const sendMessage = useCallback(async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;

    const sessionId = currentSessionId || Date.now().toString();
    if (!currentSessionId) setCurrentSessionId(sessionId);

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Save user message to Firestore
    await saveToFirestore(sessionId, userMsg);

    // Log to analytics (BigQuery)
    api.post('/analytics/log', { message: userMessage, userId: currentUser?.uid || 'anon' }).catch(() => {});

    try {
      const history = messages
        .filter(m => m.role !== 'assistant' || m.id !== 'welcome')
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const { data } = await api.post('/chat', {
        message: userMessage,
        history,
        lang: currentLang,
      });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        source: data.source,
        timestamp: data.timestamp,
      };

      setMessages(prev => [...prev, aiMsg]);
      await saveToFirestore(sessionId, aiMsg);
    } catch (err) {
      const backendError = err.response?.data?.details || err.response?.data?.error || err.message;
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ ${backendError || 'Failed to get response. Please check your API key and try again.'}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errMsg]);
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, currentSessionId, currentLang, saveToFirestore]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex" role="main">
      {/* ── Sidebar ─────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800"
        aria-label="Chat history sidebar"
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={startNewSession}
            className="btn-primary w-full justify-center py-2.5 text-sm"
            aria-label="Start new chat session"
          >
            <FiPlus aria-hidden="true" /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3" aria-label="Previous chat sessions">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold px-2 mb-2">Recent Chats</p>
          {!currentUser ? (
            <div className="px-2 py-4 text-center">
              <p className="text-xs text-gray-400 mb-2">Sign in to save your chat history permanently</p>
              <Link to="/login" className="text-xs font-semibold text-blue-600 hover:underline">Sign In Now →</Link>
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-gray-400 px-2 py-4 text-center">No previous chats yet</p>
          ) : (
            sessions.map(session => (
              <button
                key={session.id}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-1 truncate"
                aria-label={`Load chat: ${session.preview}`}
              >
                <FiClock className="inline mr-2 text-gray-400" aria-hidden="true" />
                {session.preview}
              </button>
            ))
          )}
        </div>

        {/* Suggested prompts in sidebar */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2 px-1">Quick Questions</p>
          {SUGGESTIONS.slice(0, 3).map(s => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              disabled={loading}
              className="w-full text-left text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 py-1.5 px-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors truncate"
              aria-label={`Ask: ${s}`}
            >
              {s}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main Chat ───────────────────────── */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <MdHowToVote className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">VoteWise AI</h1>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" aria-hidden="true" />
                Online · AI Engine
              </p>
            </div>
          </div>
          <button
            onClick={() => setMessages([{ id: 'reset', role: 'assistant', content: '🗳️ Chat cleared! Ask me anything about Indian elections.', timestamp: new Date().toISOString() }])}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            aria-label="Clear chat messages"
          >
            <FiTrash2 aria-hidden="true" />
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4"
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
        >
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-br from-blue-600 to-purple-600'
                }`} aria-hidden="true">
                  {msg.role === 'user'
                    ? <FiUser className="text-white text-sm" />
                    : <MdHowToVote className="text-white text-sm" />
                  }
                </div>

                {/* Bubble + TTS button */}
                <div className={`flex items-end gap-1.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={msg.role === 'user' ? 'chat-bubble-user' : `chat-bubble-ai ${msg.isError ? 'border-red-200 dark:border-red-800' : ''}`}
                    dangerouslySetInnerHTML={{ __html: formatText(msg.content) }}
                  />
                  {msg.role === 'assistant' && ttsSupported && (
                    <button
                      onClick={() => handleSpeak(msg)}
                      className={`p-1.5 rounded-lg shrink-0 transition-all ${
                        speakingId === msg.id
                          ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/40'
                          : 'text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                      aria-label={speakingId === msg.id ? 'Stop speaking' : 'Listen to this response'}
                      title={speakingId === msg.id ? 'Stop' : 'Listen'}
                    >
                      {speakingId === msg.id
                        ? <FiVolumeX className="text-sm" aria-hidden="true" />
                        : <FiVolume2 className="text-sm" aria-hidden="true" />
                      }
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && <TypingIndicator />}
          <div ref={endRef} />
        </div>

        {/* Guest alert and Suggestions chips */}
        {!currentUser && messages.length > 1 && (
          <div className="px-4 md:px-8 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] text-center border-y border-blue-100 dark:border-blue-900/30">
            👋 You are chatting as a guest. <Link to="/login" className="font-bold underline">Login</Link> to save this conversation for later.
          </div>
        )}

        {messages.length <= 2 && (
          <div className="px-4 md:px-8 pb-3 flex flex-wrap gap-2" role="list" aria-label="Suggested questions">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                role="listitem"
                disabled={loading}
                className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-105"
                aria-label={`Ask: ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 md:px-8 py-4">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <VoiceButton
              onResult={(text) => setInput(prev => prev + text)}
              lang={currentLang === 'hi' ? 'hi-IN' : currentLang === 'ta' ? 'ta-IN' : 'en-IN'}
              disabled={loading}
            />
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Indian elections... (Enter to send, Shift+Enter for new line)"
                disabled={loading}
                rows={1}
                aria-label="Type your election question"
                className="input-field resize-none min-h-[52px] max-h-32 pr-12 py-3.5 leading-relaxed"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className={`p-3.5 rounded-xl font-medium transition-all duration-200 shrink-0 ${
                input.trim() && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-glow-blue hover:scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FiSend aria-hidden="true" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            AI-powered for democracy · Always verify important info at{' '}
            <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              eci.gov.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

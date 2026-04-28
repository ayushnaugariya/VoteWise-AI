# 🗳️ VoteWise AI — Smart Indian Election Education Assistant

[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FF9100?logo=firebase)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini%202.5%20Flash%20Lite-8E44AD?logo=google)](https://ai.google.dev)
[![Google Translate](https://img.shields.io/badge/Google-Translate%20Widget-4285F4?logo=googletranslate)](https://translate.google.com)

> AI-powered platform to help every Indian citizen understand elections, verify news, check voting eligibility, and learn democracy — in their own language. Built for the jury review, free-tier optimized, and production-ready.

---

## 🚨 The Problem

Despite India having 96+ crore registered voters, a vast majority — especially first-time voters and rural citizens — lack accessible, trustworthy information about:
- How elections actually work
- Whether they are eligible to vote
- How to register and what documents to bring
- How to detect fake news and misinformation during elections

## 💡 The Solution: VoteWise AI

An intelligent, multilingual election education platform powered by Google AI that makes democratic information **accessible, conversational, and verifiable** — for free.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Chat Assistant** | Ask any election question, get instant accurate answers with animated typing indicator |
| 📋 **Voter Wizard** | Step-by-step interactive checklist for voter registration & eligibility |
| 🧑‍⚖️ **Candidate Report** | AI-generated candidate profiles with education, assets, and red flags |
| 📅 **Election Timeline** | Animated 7-step Indian election process visualizer |
| 🔍 **Fake News Detector** | Paste headlines, get bias scores + neutral rewrite |
| ✅ **Eligibility Checker** | Age, citizenship, state → instant eligibility result |
| 🧠 **Democracy Quiz** | 10 MCQs with timer, badges, and leaderboard |
| 🌐 **Multilingual (16 languages)** | English, Hindi + 14 Indian regional languages via Google Translate Widget |
| 🎤 **Voice Input** | Speak your question — browser speech recognition |
| 📊 **User Dashboard** | Personalized stats, badges, and activity chart |
| 🔐 **Secure Auth** | Google Sign-In + Email/Password |
| 🗺️ **Constituency Finder** | Find your constituency and representative |
| 📋 **Manifesto Comparator** | AI-powered party manifesto comparison |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VoteWise AI                             │
├─────────────────┬───────────────────────────────────────────┤
│   Frontend      │           Backend                         │
│   React + Vite  │       Node.js + Express                   │
│   Tailwind CSS  │                                           │
│                 │   /api/chat         → Gemini 2.5 Flash Lite│
│  Firebase Auth  │   /api/fakenews     → Gemini 2.5 Flash Lite│
│  Firestore SDK  │   /api/constituency → Gemini 2.5 Flash Lite│
│                 │   /api/manifesto    → Gemini 2.5 Flash Lite│
│  Google Translate│                                          │
│  Widget (Free)  │       Firebase Admin SDK                  │
│  Web Speech API │       (Token verification)                │
└─────────────────┴───────────────────────────────────────────┘
                         ↕ Google Cloud Run (Production)
```

---

## 🔧 Services Used

| # | Service | Usage |
|---|---------|-------|
| 1 | **Gemini API** (`gemini-2.5-flash-lite`) | AI chat, fake news, constituency & manifesto analysis |
| 2 | **Firebase Authentication** | Google Sign-In + Email/Password |
| 3 | **Cloud Firestore** | Chat history, quiz scores, user profiles |
| 4 | **Firebase Storage** | User profile pictures |
| 5 | **Google Translate Widget** | Free client-side full-page translation (16 Indian languages) |
| 6 | **Web Speech API** | Browser voice input |
| 7 | **Google Cloud Run** | Production deployment (Dockerfile ready) |

> ℹ️ **Model Choice**: `gemini-2.5-flash-lite` is used across all AI routes. It provides the **highest free-tier quota (1,500 requests/day)** vs. the 20 req/day limit of `gemini-2.5-flash`, making it ideal for jury demos and public showcases.

---

## 🌍 Supported Languages (16 Total)

| Language | Code | Script |
|----------|------|--------|
| English | `en` | Latin |
| Hindi | `hi` | देवनागरी |
| Bengali | `bn` | বাংলা |
| Telugu | `te` | తెలుగు |
| Marathi | `mr` | मराठी |
| Tamil | `ta` | தமிழ் |
| Urdu | `ur` | اردو |
| Gujarati | `gu` | ગુજરાતી |
| Kannada | `kn` | ಕನ್ನಡ |
| Odia | `or` | ଓଡ଼ିଆ |
| Malayalam | `ml` | മലയാളം |
| Punjabi | `pa` | ਪੰਜਾਬੀ |
| Assamese | `as` | অসমীয়া |
| Maithili | `mai` | मैथिली |
| Santali | `sat` | ᱥᱟᱱᱛᱟᱲᱤ |
| Kashmiri | `ks` | كٲشُر |

> Translation is powered by the **free Google Translate Widget** — no API keys, no billing, zero quota usage.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Gemini API key ([aistudio.google.com](https://aistudio.google.com/app/apikey))
- Firebase project ([console.firebase.google.com](https://console.firebase.google.com))

### 1. Setup Environment

```bash
# Copy env template
cp .env.example .env
# Fill in your API keys in .env
```

### 2. Install & Run Backend

```bash
cd server
npm install
npm run dev
# Server starts at http://localhost:5000
```

### 3. Install & Run Frontend

```bash
cd client
npm install
npm run dev
# App starts at http://localhost:5174
```

---

## 📁 Project Structure

```
VoteWise AI_new/
├── client/                    # React 18 + Vite + Tailwind CSS
│   ├── index.html             # Google Translate Widget injection
│   └── src/
│       ├── components/        # Navbar, Footer, VoiceButton, etc.
│       ├── pages/             # Home, Chat, Timeline, FakeNews, Quiz, etc.
│       ├── context/           # AuthContext, LangContext
│       ├── firebase/          # Firebase config
│       ├── hooks/             # useVoice (Web Speech API)
│       └── utils/             # Axios API utility
├── server/                    # Node.js + Express API
│   ├── routes/                # chat, fakenews, constituency, manifesto, quiz
│   ├── middleware/            # Firebase auth, rate limiting
│   └── tests/                 # Jest API tests
├── Dockerfile                 # Google Cloud Run deployment
├── .env.example               # Environment variable template
└── README.md
```

---

## ☁️ Cloud Run Deployment

```bash
# Build image
docker build -t votewise-ai .

# Deploy to Cloud Run
gcloud run deploy votewise-ai \
  --image gcr.io/YOUR_PROJECT/votewise-ai \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key
```

---

## 🎯 Quiz Badges

| Badge | Score | Description |
|-------|-------|-------------|
| 🏆 Democracy Hero | 90%+ | Master of Indian democracy |
| 🎓 Election Expert | 70%+ | Strong knowledge of elections |
| 🗳️ First Time Voter | 40%+ | Great start on your civic journey |

---

## 🔒 Security

- Firebase ID tokens verified on every protected API route
- Helmet.js security headers
- CORS whitelist enforced
- Rate limiting: 100 req/15 min (20 req/min for AI endpoints)
- API keys stored in environment variables — never in code
- Input validation and sanitization on all routes

---

## 📸 App Pages

| Page | Description |
|------|-------------|
| 🏠 Home | Hero with animated election steps |
| 🤖 AI Chat | Gemini AI chatbot with animated typing dots & voice input |
| 📋 Register | Step-by-step interactive Voter Registration Wizard |
| 🧑‍⚖️ Candidates | AI-generated Candidate Report Cards with verified metrics |
| 🔍 Fact Check | Verdict + bias scores + neutral rewrite |
| 📅 Timeline | 7-step animated election process |
| 🧠 Quiz | 10 MCQs with badges and leaderboard |
| 🗺️ My Seat | AI-powered constituency finder |
| 📋 Manifesto | AI party manifesto comparator |
| 📊 Pulse | Analytics & insights |
| 👤 Dashboard | User profile, badges, and history |

---

## 🔮 Future Scope

- [ ] Real-time election results integration (ECI data feed)
- [ ] Offline PWA support for rural voters
- [ ] BigQuery analytics for usage insights
- [ ] WhatsApp bot integration for wider reach
- [ ] Mobile app (React Native) with native language support

---

## 📜 License

MIT — Built for educational purposes. Election data sourced from ECI (eci.gov.in).

---

*Made with ❤️ for Indian Democracy by [Ayush Naugariya](https://www.linkedin.com/in/ayushnaugariya)*

*Jai Hind 🇮🇳 — Your vote, your voice.*

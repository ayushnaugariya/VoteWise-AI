import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSkeleton from './components/LoadingSkeleton';

// Lazy-loaded pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Chat = lazy(() => import('./pages/Chat'));
const Timeline = lazy(() => import('./pages/Timeline'));
const FakeNews = lazy(() => import('./pages/FakeNews'));
const Eligibility = lazy(() => import('./pages/Eligibility'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Manifesto = lazy(() => import('./pages/Manifesto'));
const Constituency = lazy(() => import('./pages/Constituency'));
const Analytics = lazy(() => import('./pages/Analytics'));
const VoterWizard = lazy(() => import('./pages/VoterWizard'));
const CandidateReport = lazy(() => import('./pages/CandidateReport'));

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <Navbar />
        <main className="flex-1" role="main">
          <Suspense fallback={<LoadingSkeleton />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/fakenews" element={<FakeNews />} />
              <Route path="/eligibility" element={<Eligibility />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/manifesto" element={<Manifesto />} />
              <Route path="/constituency" element={<Constituency />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/voter-wizard" element={<VoterWizard />} />
              <Route path="/candidate" element={<CandidateReport />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontFamily: 'Inter, sans-serif', borderRadius: '12px' },
            success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;

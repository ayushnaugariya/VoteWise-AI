import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from './LoadingSkeleton';

/**
 * ProtectedRoute
 * Redirects unauthenticated users to /login
 * Preserves the intended URL via location state
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSkeleton />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname, message: 'Please sign in to access your dashboard' }}
        replace
      />
    );
  }

  return children;
}

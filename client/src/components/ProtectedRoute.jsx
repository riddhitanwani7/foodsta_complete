import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, userType, loading } = useAuth();

  if (loading) return <Loader />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole && userType !== requiredRole) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

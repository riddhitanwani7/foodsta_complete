import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReelFeed from './pages/ReelFeed';
import ReelViewer from './pages/ReelViewer';
import SavedPage from './pages/SavedPage';
import CreateFood from './pages/CreateFood';
import FoodPartnerProfile from './pages/FoodPartnerProfile';
import DiscoverPage from './pages/DiscoverPage';
import ProfilePage from './pages/ProfilePage';
import './styles/index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <ReelFeed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reel"
            element={
              <ProtectedRoute>
                <ReelViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute requiredRole="User">
                <SavedPage />
              </ProtectedRoute>
            }
          />
          <Route
  path="/profile"
  element={
    <ProtectedRoute requiredRole="User">
      <ProfilePage />
    </ProtectedRoute>
  }
/>
          <Route path="/discover" element={<DiscoverPage />} />
          <Route
            path="/create-food"
            element={
              <ProtectedRoute requiredRole="FoodPartner">
                <CreateFood />
              </ProtectedRoute>
            }
          />
          <Route path="/food-partner/:id" element={<FoodPartnerProfile />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

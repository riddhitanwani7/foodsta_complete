import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
const navItems = [
  { path: '/app', icon: 'play_circle', label: 'Feed', filled: true },
  { path: '/discover', icon: 'explore', label: 'Discover' },
  { path: '/saved', icon: 'bookmark', label: 'Saved', userOnly: true },
  { path: '/create-food', icon: 'add_circle', label: 'Upload', partnerOnly: true },
  { path: '/profile', icon: 'person', label: 'Profile' },
  { path: '__logout__', icon: 'logout', label: 'Logout' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, user , logout } = useAuth();

  const filteredItems = navItems.filter(item => {
    if (item.userOnly && userType !== 'User') return false;
    if (item.partnerOnly && userType !== 'FoodPartner') return false;
    return true;
  });

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch (_) {
      // silent — we log out locally regardless
    }
    logout();
    navigate('/login');
  };

  const handleNav = (path) => {
    if (path === '/profile') {
  if (userType === 'FoodPartner' && user?._id) {
    navigate(`/food-partner/${user._id}`);
  } else {
    navigate('/profile');
  }
  return;

    }
    if (path === '__logout__') {
      handleLogout();
      return;
    }
    navigate(path);
  };

  return (
    <nav className="bottom-nav">
      {filteredItems.map((item) => {
        const isActive = location.pathname === item.path ||
          (item.path === '/profile' && location.pathname.startsWith('/food-partner'));
        return (
          <button
            key={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleNav(item.path)}
          >
            <div style={{ position: 'relative' }}>
              {isActive && <div className="nav-glow" />}
              <span
                className={`icon ${isActive && item.filled ? 'icon-filled' : ''}`}
                style={{ fontSize: 24, color: isActive ? 'var(--accent-pink)' : undefined }}
              >
                {item.icon}
              </span>
            </div>
            <span className="nav-label" style={{ color: isActive ? 'var(--accent-pink)' : undefined }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

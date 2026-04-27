import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSavedFoods } from '../services/api';
import BottomNav from '../components/BottomNav';
import api from '../services/api';

export default function ProfilePage() {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const [savedCount, setSavedCount] = useState(null);

  useEffect(() => {
    getSavedFoods()
      .then(({ data }) => setSavedCount(data.foods?.length ?? 0))
      .catch(() => setSavedCount(0));
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch (_) {}
    logout();
    navigate('/login');
  };

  const initial = user?.fullName?.[0]?.toUpperCase() || '?';

  return (
    <div className="page-scroll">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">{initial}</div>
        <h2>{user?.fullName || 'User'}</h2>
        <p>{user?.email}</p>
        <div style={{ marginTop: 8 }}>
          <span className="pill-badge">🍽️ Food Lover</span>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <div className="stat-num">{savedCount ?? '—'}</div>
            <div className="stat-label">Saved</div>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div style={{ padding: '0 16px' }}>
        <h3 className="font-headline" style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 12 }}>
          Your Activity
        </h3>

        {/* Saved Reels card */}
        <button
          onClick={() => navigate('/saved')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 18px', marginBottom: 10,
            background: 'var(--bg-glass)', border: '1px solid var(--outline-variant)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer',
            backdropFilter: 'blur(16px)', transition: 'background var(--transition-normal)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-high)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-glass)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="icon" style={{ color: 'var(--accent-cyan)', fontSize: 22 }}>bookmark</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Saved Reels</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {savedCount === null ? 'Loading...' : `${savedCount} saved`}
              </div>
            </div>
          </div>
          <span className="icon icon-sm" style={{ color: 'var(--text-muted)' }}>chevron_right</span>
        </button>

        {/* Discover card */}
        <button
          onClick={() => navigate('/discover')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 18px', marginBottom: 10,
            background: 'var(--bg-glass)', border: '1px solid var(--outline-variant)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer',
            backdropFilter: 'blur(16px)', transition: 'background var(--transition-normal)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-high)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-glass)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="icon" style={{ color: 'var(--accent-pink)', fontSize: 22 }}>explore</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Discover Food</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Browse all reels</div>
            </div>
          </div>
          <span className="icon icon-sm" style={{ color: 'var(--text-muted)' }}>chevron_right</span>
        </button>
      </div>

      {/* Account Section */}
      <div style={{ padding: '20px 16px 0' }}>
        <h3 className="font-headline" style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 12 }}>
          Account
        </h3>

        {/* Account info card */}
        <div style={{
          padding: '16px 18px', marginBottom: 10,
          background: 'var(--bg-glass)', border: '1px solid var(--outline-variant)',
          borderRadius: 'var(--radius-md)', backdropFilter: 'blur(16px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span className="icon" style={{ color: 'var(--text-muted)', fontSize: 20 }}>person</span>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Full Name</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user?.fullName}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="icon" style={{ color: 'var(--text-muted)', fontSize: 20 }}>mail</span>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 18px', marginBottom: 10,
            background: 'rgba(255, 75, 137, 0.08)', border: '1px solid rgba(255, 75, 137, 0.25)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer',
            color: 'var(--accent-pink-hot)', fontSize: '0.9rem', fontWeight: 600,
            fontFamily: 'inherit', transition: 'background var(--transition-normal)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,75,137,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,75,137,0.08)'}
        >
          <span className="icon icon-sm">logout</span>
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
import { useState } from 'react';
import { toggleLike, toggleSave } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ActionBar({ food, onUpdate }) {
  const { isAuthenticated, userType } = useAuth();
  const [animating, setAnimating] = useState(null);

  const handleLike = async () => {
    if (!isAuthenticated || userType !== 'User') return;
    setAnimating('like');
    try {
      const { data } = await toggleLike(food._id);
      // ALWAYS use backend response for counts
      onUpdate({ ...food, isLiked: data.liked, likeCount: data.likeCount });
    } catch (err) {
      console.error('Like error:', err);
    }
    setTimeout(() => setAnimating(null), 400);
  };

  const handleSave = async () => {
    if (!isAuthenticated || userType !== 'User') return;
    setAnimating('save');
    try {
      const { data } = await toggleSave(food._id);
      // ALWAYS use backend response for counts
      onUpdate({ ...food, isSaved: data.saved, savesCount: data.savesCount });
    } catch (err) {
      console.error('Save error:', err);
    }
    setTimeout(() => setAnimating(null), 400);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: food.name, text: food.description, url: window.location.href });
      } catch {}
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Like */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <button
          className={`action-circle ${food.isLiked ? 'active-like' : ''} ${animating === 'like' ? 'animate-pulse' : ''}`}
          onClick={handleLike}
        >
          <span
            className={`icon ${food.isLiked ? 'icon-filled' : ''}`}
            style={{ color: food.isLiked ? 'var(--accent-pink-hot)' : 'var(--text-primary)', fontSize: 26 }}
          >
            favorite
          </span>
        </button>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          {food.likeCount || 0}
        </span>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <button
          className={`action-circle ${food.isSaved ? 'active-save' : ''} ${animating === 'save' ? 'animate-pulse' : ''}`}
          onClick={handleSave}
        >
          <span
            className={`icon ${food.isSaved ? 'icon-filled' : ''}`}
            style={{ color: food.isSaved ? 'var(--accent-cyan)' : 'var(--text-primary)', fontSize: 26 }}
          >
            bookmark
          </span>
        </button>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          {food.savesCount || 0}
        </span>
      </div>

      {/* Share */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <button className="action-circle" onClick={handleShare}>
          <span className="icon" style={{ fontSize: 26 }}>share</span>
        </button>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          Share
        </span>
      </div>
    </div>
  );
}

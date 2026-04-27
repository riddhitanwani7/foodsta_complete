import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPartnerFoods, deleteFood } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';
import Loader from '../components/Loader';


export default function FoodPartnerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userType } = useAuth();

  const [foods, setFoods] = useState([]);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null); // id of reel pending delete
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // Is the logged-in user the owner of this profile?
  const isOwner = userType === 'FoodPartner' && user?._id === id;

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getPartnerFoods(id);
        setFoods(data.foods || []);
        if (data.foods && data.foods.length > 0) {
          setPartner(data.foods[0].foodPartner);
        }
      } catch (err) {
        setError('Could not load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDeleteConfirm = async () => {
    if (!confirmId) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteFood(confirmId);
      setFoods((prev) => prev.filter((f) => f._id !== confirmId));
      setDeleteSuccess('Reel deleted successfully.');
      setTimeout(() => setDeleteSuccess(''), 3000);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete reel.');
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  if (loading) return <Loader />;

  const partnerInitial = partner?.name?.[0]?.toUpperCase() || '?';
  const totalLikes = foods.reduce((sum, f) => sum + (f.likeCount || 0), 0);

  return (
    <div className="page-scroll">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 50,
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--bg-glass)', border: '1px solid var(--outline-variant)',
          backdropFilter: 'blur(16px)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span className="icon icon-sm" style={{ color: 'var(--text-primary)' }}>arrow_back</span>
      </button>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">{partnerInitial}</div>
        <h2>{partner?.name || 'Food Partner'}</h2>
        {partner?.address && (
          <p style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
            <span className="icon icon-sm">location_on</span>
            {partner.address}
          </p>
        )}
        {partner?.phone && (
          <p style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginTop: 4 }}>
            <span className="icon icon-sm">phone</span>
            {partner.phone}
          </p>
        )}
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="stat-num">{foods.length}</div>
            <div className="stat-label">Reels</div>
          </div>
          <div className="profile-stat">
            <div className="stat-num">{totalLikes}</div>
            <div className="stat-label">Likes</div>
          </div>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div style={{ margin: '0 16px 12px', padding: 12, background: 'rgba(147,0,10,0.15)', borderRadius: 8, color: 'var(--error)', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}
      {deleteSuccess && (
        <div style={{ margin: '0 16px 12px', padding: 12, background: 'rgba(0,219,233,0.1)', border: '1px solid rgba(0,219,233,0.25)', borderRadius: 8, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
          {deleteSuccess}
        </div>
      )}
      {deleteError && (
        <div style={{ margin: '0 16px 12px', padding: 12, background: 'rgba(147,0,10,0.15)', borderRadius: 8, color: 'var(--error)', fontSize: '0.85rem' }}>
          {deleteError}
        </div>
      )}

      <div style={{ padding: '0 16px 8px' }}>
        <h3 className="font-headline" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Food Reels
        </h3>
      </div>

      {/* Grid with delete overlay */}
      {foods.length === 0 ? (
        <div className="empty-state">
          <span className="icon" style={{ fontSize: 64 }}>restaurant</span>
          <h3>No reels uploaded yet</h3>
          <p>Discover amazing food by exploring the feed</p>
        </div>
      ) : (
        <div className="food-grid">
          {foods.map((food, index) => (
            <div
              key={food._id}
              className="food-grid-item"
              onClick={() => navigate('/reel', { state: { videos: foods, startIndex: index } })}
            >
              <video src={food.video} muted preload="metadata" playsInline />
              <div className="grid-overlay">
                <h4>{food.name}</h4>
                <span>{food.foodPartner?.name || ''}</span>
              </div>

              {/* Delete button — only for owner */}
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // don't open the reel
                    setConfirmId(food._id);
                    setDeleteError('');
                  }}
                  style={{
                    position: 'absolute', top: 8, right: 8, zIndex: 10,
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,75,137,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', backdropFilter: 'blur(8px)',
                  }}
                >
                  <span className="icon" style={{ fontSize: 16, color: 'var(--accent-pink-hot)' }}>delete</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmId && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setConfirmId(null)} // close on backdrop click
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-glass-strong)', border: '1px solid var(--outline-variant)',
              borderRadius: 'var(--radius-xl)', padding: 28, maxWidth: 340, width: '100%',
              backdropFilter: 'blur(32px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span className="icon icon-lg" style={{ color: 'var(--accent-pink-hot)' }}>delete_forever</span>
              <h3 className="font-headline" style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Delete Reel?
              </h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24, lineHeight: 1.5 }}>
              This will permanently remove the reel and all associated likes and saves. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-glass"
                style={{ flex: 1 }}
                onClick={() => setConfirmId(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                style={{
                  flex: 1, padding: '14px 20px', borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #ff4b89, #bb0058)',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                  border: 'none', cursor: deleting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? (
                  <div className="loader-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                ) : (
                  <>
                    <span className="icon" style={{ fontSize: 18 }}>delete</span>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
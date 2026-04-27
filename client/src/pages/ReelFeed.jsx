import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeed } from '../services/api';
import ActionBar from '../components/ActionBar';
import BottomNav from '../components/BottomNav';
import Loader from '../components/Loader';

export default function ReelFeed() {
  const [foods, setFoods] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const navigate = useNavigate();

  const loadFeed = useCallback(async (pageNum) => {
    try {
      const { data } = await getFeed(pageNum, 10);
      if (pageNum === 1) {
        setFoods(data.foods);
      } else {
        setFoods(prev => [...prev, ...data.foods]);
      }
      setHasMore(pageNum < data.totalPages);
    } catch (err) {
      console.error('Feed error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFeed(1); }, [loadFeed]);

  // Intersection Observer for autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            const idx = parseInt(video.dataset.index);
            if (!isNaN(idx)) setCurrentIndex(idx);
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [foods]);

  // Infinite scroll
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 500) {
      setPage(prev => {
        const next = prev + 1;
        loadFeed(next);
        return next;
      });
    }
  };

  const handleFoodUpdate = (updatedFood) => {
    setFoods(prev => prev.map(f => f._id === updatedFood._id ? updatedFood : f));
  };

  if (loading) return <Loader />;

  if (foods.length === 0) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="empty-state" style={{ flex: 1 }}>
          <span className="icon" style={{ fontSize: 72 }}>video_library</span>
          <h3 className="font-headline">No Reels Yet</h3>
          <p>Food partners haven't uploaded any reels yet. Check back soon!</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <>
      <div className="reel-container" ref={containerRef} onScroll={handleScroll}>
        {foods.map((food, index) => (
          <div className="reel-slide" key={food._id}>
            {/* Video */}
            <video
              ref={el => videoRefs.current[index] = el}
              data-index={index}
              src={food.video}
              loop
              muted
              playsInline
              preload={index < 3 ? 'auto' : 'metadata'}
            />

            {/* Bottom gradient */}
            <div className="gradient-bottom" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

            {/* Side gradient */}
            <div className="gradient-side" style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 100, pointerEvents: 'none' }} />

            {/* Action Bar — right side */}
            <div style={{ position: 'absolute', right: 14, bottom: 200, zIndex: 20 }}>
              <ActionBar food={food} onUpdate={handleFoodUpdate} />
            </div>

            {/* Content overlay — bottom */}
            <div style={{ position: 'absolute', bottom: 100, left: 0, right: 80, padding: '0 20px', zIndex: 15 }}>
              {/* Cuisine badge */}
              <div className="pill-badge" style={{ marginBottom: 10 }}>
                {food.cuisine || 'Cuisine'}
              </div>

              {/* Food name */}
              <h1 className="font-headline" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.1, marginBottom: 6 }}>
                {food.name}
              </h1>

              {/* Description */}
              {food.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: 10, maxWidth: '85%', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {food.description}
                </p>
              )}

              {/* Food partner */}
              {food.foodPartner && (
                <button
                  onClick={() => navigate(`/food-partner/${food.foodPartner._id}`)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <span className="icon icon-sm">storefront</span>
                  {food.foodPartner.name}
                </button>
              )}

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button className="btn-neon" style={{ padding: '12px 22px', fontSize: '0.85rem' }}>
                  <span className="icon icon-sm icon-filled">visibility</span>
                  View Dish
                </button>
                {food.foodPartner && (
                  <button
                    className="btn-glass"
                    style={{ padding: '12px 18px', fontSize: '0.85rem' }}
                    onClick={() => navigate(`/food-partner/${food.foodPartner._id}`)}
                  >
                    View Restaurant
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </>
  );
}

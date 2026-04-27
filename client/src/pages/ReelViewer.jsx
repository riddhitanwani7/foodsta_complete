import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ActionBar from '../components/ActionBar';
import BottomNav from '../components/BottomNav';
import Loader from '../components/Loader';

export default function ReelViewer() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialVideos = location.state?.videos || [];
  const startIndex = location.state?.startIndex || 0;

  const [foods, setFoods] = useState(initialVideos);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const videoRefs = useRef([]);

  // Scroll to startIndex on mount
  useEffect(() => {
    if (containerRef.current && startIndex > 0) {
      const slideHeight = window.innerHeight;
      containerRef.current.scrollTop = slideHeight * startIndex;
    }
  }, [startIndex]);

  // Intersection Observer for autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
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

  const handleFoodUpdate = (updatedFood) => {
    setFoods((prev) => prev.map((f) => (f._id === updatedFood._id ? updatedFood : f)));
  };

  if (loading) return <Loader />;

  if (!foods || foods.length === 0) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <span className="icon" style={{ fontSize: 64, opacity: 0.3 }}>video_library</span>
        <h3 className="font-headline" style={{ color: 'var(--text-secondary)', margin: '16px 0 8px' }}>No Videos</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nothing to play here.</p>
        <button className="btn-neon" style={{ marginTop: 24 }} onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
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

      <div className="reel-container" ref={containerRef}>
        {foods.map((food, index) => (
          <div className="reel-slide" key={food._id}>
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              data-index={index}
              src={food.video}
              loop
              muted
              playsInline
              preload={Math.abs(index - startIndex) < 2 ? 'auto' : 'metadata'}
            />

            <div className="gradient-bottom" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
            <div className="gradient-side" style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 100, pointerEvents: 'none' }} />

            {/* Action Bar */}
            <div style={{ position: 'absolute', right: 14, bottom: 200, zIndex: 20 }}>
              <ActionBar food={food} onUpdate={handleFoodUpdate} />
            </div>

            {/* Content overlay */}
            <div style={{ position: 'absolute', bottom: 100, left: 0, right: 80, padding: '0 20px', zIndex: 15 }}>
              <div className="pill-badge" style={{ marginBottom: 10 }}>
                {food.cuisine || 'Cuisine'}
              </div>
              <h1 className="font-headline" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.1, marginBottom: 6 }}>
                {food.name}
              </h1>
              {food.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: 10, maxWidth: '85%', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {food.description}
                </p>
              )}
              {food.foodPartner && (
                <button
                  onClick={() => navigate(`/food-partner/${food.foodPartner._id}`)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', padding: 0, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <span className="icon icon-sm">storefront</span>
                  {food.foodPartner.name}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </>
  );
}

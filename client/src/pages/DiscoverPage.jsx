import { useState, useEffect } from 'react';
import { getFeed } from '../services/api';
import FoodGrid from '../components/FoodGrid';
import BottomNav from '../components/BottomNav';
import Loader from '../components/Loader';

export default function DiscoverPage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getFeed(1, 20);
        setFoods(data.foods || []);
        setHasMore(1 < data.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const { data } = await getFeed(next, 20);
      setFoods((prev) => [...prev, ...(data.foods || [])]);
      setPage(next);
      setHasMore(next < data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 300) {
      loadMore();
    }
  };

  const filtered = search.trim()
    ? foods.filter(
        (f) =>
          f.name?.toLowerCase().includes(search.toLowerCase()) ||
          f.description?.toLowerCase().includes(search.toLowerCase()) ||
          f.foodPartner?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : foods;

  if (loading) return <Loader />;

  return (
    <div className="page-scroll" onScroll={handleScroll}>
      <div className="page-header">
        <h1 className="font-headline" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Discover
        </h1>
      </div>

      {/* Search bar */}
      <div className="search-bar">
        <span className="icon icon-sm" style={{ color: 'var(--text-muted)' }}>search</span>
        <input
          placeholder="Search food, restaurants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
          >
            <span className="icon icon-sm">close</span>
          </button>
        )}
      </div>

      {search && (
        <p style={{ padding: '0 16px 12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          {filtered.length} results for "{search}"
        </p>
      )}

      <FoodGrid foods={filtered} emptyMessage={search ? 'No results found' : 'No food reels yet'} />

      {loadingMore && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <div className="loader-spinner" style={{ width: 28, height: 28 }} />
        </div>
      )}

      <BottomNav />
    </div>
  );
}

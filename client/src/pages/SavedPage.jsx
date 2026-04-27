import { useState, useEffect } from 'react';
import { getSavedFoods } from '../services/api';
import FoodGrid from '../components/FoodGrid';
import BottomNav from '../components/BottomNav';
import Loader from '../components/Loader';

export default function SavedPage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getSavedFoods();
        setFoods(data.foods || []);
      } catch (err) {
        setError('Failed to load saved items');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-scroll">
      <div className="page-header">
        <h1 className="font-headline" style={{ background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Saved
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
          {foods.length} {foods.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {error && (
        <div style={{ margin: '0 16px', padding: 12, background: 'rgba(147,0,10,0.15)', borderRadius: 8, color: 'var(--error)', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <FoodGrid foods={foods} emptyMessage="Nothing saved yet" />
      <BottomNav />
    </div>
  );
}

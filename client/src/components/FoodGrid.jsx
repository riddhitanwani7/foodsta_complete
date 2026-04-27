import { useNavigate } from 'react-router-dom';

export default function FoodGrid({ foods, emptyMessage = 'No items yet' }) {
  const navigate = useNavigate();

  const handleClick = (index) => {
    navigate('/reel', { state: { videos: foods, startIndex: index } });
  };

  if (!foods || foods.length === 0) {
    return (
      <div className="empty-state">
        <span className="icon" style={{ fontSize: 64 }}>restaurant</span>
        <h3>{emptyMessage}</h3>
        <p>Discover amazing food by exploring the feed</p>
      </div>
    );
  }

  return (
    <div className="food-grid">
      {foods.map((food, index) => (
        <div key={food._id} className="food-grid-item" onClick={() => handleClick(index)}>
          <video src={food.video} muted preload="metadata" playsInline />
          <div className="grid-overlay">
            <h4>{food.name}</h4>
            <span>{food.foodPartner?.name || ''}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

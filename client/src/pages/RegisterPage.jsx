import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [role, setRole] = useState('User');
  const [form, setForm] = useState({ fullName: '', name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerUser, registerPartner } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (role === 'User') {
        await registerUser({ fullName: form.fullName, email: form.email, password: form.password });
      } else {
        await registerPartner({ name: form.name, email: form.email, password: form.password, phone: form.phone, address: form.address });
      }
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <h1 className="font-headline" style={{ background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Join Foodsta
        </h1>
        <p>Start your food discovery journey</p>

        {error && <div className="error-msg">{error}</div>}

        <div className="role-selector">
          <button className={`role-btn ${role === 'User' ? 'active' : ''}`} onClick={() => setRole('User')} type="button">🍽️ Food Lover</button>
          <button className={`role-btn ${role === 'FoodPartner' ? 'active' : ''}`} onClick={() => setRole('FoodPartner')} type="button">🏪 Food Partner</button>
        </div>

        <form onSubmit={handleSubmit}>
          {role === 'User' ? (
            <div className="form-group">
              <label>Full Name</label>
              <input className="input-field" name="fullName" placeholder="John Doe" value={form.fullName} onChange={handleChange} required />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Restaurant Name</label>
                <input className="input-field" name="name" placeholder="Tasty Bites" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="input-field" name="phone" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input className="input-field" name="address" placeholder="123 Food Street" value={form.address} onChange={handleChange} />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input className="input-field" type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input-field" type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <button className="btn-neon" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

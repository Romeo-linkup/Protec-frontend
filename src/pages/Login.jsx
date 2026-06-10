import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';

const ROLES = [
  { key: 'admin',   icon: 'ti-shield-check',  label: 'Admin' },
  { key: 'tutor',   icon: 'ti-school',         label: 'Tutor' },
  { key: 'learner', icon: 'ti-user-graduate',  label: 'Learner' },
  { key: 'parent',  icon: 'ti-home-heart',     label: 'Parent / Guardian' },
];

const HOME = { admin: '/admin', tutor: '/tutor', learner: '/learner', parent: '/parent' };

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();
  const [role,     setRole]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!role) { setError('Please select a role.'); return; }
    setError('');
    setLoading(true);
    try {
      const userRole = await login(email, password);
      navigate(HOME[userRole] || '/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-wrap">
        <div className="login-logo">
          <svg width="32" height="36" viewBox="0 0 28 32" fill="none">
            <path d="M14 1L2 6V16C2 23 8 29 14 31C20 29 26 23 26 16V6L14 1Z" fill="#1a2d5a" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>
            <path d="M14 3.5L4 8V16C4 22 9 27.5 14 29.2C19 27.5 24 22 24 16V8L14 3.5Z" fill="#c8102e"/>
            <text x="14" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="sans-serif">P</text>
          </svg>
          <div>
            <div className="login-title">PRO<em style={{color:'var(--red)',fontStyle:'normal'}}>TEC</em> INK</div>
            <div className="login-sub">Results Management System</div>
          </div>
        </div>

        <div className="login-role-btns">
          {ROLES.map(r => (
            <div
              key={r.key}
              className={`role-btn${role === r.key ? ' selected' : ''}`}
              onClick={() => setRole(r.key)}
            >
              <i className={`ti ${r.icon}`} />
              {r.label}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-group">
            <label className="login-label">Email address</label>
            <input
              className="login-input"
              type="text"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-group">
            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="login-err">{error}</div>}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="login-hint">Protec INK · Durban · 2025</div>
      </div>
    </div>
  );
}
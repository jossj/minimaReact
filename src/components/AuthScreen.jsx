import { useState } from 'react';
import { register, login } from '../api/authApi';
import { useAuth } from '../AuthContext';

export default function AuthScreen() {
  const { signIn } = useAuth();
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function switchTab(t) {
    setTab(t);
    setError(null);
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userData = tab === 'login'
        ? await login(username, password)
        : await register(username, password);
      signIn(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">Minima</h1>
        <p className="auth-subtitle">Blockchain Dashboard</p>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>
            Login
          </button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => switchTab('register')}>
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label>
            Username
            <input
              autoFocus
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. alice"
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button
            className="auth-submit"
            type="submit"
            disabled={loading || !username || !password}
          >
            {loading ? '…' : tab === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        {tab === 'register' && (
          <p className="auth-note">
            A Minima wallet address will be generated for you automatically.
          </p>
        )}
      </div>
    </div>
  );
}

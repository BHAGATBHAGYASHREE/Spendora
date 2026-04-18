import { useState } from 'react';
import { Lock, Mail, Activity } from 'lucide-react';

export default function Auth({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`http://localhost:5005${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      
      // Auto-login applies on both Login and Register now
      setToken(data.token);
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
         setError('Cannot connect to backend server on port 5005. Ensure it is running!');
      } else {
         setError(err.message);
      }
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="card animate-in" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
          <Activity size={48} />
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Secure Finance Dashboard Auth
        </p>

        {error && (
          <div style={{ padding: '0.75rem', background: error.includes('successful') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: error.includes('successful') ? 'var(--success)' : 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Email Address</label>
            <Mail size={18} style={{ position: 'absolute', bottom: '13px', left: '12px', color: 'var(--text-secondary)' }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: '2.5rem' }} placeholder="you@example.com" />
          </div>
          <div className="form-group" style={{ position: 'relative', marginBottom: '2rem' }}>
            <label>Master Password</label>
            <Lock size={18} style={{ position: 'absolute', bottom: '13px', left: '12px', color: 'var(--text-secondary)' }} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingLeft: '2.5rem' }} placeholder="••••••••" />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            {isLogin ? <Lock size={18} /> : <Mail size={18} />}
            {isLogin ? 'Sign In Securely' : 'Register Securely'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already registered? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }} style={{ padding: 0, color: 'var(--primary-color)', background: 'transparent' }}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}

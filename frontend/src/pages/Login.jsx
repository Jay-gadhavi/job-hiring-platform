import { useState } from 'react';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="fade-in">
      {/* Background ambient light blobs */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>
      
      <div className="glass-card slide-up" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>SH</div>
          <h2 style={styles.title}>SkillHire</h2>
          <p style={styles.subtitle}>Welcome back! Please login to your account</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span style={{ flex: 1 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email"
              className="modern-input" 
              placeholder="name@company.com" 
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} 
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password"
              className="modern-input" 
              placeholder="••••••••" 
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} 
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.spinner}></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p style={styles.footerLink}>
          Don't have an account? <Link to="/register" style={styles.linkText}>Register now</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  },
  blob1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
    top: '20%',
    left: '20%',
    zIndex: 0,
    pointerEvents: 'none'
  },
  blob2: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(219, 70, 239, 0.15) 0%, transparent 70%)',
    bottom: '20%',
    right: '20%',
    zIndex: 0,
    pointerEvents: 'none'
  },
  card: {
    padding: '40px 32px',
    width: '100%',
    maxWidth: '440px',
    zIndex: 1,
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '28px'
  },
  logoBadge: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-violet) 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '800',
    fontFamily: 'var(--font-heading)',
    marginBottom: '16px',
    boxShadow: '0 4px 12px var(--primary-glow)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #fff 30%, var(--text-secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '6px'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    textAlign: 'center',
    lineHeight: '1.5'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    paddingLeft: '4px'
  },
  button: {
    width: '100%',
    marginTop: '10px',
    height: '46px'
  },
  errorAlert: {
    background: 'rgba(244, 63, 94, 0.12)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    color: '#fda4af',
    fontSize: '13px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    lineHeight: '1.4'
  },
  footerLink: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: 'var(--text-secondary)'
  },
  linkText: {
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color var(--transition-fast)'
  },
  spinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }
};
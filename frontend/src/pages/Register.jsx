import { useState } from 'react';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <p style={styles.subtitle}>Create your account to get started</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span style={{ flex: 1 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input 
              type="text"
              className="modern-input" 
              placeholder="John Doe" 
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} 
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email"
              className="modern-input" 
              placeholder="john@example.com" 
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

          <div style={styles.inputGroup}>
            <label style={styles.label}>I want to...</label>
            <div className="role-selectors">
              <div 
                className={`role-card ${form.role === 'customer' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'customer' })}
              >
                <span className="role-icon">🔍</span>
                <span className="role-title">Hire Help</span>
                <p style={styles.roleDesc}>Find workers</p>
              </div>

              <div 
                className={`role-card ${form.role === 'worker' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'worker' })}
              >
                <span className="role-icon">🛠️</span>
                <span className="role-title">Find Work</span>
                <p style={styles.roleDesc}>Provide service</p>
              </div>
            </div>
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
              'Create Account'
            )}
          </button>
        </form>

        <p style={styles.footerLink}>
          Already have an account? <Link to="/login" style={styles.linkText}>Login</Link>
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
    padding: '30px 20px',
    position: 'relative',
    overflow: 'hidden'
  },
  blob1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)',
    top: '15%',
    left: '15%',
    zIndex: 0,
    pointerEvents: 'none'
  },
  blob2: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(219, 70, 239, 0.12) 0%, transparent 70%)',
    bottom: '15%',
    right: '15%',
    zIndex: 0,
    pointerEvents: 'none'
  },
  card: {
    padding: '40px 32px',
    width: '100%',
    maxWidth: '460px',
    zIndex: 1,
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '24px'
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
    gap: '18px'
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
    marginTop: '6px',
    height: '46px'
  },
  roleDesc: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px'
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
import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function WorkerProfile() {
  const [form, setForm] = useState({ skills: '', city: '', experience: '', phone: '', bio: '' });
  const [isNewProfile, setIsNewProfile] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/workers/my-profile');
      if (data) {
        setIsNewProfile(false);
        setForm({
          skills: data.skills.join(', '),
          city: data.city,
          experience: data.experience,
          phone: data.phone,
          bio: data.bio
        });
      }
    } catch (err) {
      console.log('No profile yet');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.skills || !form.city || !form.experience || !form.phone || !form.bio) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        experience: Number(form.experience)
      };

      if (isNewProfile) {
        await API.post('/workers/profile', payload);
        setMessage('Profile created successfully!');
      } else {
        await API.put('/workers/profile', payload);
        setMessage('Profile updated successfully!');
      }
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div className="glass-card slide-up" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>SH</div>
          <h2 style={styles.title}>{isNewProfile ? 'Create Profile' : 'Update Profile'}</h2>
          <p style={styles.subtitle}>List your services so customers can find and hire you</p>
        </div>

        {message && (
          <div style={styles.successAlert}>
            <span style={{ fontSize: '16px' }}>✨</span>
            <span style={{ flex: 1 }}>{message}</span>
          </div>
        )}

        {error && (
          <div style={styles.errorAlert}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span style={{ flex: 1 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Skills Offered</label>
            <input 
              className="modern-input" 
              placeholder="e.g. electrician, wiring, repair" 
              value={form.skills}
              onChange={e => setForm({ ...form, skills: e.target.value })} 
              required
            />
            <span style={styles.inputHelp}>Separate skills with commas</span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>City</label>
              <input 
                className="modern-input" 
                placeholder="e.g. Mumbai" 
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })} 
                required
              />
            </div>
            
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Exp (Years)</label>
              <input 
                className="modern-input" 
                type="number"
                min="0"
                placeholder="e.g. 5" 
                value={form.experience}
                onChange={e => setForm({ ...form, experience: e.target.value })} 
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contact Phone</label>
            <input 
              className="modern-input" 
              placeholder="e.g. +91 98765 43210" 
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} 
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Short Bio / Pitch</label>
            <textarea 
              className="modern-input" 
              style={{ height: '90px', resize: 'vertical' }}
              placeholder="Tell customers about your experience, tools, and work quality..." 
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })} 
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <button 
              type="submit" 
              className="btn-primary" 
              style={styles.button}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.spinner}></span>
              ) : (
                'Save Profile Settings'
              )}
            </button>

            <button 
              type="button" 
              className="btn-secondary" 
              style={styles.backBtn}
              onClick={() => navigate('/')}
            >
              ← Back to Home
            </button>
          </div>
        </form>
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
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden'
  },
  blob1: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)',
    top: '10%',
    left: '10%',
    zIndex: 0,
    pointerEvents: 'none'
  },
  blob2: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
    bottom: '10%',
    right: '10%',
    zIndex: 0,
    pointerEvents: 'none'
  },
  card: {
    padding: '40px 32px',
    width: '100%',
    maxWidth: '480px',
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
  inputHelp: {
    color: 'var(--text-muted)',
    fontSize: '11px',
    paddingLeft: '4px'
  },
  button: {
    width: '100%',
    height: '46px'
  },
  backBtn: {
    width: '100%',
    height: '46px'
  },
  successAlert: {
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    color: '#a7f3d0',
    fontSize: '13px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    lineHeight: '1.4'
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
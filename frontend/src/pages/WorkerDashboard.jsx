import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';

export default function WorkerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [available, setAvailable] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [noProfile, setNoProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/workers/my-profile');
      if (data) {
        setAvailable(data.available);
        setNoProfile(false);
      }
    } catch (err) {
      console.error('Failed to load profile details', err);
      if (err.response?.status === 404) {
        setNoProfile(true);
      }
    }
  };

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const { data } = await API.put('/workers/profile', { available: !available });
      if (data && data.worker) {
        setAvailable(data.worker.available);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update availability status');
    } finally {
      setToggling(false);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/jobs/worker');
      setJobs(data);
      setNoProfile(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setNoProfile(true);
      } else {
        alert('Failed to load jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setActionId(id);
    try {
      await API.patch(`/jobs/${id}`, { status });
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button className="btn-secondary" style={{ ...styles.backBtn, marginBottom: 0 }} onClick={() => navigate('/')}>
              ← Back to Dashboard
            </button>
            <NotificationBell />
          </div>
          <h2 style={styles.title}>Incoming Job Requests</h2>
          <p style={styles.subtitle}>Review and respond to customers requesting your services</p>
        </div>

        {noProfile ? (
          <div className="glass-card fade-in" style={styles.emptyCard}>
            <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>👤</span>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>Profile Required</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              Please create a worker profile first to start receiving job requests and managing availability.
            </p>
            <button className="btn-primary" onClick={() => navigate('/worker-profile')}>
              Create Profile Now
            </button>
          </div>
        ) : (
          <>
            {/* Availability Toggle Banner */}
            <div className="glass-card fade-in" style={styles.statusCard}>
              <div style={styles.statusTextGroup}>
                <h3 style={styles.statusCardTitle}>Availability Status</h3>
                <p style={styles.statusCardSubtitle}>
                  {available 
                    ? '🟢 Active & Available: You are visible in search results and can receive requests.' 
                    : '🔴 Offline / Busy: You are hidden from search results.'}
                </p>
              </div>
              <button 
                onClick={toggleAvailability} 
                className={available ? "btn-primary" : "btn-secondary"} 
                style={{ 
                  ...styles.toggleBtn,
                  background: available ? 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)' : 'rgba(255,255,255,0.06)' 
                }}
                disabled={toggling}
              >
                {toggling ? <span style={styles.btnSpinner}></span> : (available ? 'Set Busy (Go Offline)' : 'Set Active (Go Online)')}
              </button>
            </div>

            {loading ? (
              <div style={styles.loadingWrapper}>
                <div style={styles.spinner}></div>
                <p style={{ marginTop: '14px', color: 'var(--text-secondary)' }}>Loading requests...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="glass-card" style={styles.emptyCard}>
                <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>📋</span>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>No Job Requests Yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Your profile is active. When customers near your city search for your skills, their job requests will appear here.
                </p>
              </div>
            ) : (
              <div style={styles.cardList}>
                {jobs.map(job => (
                  <div key={job._id} className="glass-card" style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div style={styles.customerAvatar}>
                        {(job.customer?.name?.[0] || 'C').toUpperCase()}
                      </div>
                      <div style={styles.customerInfo}>
                        <h3 style={styles.customerName}>{job.customer?.name}</h3>
                        <p style={styles.customerEmail}>{job.customer?.email}</p>
                      </div>
                      <span style={{
                        ...styles.statusBadge,
                        background:
                          job.status === 'accepted' ? 'rgba(16, 185, 129, 0.12)' :
                          job.status === 'rejected' ? 'rgba(244, 63, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color:
                          job.status === 'accepted' ? '#a7f3d0' :
                          job.status === 'rejected' ? '#fda4af' : '#fef3c7',
                        border:
                          job.status === 'accepted' ? '1px solid rgba(16, 185, 129, 0.3)' :
                          job.status === 'rejected' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                      }}>
                        {job.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={styles.cardBody}>
                      <p style={styles.detailRow}>
                        <strong style={{ color: 'var(--text-secondary)' }}>Skill Needed:</strong>{' '}
                        <span style={styles.skillTag}>{job.skill}</span>
                      </p>
                      <p style={styles.detailRow}>
                        <strong style={{ color: 'var(--text-secondary)' }}>Description:</strong>{' '}
                        <span style={{ color: 'var(--text-primary)' }}>{job.description || 'No description provided'}</span>
                      </p>
                    </div>

                    {job.status === 'pending' && (
                      <div style={styles.cardActions}>
                        <button
                          className="btn-primary"
                          style={styles.acceptBtn}
                          onClick={() => updateStatus(job._id, 'accepted')}
                          disabled={actionId === job._id}
                        >
                          {actionId === job._id ? <span style={styles.btnSpinner}></span> : 'Accept Job'}
                        </button>

                        <button
                          className="btn-secondary"
                          style={styles.rejectBtn}
                          onClick={() => updateStatus(job._id, 'rejected')}
                          disabled={actionId === job._id}
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {job.status === 'accepted' && (
                      <div style={styles.cardActions}>
                        <button
                          className="btn-primary"
                          style={styles.completeBtn}
                          onClick={() => updateStatus(job._id, 'completed')}
                          disabled={actionId === job._id}
                        >
                          {actionId === job._id ? <span style={styles.btnSpinner}></span> : 'Mark as Completed'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden'
  },
  blob1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
    top: '-10%',
    right: '10%',
    zIndex: 0,
    pointerEvents: 'none'
  },
  blob2: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(219, 70, 239, 0.12) 0%, transparent 70%)',
    bottom: '5%',
    left: '10%',
    zIndex: 0,
    pointerEvents: 'none'
  },
  wrapper: {
    maxWidth: '700px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  },
  header: {
    marginBottom: '32px'
  },
  backBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #fff 40%, var(--text-secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '6px',
    fontFamily: 'var(--font-heading)'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  loadingWrapper: {
    textAlign: 'center',
    padding: '60px'
  },
  spinner: {
    display: 'inline-block',
    width: '32px',
    height: '32px',
    border: '3px solid rgba(99,102,241,0.2)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  btnSpinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  emptyCard: {
    padding: '60px 40px',
    textAlign: 'center',
    borderRadius: '16px'
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    padding: '24px',
    borderRadius: '16px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '16px',
    marginBottom: '16px'
  },
  customerAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700'
  },
  customerInfo: {
    flex: 1
  },
  customerName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff'
  },
  customerEmail: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.05em'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '16px'
  },
  detailRow: {
    fontSize: '14px',
    lineHeight: '1.5'
  },
  skillTag: {
    background: 'rgba(99, 102, 241, 0.12)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    color: '#a5b4fc',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600'
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '16px'
  },
  acceptBtn: {
    flex: 1,
    height: '38px',
    fontSize: '13px',
    background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  completeBtn: {
    flex: 1,
    height: '38px',
    fontSize: '13px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-violet) 100%)',
    boxShadow: '0 4px 12px var(--primary-glow)'
  },
  rejectBtn: {
    flex: 1,
    height: '38px',
    fontSize: '13px',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    background: 'rgba(244, 63, 94, 0.05)',
    color: '#fda4af'
  },
  statusCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderRadius: '16px',
    marginBottom: '32px',
    gap: '20px'
  },
  statusTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1
  },
  statusCardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'var(--font-heading)'
  },
  statusCardSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  toggleBtn: {
    padding: '10px 20px',
    fontSize: '13px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff',
    whiteSpace: 'nowrap',
    transition: 'all var(--transition-fast)'
  }
};
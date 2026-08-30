import React, { useState } from 'react';
import API from '../api/axios';
import { IconClose, IconAlertTriangle, IconSparkles } from './Icons';

export default function DisputeModal({ isOpen, onClose, job, onDisputeCreated }) {
  const [reason, setReason] = useState('Incomplete Work');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !job) return null;

  const reasonsList = [
    'Incomplete Work',
    'Poor Quality / Damage',
    'Unresponsive / No Show',
    'Payment / Pricing Dispute',
    'Unprofessional Conduct',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a detailed explanation of the issue.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await API.post('/disputes', {
        jobId: job._id,
        reason,
        description: description.trim()
      });

      setMessage('Dispute reported successfully. Our administration team has been alerted.');
      if (onDisputeCreated) onDisputeCreated(data);
      setTimeout(() => {
        onClose();
        setMessage('');
        setDescription('');
      }, 1800);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose} className="fade-in">
      <div 
        style={styles.modal} 
        onClick={(e) => e.stopPropagation()} 
        className="glass-card slide-up"
      >
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <div style={styles.alertIcon}>
              <IconAlertTriangle size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={styles.title}>Report a Dispute</h3>
              <p style={styles.subtitle}>
                Service: <strong>{job.skill}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
            <IconClose size={18} color="#a1a1aa" />
          </button>
        </div>

        {message && (
          <div style={styles.successAlert}>
            <IconSparkles size={18} color="#ffffff" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={styles.errorAlert}>
            <IconAlertTriangle size={18} color="#f4f4f5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Reason for Dispute</label>
            <select 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              style={styles.select}
              className="modern-input"
            >
              {reasonsList.map(r => (
                <option key={r} value={r} style={{ background: '#18181b', color: '#fff' }}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Detailed Description</label>
            <textarea
              className="modern-input"
              rows={4}
              placeholder="Explain the dispute in detail (e.g. what went wrong, agreed terms, photos/evidence available)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={styles.actions}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              style={{ flex: 1, height: '40px' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !!message}
              style={{ flex: 1, height: '40px' }}
            >
              {loading ? <span style={styles.spinner}></span> : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: '20px'
  },
  modal: {
    width: '100%',
    maxWidth: '480px',
    borderRadius: '20px',
    padding: '28px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
    background: 'rgba(18, 18, 22, 0.95)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  alertIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: '2px 0 0 0'
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  select: {
    width: '100%',
    cursor: 'pointer'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px'
  },
  successAlert: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '8px',
    padding: '12px',
    color: '#ffffff',
    fontSize: '13px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  errorAlert: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    color: '#f4f4f5',
    fontSize: '13px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(0,0,0,0.3)',
    borderTopColor: '#000',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }
};

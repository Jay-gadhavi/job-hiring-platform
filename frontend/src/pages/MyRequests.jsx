import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import { IconClipboard, IconStar } from '../components/Icons';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [activeReviewJobId, setActiveReviewJobId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleReviewSubmit = async (e, jobId) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await API.post('/reviews', { jobId, rating, comment });
      alert('Thank you for your feedback!');
      setActiveReviewJobId(null);
      setRating(5);
      setComment('');
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const StarSelector = ({ value, onChange }) => {
    return (
      <div style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => onChange(star)}
            style={{
              ...styles.starSelectorIcon,
              opacity: star <= value ? 1 : 0.3
            }}
          >
            <IconStar 
              size={20} 
              color={star <= value ? '#ffffff' : '#71717a'} 
              fill={star <= value ? '#ffffff' : 'none'} 
            />
          </span>
        ))}
      </div>
    );
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/jobs/customer');
      setRequests(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted':
        return {
          background: 'rgba(255, 255, 255, 0.12)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        };
      case 'rejected':
        return {
          background: '#18181b',
          color: '#71717a',
          border: '1px solid #3f3f46'
        };
      case 'completed':
        return {
          background: '#ffffff',
          color: '#09090b',
          border: '1px solid #ffffff'
        };
      default: // pending
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#a1a1aa',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        };
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
              ← Back to Search
            </button>
            <NotificationBell />
          </div>
          <h2 style={styles.title}>My Job Requests</h2>
          <p style={styles.subtitle}>Track status and updates for your local service requests</p>
        </div>

        {loading ? (
          <div style={styles.loadingWrapper}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: '14px', color: 'var(--text-secondary)' }}>Loading your requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="glass-card" style={styles.emptyCard}>
            <span style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <IconClipboard size={48} color="#71717a" />
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>No Requests Sent Yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
              When you request services from workers on the search page, details of those bookings will be tracked right here.
            </p>
            <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
              Find Workers
            </button>
          </div>
        ) : (
          <div style={styles.cardList}>
            {requests.map(job => (
              <div key={job._id} className="glass-card" style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.workerAvatar}>
                    {(job.worker?.user?.name?.[0] || 'W').toUpperCase()}
                  </div>
                  <div style={styles.workerInfo}>
                    <h3 style={styles.workerName}>{job.worker?.user?.name || 'Unknown Worker'}</h3>
                    <p style={styles.workerEmail}>{job.worker?.user?.email}</p>
                  </div>
                  <span style={{ ...styles.statusBadge, ...getStatusStyle(job.status) }}>
                    {job.status.toUpperCase()}
                  </span>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.detailRow}>
                    <strong style={{ color: 'var(--text-secondary)', minWidth: '100px', display: 'inline-block' }}>Skill:</strong>
                    <span style={styles.skillTag}>{job.skill}</span>
                  </div>
                  
                  <div style={styles.detailRow}>
                    <strong style={{ color: 'var(--text-secondary)', minWidth: '100px', display: 'inline-block' }}>Details:</strong>
                    <span style={{ color: 'var(--text-primary)' }}>{job.description || 'No additional description provided'}</span>
                  </div>

                  <div style={styles.detailRow}>
                    <strong style={{ color: 'var(--text-secondary)', minWidth: '100px', display: 'inline-block' }}>Requested:</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {new Date(job.createdAt).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {job.status === 'completed' && (
                    <div style={styles.reviewSection}>
                      {job.review ? (
                        <div style={styles.reviewDisplay}>
                          <div style={styles.reviewHeader}>
                            <span style={styles.reviewDisplayTitle}>My Review</span>
                            <div style={styles.ratingStars}>
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <IconStar
                                  key={idx}
                                  size={14}
                                  color={idx < job.review.rating ? '#ffffff' : '#3f3f46'}
                                  fill={idx < job.review.rating ? '#ffffff' : 'none'}
                                />
                              ))}
                            </div>
                          </div>
                          {job.review.comment && (
                            <p style={styles.reviewComment}>"{job.review.comment}"</p>
                          )}
                        </div>
                      ) : activeReviewJobId === job._id ? (
                        <form onSubmit={(e) => handleReviewSubmit(e, job._id)} style={styles.reviewForm}>
                          <h4 style={styles.reviewFormTitle}>Rate this Service</h4>
                          <div style={styles.formRow}>
                            <label style={styles.formLabel}>Rating:</label>
                            <StarSelector value={rating} onChange={setRating} />
                          </div>
                          <div style={styles.formRow}>
                            <textarea
                              className="modern-input"
                              placeholder="Share your experience (optional)..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              style={{ height: '70px', resize: 'vertical' }}
                            />
                          </div>
                          <div style={styles.formActions}>
                            <button
                              type="submit"
                              className="btn-primary"
                              style={styles.submitReviewBtn}
                              disabled={submittingReview}
                            >
                              {submittingReview ? <span style={styles.btnSpinner}></span> : 'Submit'}
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              style={styles.cancelReviewBtn}
                              onClick={() => {
                                setActiveReviewJobId(null);
                                setRating(5);
                                setComment('');
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          className="btn-primary"
                          style={styles.rateBtn}
                          onClick={() => {
                            setActiveReviewJobId(job._id);
                            setRating(5);
                            setComment('');
                          }}
                        >
                          <IconStar size={14} color="#09090b" fill="#09090b" /> Leave a Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px 80px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-primary)'
  },
  blob1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
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
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
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
    border: '3px solid rgba(255,255,255,0.2)',
    borderTopColor: '#ffffff',
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
  workerAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #ffffff 0%, #3f3f46 100%)',
    color: '#09090b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700'
  },
  workerInfo: {
    flex: 1
  },
  workerName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff'
  },
  workerEmail: {
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
    gap: '12px'
  },
  detailRow: {
    fontSize: '14px',
    lineHeight: '1.5',
    display: 'flex',
    alignItems: 'flex-start'
  },
  skillTag: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#f4f4f5',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600'
  },
  reviewSection: {
    marginTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '16px'
  },
  reviewDisplay: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '12px 16px'
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  reviewDisplayTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  ratingStars: {
    display: 'flex',
    gap: '2px',
    fontSize: '14px'
  },
  reviewComment: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontStyle: 'italic',
    lineHeight: '1.4'
  },
  reviewForm: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '10px',
    padding: '16px'
  },
  reviewFormTitle: {
    fontSize: '15px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#fff',
    fontFamily: 'var(--font-heading)'
  },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  formLabel: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  starContainer: {
    display: 'flex',
    gap: '6px'
  },
  starSelectorIcon: {
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center'
  },
  formActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  },
  submitReviewBtn: {
    height: '34px',
    padding: '0 16px',
    fontSize: '13px'
  },
  cancelReviewBtn: {
    height: '34px',
    padding: '0 16px',
    fontSize: '13px'
  },
  rateBtn: {
    width: '100%',
    height: '36px',
    fontSize: '13px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  btnSpinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(0,0,0,0.3)',
    borderTopColor: '#000',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }
};

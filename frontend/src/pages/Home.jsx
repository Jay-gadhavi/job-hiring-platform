import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';

export default function Home() {
  const [workers, setWorkers] = useState([]);
  const [skill, setSkill] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestingId, setRequestingId] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [expandedWorkerId, setExpandedWorkerId] = useState(null);
  const [workerReviews, setWorkerReviews] = useState({});

  const toggleReviews = async (workerId) => {
    if (expandedWorkerId === workerId) {
      setExpandedWorkerId(null);
      return;
    }
    
    setExpandedWorkerId(workerId);
    if (!workerReviews[workerId]) {
      try {
        const { data } = await API.get(`/reviews/worker/${workerId}`);
        setWorkerReviews(prev => ({ ...prev, [workerId]: data }));
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      }
    }
  };

useEffect(() => {
  fetchWorkers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/workers?skill=${skill}&city=${city}`);
      setWorkers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const requestJob = async (workerId, skill) => {
    setRequestingId(workerId);
    try {
      await API.post('/jobs/request', {
        workerId,
        skill,
        description: 'Need service'
      });
      alert('Job request sent successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequestingId(null);
    }
  };

  const getAvatarGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    ];
    if (!name) return gradients[0];
    const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[charCodeSum % gradients.length];
  };

  return (
    <div style={styles.container} className="fade-in">
      {/* Navbar */}
      <header className="glass-card" style={styles.navbar}>
        <div style={styles.logoGroup}>
          <div style={styles.logoIcon}>SH</div>
          <span style={styles.logoText}>SkillHire</span>
        </div>

        <div style={styles.navActions}>
          {user?.role === 'customer' && (
            <button className="btn-secondary" onClick={() => navigate('/my-requests')} style={styles.navBtn}>
              📋 My Requests
            </button>
          )}

          {user?.role === 'worker' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => navigate('/worker-profile')} style={styles.navBtn}>
                👤 My Profile
              </button>
              <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={styles.navBtn}>
                📊 Dashboard
              </button>
            </div>
          )}

          <NotificationBell />

          <div style={styles.profileBadge}>
            <span style={styles.userInitial}>{(user?.name?.[0] || 'U').toUpperCase()}</span>
            <span style={styles.userName}>Hi, {user?.name}</span>
          </div>

          <button className="btn-secondary" onClick={logout} style={styles.logoutBtn}>
            Logout ➔
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroGlow}></div>
        <h1 style={styles.heroTitle}>Find & Book Skilled Workers Near You</h1>
        <p style={styles.heroSubtitle}>Connect with trusted electricians, plumbers, carpenters & local service providers in seconds.</p>

        {/* Search widget */}
        <div className="glass-card" style={styles.searchBar}>
          <div style={styles.searchField}>
            <span style={styles.fieldIcon}>🔧</span>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="What skill do you need? (e.g. electrician)"
              value={skill}
              onChange={e => setSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchWorkers()}
            />
          </div>
          <div style={styles.searchDivider}></div>
          <div style={styles.searchField}>
            <span style={styles.fieldIcon}>📍</span>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="City or location? (e.g. Mumbai)"
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchWorkers()}
            />
          </div>
          <button className="btn-primary" onClick={fetchWorkers} style={styles.searchBtn}>
            🔍 Search
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.resultsHeading}>
            {loading ? 'Searching Workers' : `${workers.length} Available Workers`}
          </h2>
          <div style={styles.headingUnderline}></div>
        </div>

        {loading ? (
          <div style={styles.grid}>
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card skeleton-box" style={styles.skeletonCard}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={styles.skeletonAvatar} className="skeleton-box"></div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.skeletonTitle} className="skeleton-box"></div>
                    <div style={styles.skeletonSubtitle} className="skeleton-box"></div>
                  </div>
                </div>
                <div style={styles.skeletonText} className="skeleton-box"></div>
                <div style={styles.skeletonText} className="skeleton-box"></div>
                <div style={styles.skeletonFooter} className="skeleton-box"></div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.grid}>
            {workers.map(w => {
              const bgGradient = getAvatarGradient(w.user?.name);
              return (
                <div key={w._id} className="glass-card" style={styles.workerCard}>
                  {/* Card Header */}
                  <div style={styles.cardHeader}>
                    <div style={{ ...styles.avatar, background: bgGradient }}>
                      {(w.user?.name?.[0] || 'W').toUpperCase()}
                    </div>
                    <div style={styles.workerInfo}>
                      <h3 style={styles.workerName}>{w.user?.name}</h3>
                      <p style={styles.workerCity}>📍 {w.city}</p>
                      <div style={styles.cardRating}>
                        {w.numReviews > 0 ? (
                          <>
                            <span style={{ color: 'var(--accent-amber)' }}>★</span>
                            <span style={styles.ratingVal}>{w.averageRating}</span>
                            <span style={styles.ratingCount}>({w.numReviews})</span>
                          </>
                        ) : (
                          <span style={styles.noRating}>⭐ No ratings yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div style={styles.skillsRow}>
                    {w.skills.map(s => (
                      <span key={s} style={styles.skillTag}>{s}</span>
                    ))}
                  </div>

                  {/* Experience and Bio */}
                  <p style={styles.exp}>
                    <span style={{ color: 'var(--accent-amber)' }}>★</span> <strong>{w.experience} years</strong> experience
                  </p>
                  <p style={styles.bio}>{w.bio || 'Professional skilled worker offering quality services at reasonable rates.'}</p>

                  {/* Footer status & details */}
                  <div style={styles.cardFooter}>
                    <div style={styles.statusBlock}>
                      <span
                        style={{
                          ...styles.statusPulse,
                          background: w.available ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                        }}
                        className={w.available ? 'pulse-active' : ''}
                      ></span>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: w.available ? '#a7f3d0' : '#fecdd3'
                        }}
                      >
                        {w.available ? 'Available' : 'Busy'}
                      </span>
                    </div>

                    <span style={styles.phone}>📞 {w.phone}</span>
                  </div>

                  {/* Customer Booking Option */}
                  {user?.role === 'customer' && user?.id !== w.user?._id && (
                    <button
                      className="btn-primary"
                      style={styles.bookBtn}
                      onClick={() => requestJob(w._id, w.skills[0])}
                      disabled={requestingId === w._id}
                    >
                      {requestingId === w._id ? (
                        <span style={styles.btnSpinner}></span>
                      ) : (
                        'Request Services'
                      )}
                    </button>
                  )}

                  {/* Reviews Toggle Button */}
                  <button
                    className="btn-secondary"
                    style={styles.toggleReviewsBtn}
                    onClick={() => toggleReviews(w._id)}
                  >
                    {expandedWorkerId === w._id ? 'Hide Reviews ▴' : `Read Reviews (${w.numReviews}) ▾`}
                  </button>

                  {/* Expanded Reviews list */}
                  {expandedWorkerId === w._id && (
                    <div style={styles.reviewsListContainer} className="slide-up">
                      <h4 style={styles.reviewsListTitle}>Customer Feedback</h4>
                      {!workerReviews[w._id] ? (
                        <div style={styles.reviewsLoader}>
                          <span style={styles.btnSpinner}></span>
                        </div>
                      ) : workerReviews[w._id].length === 0 ? (
                        <p style={styles.noReviewsText}>No feedback comments written yet.</p>
                      ) : (
                        <div style={styles.reviewsScroll}>
                          {workerReviews[w._id].map(rev => (
                            <div key={rev._id} style={styles.reviewItem}>
                              <div style={styles.reviewItemHeader}>
                                <span style={styles.reviewItemAuthor}>{rev.customer?.name}</span>
                                <div style={styles.reviewItemStars}>
                                  {Array.from({ length: 5 }).map((_, idx) => (
                                    <span
                                      key={idx}
                                      style={{
                                        color: idx < rev.rating ? 'var(--accent-amber)' : 'var(--text-muted)',
                                        fontSize: '11px'
                                      }}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {rev.comment && <p style={styles.reviewItemComment}>"{rev.comment}"</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {workers.length === 0 && !loading && (
          <div className="glass-card" style={styles.emptyContainer}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3 style={styles.emptyTitle}>No Matching Workers Found</h3>
            <p style={styles.emptySubtitle}>Try adjusting your search filters or inputting a different skill or city.</p>
            <button className="btn-secondary" onClick={() => { setSkill(''); setCity(''); fetchWorkers(); }} style={{ marginTop: '16px' }}>
              Clear Search Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    paddingBottom: '80px'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 30px',
    margin: '20px auto',
    maxWidth: '1200px',
    width: 'calc(100% - 40px)',
    borderRadius: '16px',
    position: 'relative',
    zIndex: 1000
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-violet) 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '800',
    fontFamily: 'var(--font-heading)'
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontSize: '20px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #fff 40%, var(--text-secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em'
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  navBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    height: '36px',
    borderRadius: '8px'
  },
  profileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '4px 12px 4px 6px',
    borderRadius: '30px',
    height: '36px'
  },
  userInitial: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700'
  },
  userName: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-primary)'
  },
  logoutBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    height: '36px',
    borderRadius: '8px',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    color: '#fda4af',
    background: 'rgba(244, 63, 94, 0.05)'
  },
  heroSection: {
    textAlign: 'center',
    padding: '60px 20px 80px',
    position: 'relative',
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  heroGlow: {
    position: 'absolute',
    width: '500px',
    height: '200px',
    background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.12) 0%, transparent 60%)',
    top: '20%',
    zIndex: -1
  },
  heroTitle: {
    fontSize: '42px',
    fontWeight: '800',
    lineHeight: '1.2',
    background: 'linear-gradient(135deg, #ffffff 40%, #c7d2fe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '14px',
    fontFamily: 'var(--font-heading)'
  },
  heroSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '16px',
    maxWidth: '600px',
    lineHeight: '1.6',
    marginBottom: '40px'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '8px 10px',
    borderRadius: '50px',
    background: 'rgba(15, 16, 26, 0.75)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  searchField: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    padding: '0 16px',
    gap: '10px'
  },
  fieldIcon: {
    fontSize: '18px',
    opacity: 0.8
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    fontFamily: 'var(--font-body)'
  },
  searchDivider: {
    width: '1px',
    height: '30px',
    background: 'rgba(255, 255, 255, 0.1)'
  },
  searchBtn: {
    borderRadius: '30px',
    padding: '12px 28px',
    height: '46px',
    fontSize: '14px'
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  sectionHeader: {
    marginBottom: '32px'
  },
  resultsHeading: {
    fontSize: '22px',
    fontFamily: 'var(--font-heading)',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  headingUnderline: {
    width: '40px',
    height: '3px',
    background: 'var(--primary)',
    borderRadius: '2px',
    marginTop: '6px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '24px'
  },
  workerCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '280px',
    borderRadius: '16px'
  },
  cardHeader: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '16px'
  },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '800',
    fontFamily: 'var(--font-heading)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  workerInfo: {
    flex: 1
  },
  workerName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '2px'
  },
  workerCity: {
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  skillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px'
  },
  skillTag: {
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    color: '#a5b4fc',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.02em'
  },
  exp: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '10px'
  },
  bio: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '20px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '16px',
    marginTop: 'auto'
  },
  statusBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusPulse: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  phone: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '500'
  },
  bookBtn: {
    width: '100%',
    marginTop: '16px',
    height: '40px',
    fontSize: '13px',
    borderRadius: '8px'
  },
  emptyContainer: {
    padding: '60px 40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '16px',
    maxWidth: '500px',
    margin: '40px auto 0'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.7
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '6px'
  },
  emptySubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  skeletonCard: {
    padding: '24px',
    minHeight: '280px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: '16px'
  },
  skeletonAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '14px'
  },
  skeletonTitle: {
    height: '18px',
    width: '120px',
    marginBottom: '6px'
  },
  skeletonSubtitle: {
    height: '12px',
    width: '80px'
  },
  skeletonText: {
    height: '14px',
    width: '100%',
    marginTop: '16px'
  },
  skeletonFooter: {
    height: '24px',
    width: '100%',
    marginTop: '20px'
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
  cardRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px',
    fontSize: '13px'
  },
  ratingVal: {
    fontWeight: '700',
    color: '#fff'
  },
  ratingCount: {
    color: 'var(--text-muted)',
    fontSize: '11px'
  },
  noRating: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  toggleReviewsBtn: {
    width: '100%',
    height: '36px',
    fontSize: '13px',
    borderRadius: '8px',
    marginTop: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: 'var(--text-secondary)'
  },
  reviewsListContainer: {
    marginTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '16px',
    textAlign: 'left'
  },
  reviewsListTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  reviewsLoader: {
    display: 'flex',
    justifyContent: 'center',
    padding: '10px 0'
  },
  noReviewsText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontStyle: 'italic'
  },
  reviewsScroll: {
    maxHeight: '150px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingRight: '6px'
  },
  reviewItem: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '6px',
    padding: '8px 10px'
  },
  reviewItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  reviewItemAuthor: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  reviewItemStars: {
    display: 'flex',
    gap: '1px'
  },
  reviewItemComment: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
    lineHeight: '1.4'
  }
};
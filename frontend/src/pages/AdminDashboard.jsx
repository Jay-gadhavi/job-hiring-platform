import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import { 
  IconShield, 
  IconUser, 
  IconClipboard, 
  IconStar, 
  IconAlertTriangle, 
  IconTrash, 
  IconCheck, 
  IconSearch 
} from '../components/Icons';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('disputes'); // 'disputes', 'users', 'jobs'
  const [stats, setStats] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disputeFilter, setDisputeFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [updatingDisputeId, setUpdatingDisputeId] = useState(null);
  const [editingDisputeId, setEditingDisputeId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState({});
  const [actionMessage, setActionMessage] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    fetchStats();
    fetchDisputes();
    fetchUsers();
    fetchJobs();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  const fetchDisputes = async () => {
    try {
      const { data } = await API.get('/disputes');
      setDisputes(data);
    } catch (err) {
      console.error('Failed to load disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data } = await API.get('/admin/jobs');
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  };

  const handleUpdateDispute = async (id, newStatus) => {
    setUpdatingDisputeId(id);
    try {
      const notes = resolutionNotes[id] || '';
      const { data } = await API.patch(`/disputes/${id}`, {
        status: newStatus,
        resolutionNotes: notes
      });
      setActionMessage(`Dispute status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      setTimeout(() => setActionMessage(''), 3000);
      setEditingDisputeId(null);
      setDisputes(prev => prev.map(d => (d._id === id ? data : d)));
      fetchStats();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update dispute');
    } finally {
      setUpdatingDisputeId(null);
    }
  };


  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.patch(`/admin/users/${userId}/role`, { role: newRole });
      setActionMessage(`User role updated to ${newRole}`);
      setTimeout(() => setActionMessage(''), 3000);
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user account "${userName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await API.delete(`/admin/users/${userId}`);
      setActionMessage(`User "${userName}" was removed`);
      setTimeout(() => setActionMessage(''), 3000);
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredDisputes = disputes.filter(d => {
    if (disputeFilter === 'all') return true;
    return d.status === disputeFilter;
  });

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'resolved':
        return { background: '#ffffff', color: '#09090b', border: '1px solid #ffffff' };
      case 'under_review':
        return { background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' };
      case 'dismissed':
        return { background: '#18181b', color: '#71717a', border: '1px solid #3f3f46' };
      default: // open
        return { background: 'rgba(255, 255, 255, 0.08)', color: '#e4e4e7', border: '1px solid rgba(255, 255, 255, 0.2)' };
    }
  };

  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <button className="btn-secondary" style={styles.backBtn} onClick={() => navigate('/')}>
              ← Back to Platform
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={styles.adminBadge}>
                <IconShield size={16} color="#09090b" />
                <span>Admin Access</span>
              </div>
              <NotificationBell />
            </div>
          </div>
          <h1 style={styles.pageTitle}>Admin & Moderation Suite</h1>
          <p style={styles.pageSubtitle}>Platform analytics, user moderation, and dispute arbitration center.</p>
        </div>

        {actionMessage && (
          <div style={styles.alertBar} className="slide-up">
            <IconCheck size={16} color="#ffffff" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Analytics KPI Metric Cards */}
        {stats && (
          <div style={styles.metricsGrid}>
            <div className="glass-card" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>Total Users</span>
                <IconUser size={18} color="#a1a1aa" />
              </div>
              <div style={styles.metricValue}>{stats.totalUsers}</div>
              <p style={styles.metricSub}>{stats.totalCustomers} Customers • {stats.totalWorkers} Workers</p>
            </div>

            <div className="glass-card" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>Total Bookings</span>
                <IconClipboard size={18} color="#a1a1aa" />
              </div>
              <div style={styles.metricValue}>{stats.totalJobs}</div>
              <p style={styles.metricSub}>{stats.completedJobs} Completed ({stats.totalJobs ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%)</p>
            </div>

            <div className="glass-card" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>Open Disputes</span>
                <IconAlertTriangle size={18} color="#ffffff" />
              </div>
              <div style={styles.metricValue}>{stats.openDisputes}</div>
              <p style={styles.metricSub}>{stats.resolvedDisputes} Resolved / Dismissed</p>
            </div>

            <div className="glass-card" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>Total Reviews</span>
                <IconStar size={18} color="#a1a1aa" />
              </div>
              <div style={styles.metricValue}>{stats.totalReviews}</div>
              <p style={styles.metricSub}>Customer feedback entries</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={styles.tabBar}>
          <button 
            style={{ ...styles.tabBtn, ...(activeTab === 'disputes' ? styles.activeTabBtn : {}) }}
            onClick={() => setActiveTab('disputes')}
          >
            <IconAlertTriangle size={16} color={activeTab === 'disputes' ? '#09090b' : '#a1a1aa'} />
            <span>Disputes ({disputes.filter(d => d.status === 'open' || d.status === 'under_review').length})</span>
          </button>

          <button 
            style={{ ...styles.tabBtn, ...(activeTab === 'users' ? styles.activeTabBtn : {}) }}
            onClick={() => setActiveTab('users')}
          >
            <IconUser size={16} color={activeTab === 'users' ? '#09090b' : '#a1a1aa'} />
            <span>User Moderation ({users.length})</span>
          </button>

          <button 
            style={{ ...styles.tabBtn, ...(activeTab === 'jobs' ? styles.activeTabBtn : {}) }}
            onClick={() => setActiveTab('jobs')}
          >
            <IconClipboard size={16} color={activeTab === 'jobs' ? '#09090b' : '#a1a1aa'} />
            <span>All Bookings ({jobs.length})</span>
          </button>
        </div>

        {/* TAB 1: DISPUTES PANEL */}
        {activeTab === 'disputes' && (
          <div className="fade-in">
            {/* Filter Pills */}
            <div style={styles.filterPills}>
              {['all', 'open', 'under_review', 'resolved', 'dismissed'].map(f => (
                <button
                  key={f}
                  onClick={() => setDisputeFilter(f)}
                  style={{
                    ...styles.filterPill,
                    background: disputeFilter === f ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                    color: disputeFilter === f ? '#09090b' : '#a1a1aa'
                  }}
                >
                  {f.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={styles.centerLoading}>
                <div style={styles.spinner}></div>
                <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Loading disputes...</p>
              </div>
            ) : filteredDisputes.length === 0 ? (
              <div className="glass-card" style={styles.emptyCard}>
                <IconCheck size={40} color="#71717a" />
                <h3 style={styles.emptyTitle}>No Disputes Found</h3>
                <p style={styles.emptySubtitle}>All customer and worker interactions are currently smooth and resolved.</p>
              </div>
            ) : (
              <div style={styles.disputeList}>
                {filteredDisputes.map(dispute => (
                  <div key={dispute._id} className="glass-card" style={styles.disputeCard}>
                    <div style={styles.disputeHeader}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={styles.disputeReasonBadge}>{dispute.reason}</span>
                          <span style={{ ...styles.disputeStatusBadge, ...getStatusBadgeStyle(dispute.status) }}>
                            {dispute.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <h3 style={styles.disputeJobTitle}>
                          Job: <strong>{dispute.job?.skill || 'Service'}</strong>
                        </h3>
                      </div>
                      <span style={styles.disputeDate}>
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={styles.partiesRow}>
                      <div style={styles.partyBox}>
                        <span style={styles.partyLabel}>Raised By</span>
                        <span style={styles.partyName}>{dispute.raisedBy?.name} ({dispute.raisedBy?.role})</span>
                        <span style={styles.partyEmail}>{dispute.raisedBy?.email}</span>
                      </div>
                      <div style={styles.partyBox}>
                        <span style={styles.partyLabel}>Reported Against</span>
                        <span style={styles.partyName}>{dispute.against?.name} ({dispute.against?.role})</span>
                        <span style={styles.partyEmail}>{dispute.against?.email}</span>
                      </div>
                    </div>

                    <div style={styles.disputeBody}>
                      <span style={styles.bodyLabel}>Dispute Details:</span>
                      <p style={styles.disputeDesc}>{dispute.description}</p>
                    </div>

                    {dispute.resolutionNotes && (
                      <div style={styles.resolutionBox}>
                        <span style={styles.resolutionLabel}>Resolution Notes:</span>
                        <p style={styles.resolutionText}>{dispute.resolutionNotes}</p>
                        {dispute.resolvedBy && (
                          <span style={styles.resolvedByText}>
                            Resolved by Admin: {dispute.resolvedBy.name || 'Admin'}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Closed Status Banner */}
                    {(dispute.status === 'resolved' || dispute.status === 'dismissed') && editingDisputeId !== dispute._id ? (
                      <div style={styles.resolvedFooter}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <IconCheck size={16} color="#ffffff" />
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
                            Dispute is {dispute.status.toUpperCase()}
                          </span>
                        </div>
                        <button
                          className="btn-secondary"
                          style={styles.reopenBtn}
                          onClick={() => setEditingDisputeId(dispute._id)}
                        >
                          Modify Status
                        </button>
                      </div>
                    ) : null}

                    {/* Admin Action Controls (shown when open, under_review, or editing) */}
                    {(dispute.status === 'open' || dispute.status === 'under_review' || editingDisputeId === dispute._id) && (
                      <div style={styles.disputeActions}>
                        <input
                          type="text"
                          className="modern-input"
                          placeholder="Admin resolution notes / summary..."
                          value={resolutionNotes[dispute._id] || dispute.resolutionNotes || ''}
                          onChange={(e) => setResolutionNotes({ ...resolutionNotes, [dispute._id]: e.target.value })}
                          style={styles.notesInput}
                        />
                        
                        <div style={styles.actionBtnGroup}>
                          {editingDisputeId === dispute._id && (
                            <button
                              className="btn-secondary"
                              onClick={() => setEditingDisputeId(null)}
                              style={styles.dismissBtn}
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            className="btn-secondary"
                            onClick={() => handleUpdateDispute(dispute._id, 'under_review')}
                            disabled={updatingDisputeId === dispute._id || dispute.status === 'under_review'}
                            style={styles.reviewBtn}
                          >
                            Under Review
                          </button>
                          <button
                            className="btn-primary"
                            onClick={() => handleUpdateDispute(dispute._id, 'resolved')}
                            disabled={updatingDisputeId === dispute._id || dispute.status === 'resolved'}
                            style={styles.resolveBtn}
                          >
                            Resolve
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => handleUpdateDispute(dispute._id, 'dismissed')}
                            disabled={updatingDisputeId === dispute._id || dispute.status === 'dismissed'}
                            style={styles.dismissBtn}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="fade-in">
            <div style={styles.searchBar}>
              <IconSearch size={18} color="#71717a" />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div className="glass-card" style={styles.tableCard}>
              <div style={styles.tableHeader}>
                <span style={{ flex: 2 }}>User</span>
                <span style={{ flex: 1 }}>Role</span>
                <span style={{ flex: 1.5 }}>Details</span>
                <span style={{ flex: 1 }}>Joined</span>
                <span style={{ flex: 1.5, textAlign: 'right' }}>Actions</span>
              </div>

              <div style={styles.tableBody}>
                {filteredUsers.map(u => (
                  <div key={u._id} style={styles.tableRow}>
                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={styles.tableAvatar}>
                        {(u.name?.[0] || 'U').toUpperCase()}
                      </div>
                      <div>
                        <p style={styles.tableUserName}>{u.name}</p>
                        <p style={styles.tableUserEmail}>{u.email}</p>
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <span style={{
                        ...styles.roleTag,
                        background: u.role === 'admin' ? '#ffffff' : u.role === 'worker' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                        color: u.role === 'admin' ? '#09090b' : '#ffffff'
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ flex: 1.5, fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {u.workerProfile ? (
                        <span>City: {u.workerProfile.city} • {u.workerProfile.skills?.join(', ')}</span>
                      ) : (
                        <span>Standard Client</span>
                      )}
                    </div>

                    <div style={{ flex: 1, fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>

                    <div style={{ flex: 1.5, display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        style={styles.roleSelect}
                      >
                        <option value="customer">Customer</option>
                        <option value="worker">Worker</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        style={styles.deleteUserBtn}
                        title="Delete User"
                      >
                        <IconTrash size={14} color="#a1a1aa" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GLOBAL JOB MONITOR */}
        {activeTab === 'jobs' && (
          <div className="fade-in">
            <div className="glass-card" style={styles.tableCard}>
              <div style={styles.tableHeader}>
                <span style={{ flex: 1.5 }}>Service / Skill</span>
                <span style={{ flex: 1.5 }}>Customer</span>
                <span style={{ flex: 1.5 }}>Worker</span>
                <span style={{ flex: 1 }}>Status</span>
                <span style={{ flex: 1 }}>Date</span>
              </div>

              <div style={styles.tableBody}>
                {jobs.map(job => (
                  <div key={job._id} style={styles.tableRow}>
                    <div style={{ flex: 1.5 }}>
                      <strong style={{ color: '#fff', fontSize: '14px' }}>{job.skill}</strong>
                      <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '2px 0 0 0' }}>
                        {job.description || 'No description'}
                      </p>
                    </div>

                    <div style={{ flex: 1.5 }}>
                      <span style={{ color: '#fff', fontSize: '13px' }}>{job.customer?.name || 'Customer'}</span>
                      <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>{job.customer?.email}</p>
                    </div>

                    <div style={{ flex: 1.5 }}>
                      <span style={{ color: '#fff', fontSize: '13px' }}>{job.worker?.user?.name || 'Worker'}</span>
                      <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>{job.worker?.user?.email}</p>
                    </div>

                    <div style={{ flex: 1 }}>
                      <span style={{
                        ...styles.roleTag,
                        background: job.status === 'completed' ? '#ffffff' : 'rgba(255,255,255,0.06)',
                        color: job.status === 'completed' ? '#09090b' : '#e4e4e7'
                      }}>
                        {job.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ flex: 1, fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
    top: '-5%',
    right: '5%',
    zIndex: 0,
    pointerEvents: 'none'
  },
  blob2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
    bottom: '10%',
    left: '5%',
    zIndex: 0,
    pointerEvents: 'none'
  },
  wrapper: {
    maxWidth: '1100px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  },
  header: {
    marginBottom: '28px'
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  backBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    borderRadius: '8px'
  },
  adminBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#ffffff',
    color: '#09090b',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    boxShadow: '0 2px 10px rgba(255, 255, 255, 0.2)'
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #fff 40%, var(--text-secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '6px',
    fontFamily: 'var(--font-heading)'
  },
  pageSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  alertBar: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '10px',
    padding: '12px 18px',
    color: '#ffffff',
    fontSize: '13px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  metricCard: {
    padding: '20px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'var(--font-heading)'
  },
  metricSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    margin: 0
  },
  tabBar: {
    display: 'flex',
    gap: '10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '16px',
    marginBottom: '24px'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#a1a1aa',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeTabBtn: {
    background: '#ffffff',
    color: '#09090b',
    border: '1px solid #ffffff',
    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)'
  },
  filterPills: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  filterPill: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  centerLoading: {
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '16px'
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginTop: '12px',
    marginBottom: '4px'
  },
  emptySubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  disputeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  disputeCard: {
    padding: '24px',
    borderRadius: '16px'
  },
  disputeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '16px',
    marginBottom: '16px'
  },
  disputeReasonBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff'
  },
  disputeStatusBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '20px',
    letterSpacing: '0.04em'
  },
  disputeJobTitle: {
    fontSize: '16px',
    color: '#f4f4f5',
    margin: '10px 0 0 0',
    fontWeight: '500'
  },
  disputeDate: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },
  partiesRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  },
  partyBox: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  partyLabel: {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.04em'
  },
  partyName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff'
  },
  partyEmail: {
    fontSize: '11px',
    color: 'var(--text-secondary)'
  },
  disputeBody: {
    marginBottom: '16px'
  },
  bodyLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  disputeDesc: {
    fontSize: '14px',
    color: '#f4f4f5',
    lineHeight: '1.5',
    margin: '6px 0 0 0'
  },
  resolutionBox: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '16px'
  },
  resolutionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase'
  },
  resolutionText: {
    fontSize: '13px',
    color: '#e4e4e7',
    margin: '4px 0 6px 0',
    lineHeight: '1.4'
  },
  resolvedByText: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  disputeActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '16px'
  },
  resolvedFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    padding: '12px 16px',
    marginTop: '12px'
  },
  reopenBtn: {
    padding: '6px 14px',
    fontSize: '12px',
    height: '32px'
  },
  notesInput: {
    width: '100%',
    fontSize: '13px'
  },
  actionBtnGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
  },
  reviewBtn: {
    height: '34px',
    padding: '0 14px',
    fontSize: '12px'
  },
  resolveBtn: {
    height: '34px',
    padding: '0 16px',
    fontSize: '12px'
  },
  dismissBtn: {
    height: '34px',
    padding: '0 14px',
    fontSize: '12px'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    marginBottom: '20px'
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '14px',
    width: '100%',
    outline: 'none'
  },
  tableCard: {
    borderRadius: '16px',
    overflow: 'hidden'
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  tableBody: {
    display: 'flex',
    flexDirection: 'column'
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background 0.2s ease'
  },
  tableAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700'
  },
  tableUserName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0
  },
  tableUserEmail: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    margin: 0
  },
  roleTag: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '16px',
    display: 'inline-block'
  },
  roleSelect: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '12px',
    padding: '4px 8px',
    cursor: 'pointer',
    outline: 'none'
  },
  deleteUserBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }
};

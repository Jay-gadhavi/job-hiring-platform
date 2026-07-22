import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!token) return;

    fetchNotifications();
    
    // Set up polling every 10 seconds for real-time-like updates
    const interval = setInterval(fetchNotifications, 10000);

    // Event listener to close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await API.put(`/notifications/${notif._id}/read`);
        setNotifications(prev =>
          prev.map(n => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
      setShowDropdown(false);

      // Navigate based on user role and notification type
      if (user?.role === 'worker') {
        navigate('/dashboard');
      } else {
        navigate('/my-requests');
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation(); // Avoid triggering notification click
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  if (!token) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setShowDropdown(!showDropdown)} 
        style={styles.bellBtn}
        aria-label="Notifications"
      >
        <span style={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {/* Opaque/Acrylic Dropdown */}
      {showDropdown && (
        <div className="notification-dropdown slide-up">
          <div style={styles.header}>
            <span style={styles.headerTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={styles.markAllBtn}>
                Mark all read
              </button>
            )}
          </div>

          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>
                <span style={styles.emptyIcon}>📭</span>
                <span style={styles.emptyText}>All caught up!</span>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif._id} 
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    ...styles.item,
                    backgroundColor: notif.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.06)'
                  }}
                >
                  <div style={styles.itemContent}>
                    <p style={{
                      ...styles.itemText,
                      color: notif.isRead ? 'var(--text-secondary)' : 'var(--text-primary)',
                      fontWeight: notif.isRead ? '400' : '600'
                    }}>
                      {notif.message}
                    </p>
                    <div style={styles.meta}>
                      <span style={styles.time}>{formatTime(notif.createdAt)}</span>
                      {!notif.isRead && <span style={styles.dot}></span>}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteNotif(e, notif._id)} 
                    style={styles.deleteBtn}
                    title="Delete notification"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  bellBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  bellIcon: {
    fontSize: '18px',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: 'var(--accent-rose)',
    color: '#fff',
    borderRadius: '50%',
    minWidth: '18px',
    height: '18px',
    padding: '0 4px',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 10px rgba(244, 63, 94, 0.6)',
    border: '2px solid var(--bg-primary)',
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: '0',
    width: '320px',
    maxHeight: '420px',
    zIndex: 999,
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
    borderRadius: '16px',
    border: '1px solid var(--glass-border)',
    backgroundColor: '#12131a', // Solid theme secondary bg for maximum text readability
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px 12px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: '16px',
    fontFamily: 'var(--font-heading)',
    background: 'linear-gradient(135deg, #fff 50%, var(--text-secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  markAllBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  list: {
    overflowY: 'auto',
    flex: 1,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 16px',
    gap: '8px',
  },
  emptyIcon: {
    fontSize: '32px',
  },
  emptyText: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    gap: '12px',
  },
  itemContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  itemText: {
    fontSize: '13px',
    lineHeight: '1.4',
    margin: 0,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  time: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    boxShadow: '0 0 6px var(--primary)',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: '1',
    transition: 'color 0.2s',
  },
};

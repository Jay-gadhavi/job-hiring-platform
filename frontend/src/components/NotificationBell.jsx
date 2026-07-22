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

      {/* Redesigned solid high-contrast dropdown */}
      {showDropdown && (
        <div className="notification-dropdown slide-up">
          <div className="notification-header">
            <span className="notification-header-title">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="notification-mark-all">
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <span className="notification-empty-icon">📭</span>
                <span className="notification-empty-text">All caught up!</span>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif._id} 
                  onClick={() => handleNotificationClick(notif)}
                  className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                >
                  <div className="notification-item-content">
                    <p className="notification-item-text">
                      {notif.message}
                    </p>
                    <div className="notification-meta">
                      <span className="notification-time">{formatTime(notif.createdAt)}</span>
                      {!notif.isRead && <span className="notification-unread-dot"></span>}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteNotif(e, notif._id)} 
                    className="notification-delete-btn"
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
  }
};

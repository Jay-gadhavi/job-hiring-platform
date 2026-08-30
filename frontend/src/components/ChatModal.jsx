import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { IconClose, IconSend, IconMessage, IconStatusDot } from './Icons';

export default function ChatModal({ isOpen, onClose, job, recipientName, recipientRole }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket, isConnected } = useSocket();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = user.id || user._id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    if (!job?._id) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/chat/${job._id}`);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      setLoading(false);
    }
  }, [job?._id]);

  useEffect(() => {
    if (!isOpen || !job?._id) return;

    fetchMessages();

    if (socket) {
      socket.emit('join_job_chat', job._id);

      const handleReceiveMessage = (newMsg) => {
        if (newMsg.job === job._id || newMsg.job?._id === job._id) {
          setMessages(prev => {
            if (prev.some(m => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });
        }
      };

      socket.on('receive_message', handleReceiveMessage);

      return () => {
        socket.emit('leave_job_chat', job._id);
        socket.off('receive_message', handleReceiveMessage);
      };
    }
  }, [isOpen, job?._id, socket, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const { data } = await API.post(`/chat/${job._id}`, { text: messageText });
      setMessages(prev => {
        if (prev.some(m => m._id === data._id)) return prev;
        return [...prev, data];
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      alert(err.response?.data?.message || 'Failed to send message');
      setInputText(messageText); // Restore on error
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !job) return null;

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.backdrop} onClick={onClose} className="fade-in">
      <div 
        style={styles.modal} 
        onClick={(e) => e.stopPropagation()} 
        className="glass-card slide-up"
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.recipientInfo}>
            <div style={styles.avatar}>
              {(recipientName?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <div style={styles.nameRow}>
                <h3 style={styles.recipientName}>{recipientName || 'Direct Chat'}</h3>
                <IconStatusDot active={isConnected} size={7} />
              </div>
              <p style={styles.jobSkill}>
                {job.skill ? `Service: ${job.skill}` : ''} {recipientRole ? `• ${recipientRole}` : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={styles.closeBtn}
            aria-label="Close Chat"
          >
            <IconClose size={18} color="#a1a1aa" />
          </button>
        </div>

        {/* Message Area */}
        <div style={styles.messageArea}>
          {loading ? (
            <div style={styles.centerBox}>
              <div style={styles.spinner}></div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '10px' }}>
                Loading conversation...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div style={styles.centerBox}>
              <IconMessage size={40} color="#71717a" />
              <p style={{ color: '#fff', fontWeight: '600', marginTop: '12px', fontSize: '15px' }}>
                No messages yet
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                Start the conversation with {recipientName || 'the other party'}.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const senderId = msg.sender?._id || msg.sender;
              const isMine = senderId === currentUserId;

              return (
                <div
                  key={msg._id}
                  style={{
                    ...styles.messageRow,
                    justifyContent: isMine ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      ...styles.bubble,
                      ...(isMine ? styles.myBubble : styles.theirBubble)
                    }}
                  >
                    {!isMine && (
                      <span style={styles.senderLabel}>
                        {msg.sender?.name || 'User'}
                      </span>
                    )}
                    <p style={isMine ? styles.myText : styles.theirText}>
                      {msg.text}
                    </p>
                    <span style={isMine ? styles.myTime : styles.theirTime}>
                      {formatMessageTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} style={styles.inputBar}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message... (Enter to send)"
            style={styles.inputField}
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            style={{
              ...styles.sendBtn,
              opacity: !inputText.trim() || sending ? 0.5 : 1,
              cursor: !inputText.trim() || sending ? 'not-allowed' : 'pointer'
            }}
          >
            <IconSend size={16} color="#09090b" />
          </button>
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
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    width: '100%',
    maxWidth: '520px',
    height: '620px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 255, 255, 0.05)',
    background: 'rgba(15, 15, 18, 0.95)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.02)'
  },
  recipientInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700'
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  recipientName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0
  },
  jobSkill: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: 0,
    marginTop: '2px'
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
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  messageArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  centerBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center'
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '3px solid rgba(255, 255, 255, 0.15)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  bubble: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    wordBreak: 'break-word'
  },
  myBubble: {
    background: '#ffffff',
    borderRadius: '16px 16px 4px 16px',
    boxShadow: '0 4px 15px rgba(255, 255, 255, 0.12)'
  },
  theirBubble: {
    background: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px 16px 16px 4px'
  },
  senderLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#a1a1aa'
  },
  myText: {
    color: '#09090b',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.45',
    fontWeight: '500'
  },
  theirText: {
    color: '#f4f4f5',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.45'
  },
  myTime: {
    fontSize: '10px',
    color: '#71717a',
    alignSelf: 'flex-end',
    fontWeight: '600'
  },
  theirTime: {
    fontSize: '10px',
    color: '#71717a',
    alignSelf: 'flex-end'
  },
  inputBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.02)'
  },
  inputField: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    padding: '10px 14px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  sendBtn: {
    background: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 10px rgba(255, 255, 255, 0.2)',
    transition: 'all 0.2s ease'
  }
};

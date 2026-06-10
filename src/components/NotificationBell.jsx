import { useState, useEffect, useRef } from 'react';
import api from '../api/client.js';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wrapRef = useRef(null);

  const unread = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (open) fetchNotifs();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  async function fetchNotifs() {
    try {
      const { data } = await api.get('/notifications/mine');
      setNotifications(data);
    } catch {}
  }

  async function markRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  }

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  }

  async function deleteNotif(id) {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {}
  }

  const dotColor = p =>
    p === 'red' ? '#c8102e' :
    p === 'yellow' ? '#854F0B' :
    p === 'green' ? '#3B6D11' : '#185FA5';

  return (
    <div style={{ position: 'relative' }} ref={wrapRef}>
      <div className="notif-bell" onClick={() => setOpen(o => !o)}>
        <i className="ti ti-bell" />
        {unread > 0 && (
          <div className="notif-badge">{unread > 9 ? '9+' : unread}</div>
        )}
      </div>

      {open && (
        <div style={{
          position: 'fixed',
          bottom: '60px',
          left: '220px',
          width: '300px',
          background: '#fff',
          border: '0.5px solid #e0e0e0',
          borderRadius: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 1000,
        }}>
          <div style={{
            padding: '12px 14px 8px',
            borderBottom: '0.5px solid #ebebeb',
            fontSize: '12px',
            fontWeight: 600,
            color: '#1a1a1a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            Notifications
            {unread > 0 && (
              <span
                onClick={markAllRead}
                style={{ fontSize: '10px', color: '#185FA5', cursor: 'pointer' }}
              >
                Mark all read
              </span>
            )}
          </div>
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#6b6b6b' }}>
                No notifications yet.
              </div>
            ) : notifications.map(n => (
              <div
                key={n.id}
                style={{
                  padding: '10px 14px',
                  borderBottom: '0.5px solid #ebebeb',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  background: n.is_read ? '#fff' : '#f7f9ff',
                }}
              >
                <div
                  onClick={() => markRead(n.id)}
                  style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1, cursor: 'pointer' }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: dotColor(n.priority),
                    marginTop: 4, flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: '11px', color: '#1a1a1a', lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: '10px', color: '#6b6b6b', marginTop: 2 }}>
                      {new Date(n.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteNotif(n.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6b6b6b', fontSize: 13, padding: '2px 4px', flexShrink: 0,
                  }}
                  title="Delete"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../../api/client.js';

export default function ParentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications/mine').then(r => setNotifications(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const markRead = async id => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id===id ? {...n,is_read:true} : n));
    } catch {}
  };

  const dotColor = p => p==='red'?'var(--red)':p==='yellow'?'var(--yellow-text)':p==='green'?'var(--green-text)':'var(--blue-text)';

  if (loading) return <div className="view"><div className="no-data">Loading...</div></div>;

  return (
    <div className="view">
      <div className="topbar">
        <div><div className="topbar-title">Notifications</div><div className="topbar-sub">{notifications.filter(n=>!n.is_read).length} unread</div></div>
        <div className="topbar-right"><span className="role-badge role-badge-parent">Parent</span></div>
      </div>

      <div className="card" id="parent-notif-list" style={{padding:0}}>
        {notifications.length === 0 ? <div className="no-data" style={{padding:'24px'}}>No notifications yet.</div>
          : notifications.map(n => (
          <div key={n.id} className={`notif-item${n.is_read?'':' unread'}`} style={{padding:'12px 16px'}} onClick={() => markRead(n.id)}>
            <div className="notif-dot" style={{background:dotColor(n.priority)}} />
            <div style={{flex:1}}>
              <div className="notif-text">{n.message}</div>
              <div className="notif-time">{new Date(n.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            {!n.is_read && <span className="pill pill-blue" style={{fontSize:'10px'}}>New</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
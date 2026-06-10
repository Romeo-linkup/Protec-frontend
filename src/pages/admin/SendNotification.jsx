import { useState, useEffect } from 'react';
import api from '../../api/client.js';

export default function AdminSendNotification() {
  const [form, setForm]         = useState({ message: '', priority: 'blue', roleTarget: 'learner', recipientId: '' });
  const [mode, setMode]         = useState('role');
  const [saving, setSaving]     = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState('');
  const [notifs, setNotifs]     = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  useEffect(() => { fetchNotifs(); }, []);

  const fetchNotifs = async () => {
    setLoadingNotifs(true);
    try {
      const { data } = await api.get('/notifications/mine');
      setNotifs(data);
    } catch {} finally { setLoadingNotifs(false); }
  };

  const handleSend = async () => {
    if (!form.message) { setError('Message is required.'); return; }
    setSaving(true); setError(''); setSent(false);
    try {
      const payload = { message: form.message, priority: form.priority };
      if (mode === 'role') payload.roleTarget = form.roleTarget;
      else payload.recipientId = form.recipientId;
      await api.post('/notifications/send', payload);
      setSent(true);
      setForm(f => ({ ...f, message: '' }));
      setTimeout(() => setSent(false), 4000);
      fetchNotifs();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifs(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  const handleClearAll = async () => {
    if (!confirm('Delete all notifications for this branch?')) return;
    try {
      await api.delete('/notifications/all/clear');
      setNotifs([]);
    } catch {}
  };

  const dotColor = p =>
    p === 'red' ? '#c8102e' : p === 'yellow' ? '#854F0B' : p === 'green' ? '#3B6D11' : '#185FA5';

  const priorityLabel = p =>
    p === 'red' ? 'Urgent' : p === 'yellow' ? 'Warning' : p === 'green' ? 'Positive' : 'Info';

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Send notification</div>
          <div className="topbar-sub">Broadcast to a role or individual</div>
        </div>
        <div className="topbar-right">
          <span className="role-badge role-badge-admin">Admin</span>
        </div>
      </div>

      <div className="card">
        <div className="card-hd"><i className="ti ti-send" />New notification</div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button className={`btn${mode === 'role' ? ' btn-navy' : ''}`} onClick={() => setMode('role')}>
            Broadcast to role
          </button>
          <button className={`btn${mode === 'individual' ? ' btn-navy' : ''}`} onClick={() => setMode('individual')}>
            Send to individual
          </button>
        </div>

        {mode === 'role' ? (
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Target role</label>
            <select value={form.roleTarget} onChange={e => setForm(f => ({ ...f, roleTarget: e.target.value }))}>
              <option value="learner">All learners</option>
              <option value="tutor">All tutors</option>
              <option value="parent">All parents</option>
            </select>
          </div>
        ) : (
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Recipient user ID</label>
            <input type="text" value={form.recipientId}
              onChange={e => setForm(f => ({ ...f, recipientId: e.target.value }))}
              placeholder="Paste user UUID" />
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Priority</label>
          <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            <option value="blue">Blue — info</option>
            <option value="green">Green — positive</option>
            <option value="yellow">Yellow — warning</option>
            <option value="red">Red — urgent</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Message</label>
          <textarea value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Type your notification message..."
            style={{ minHeight: 100 }} />
        </div>

        {error && <div className="login-err" style={{ marginBottom: 12 }}>{error}</div>}
        {sent  && <div className="saved-note" style={{ marginBottom: 12 }}>Notification sent successfully.</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-navy" onClick={handleSend} disabled={saving}
            style={{ padding: '9px 24px' }}>
            {saving ? 'Sending...' : 'Send notification'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-hd">
          <i className="ti ti-bell" />Sent notifications
          {notifs.length > 0 && (
            <button className="btn btn-red btn-sm" onClick={handleClearAll}
              style={{ marginLeft: 'auto', fontSize: 11 }}>
              Clear all
            </button>
          )}
        </div>
        {loadingNotifs ? <div className="no-data">Loading...</div> : notifs.length === 0 ? (
          <div className="no-data">No notifications sent yet.</div>
        ) : notifs.map(n => (
          <div key={n.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '10px 0', borderBottom: '0.5px solid var(--color-border-tertiary)',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: dotColor(n.priority), marginTop: 5, flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{n.message}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 3, display: 'flex', gap: 10 }}>
                <span>{priorityLabel(n.priority)}</span>
                <span>{new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            <button onClick={() => handleDelete(n.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 14, padding: '2px 4px' }}>
              <i className="ti ti-trash" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
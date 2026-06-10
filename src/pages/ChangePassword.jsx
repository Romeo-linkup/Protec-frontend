import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import api from '../api/client.js';

export default function ChangePassword() {
  const { user } = useContext(AuthContext);
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirm) {
      setError('All fields are required.'); return;
    }
    if (form.newPassword !== form.confirm) {
      setError('New passwords do not match.'); return;
    }
    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.'); return;
    }
    setSaving(true); setError(''); setDone(false);
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setDone(true);
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      setTimeout(() => setDone(false), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password.');
    } finally { setSaving(false); }
  };

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Change password</div>
          <div className="topbar-sub">{user?.fullName}</div>
        </div>
        <div className="topbar-right">
          <span className={`role-badge role-badge-${user?.role}`}>{user?.role}</span>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '480px' }}>
        <div className="card-hd"><i className="ti ti-lock" />Update your password</div>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label">Current password</label>
          <input type="password" value={form.currentPassword}
            onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
            placeholder="Enter current password" />
        </div>
        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label">New password</label>
          <input type="password" value={form.newPassword}
            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
            placeholder="At least 8 characters" />
        </div>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">Confirm new password</label>
          <input type="password" value={form.confirm}
            onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
            placeholder="Repeat new password" />
        </div>

        {error && <div className="login-err" style={{ marginBottom: '12px' }}>{error}</div>}
        {done  && <div className="saved-note">Password changed successfully.</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-navy" onClick={handleSubmit} disabled={saving}
            style={{ padding: '9px 24px', fontSize: '13px' }}>
            {saving ? 'Saving...' : 'Change password'}
          </button>
        </div>
      </div>
    </div>
  );
}

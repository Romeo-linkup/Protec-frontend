import { useState, useEffect } from 'react';
import api from '../../api/client.js';

const SUBJECTS = ['Mathematics', 'Physical Sciences', 'English'];
const DURATIONS = [
  { label: '1 hour', value: 60 },
  { label: '1 hour 15 min', value: 75 },
  { label: '1 hour 30 min', value: 90 },
];

export default function TutorLessonRegister() {
  const [registers, setRegisters] = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [saved, setSaved]         = useState(false);
  const [form, setForm] = useState({
    sessionDate: new Date().toISOString().split('T')[0],
    grade: 'Grade 10',
    subject: 'Mathematics',
    topic: '',
    durationMins: 60,
    description: '',
  });

  useEffect(() => { fetchRegisters(); }, []);

  const fetchRegisters = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/lesson-register');
      setRegisters(data);
    } catch { setRegisters([]); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.topic.trim()) { setError('Topic is required.'); return; }
    setSaving(true); setError(''); setSaved(false);
    try {
      const { data } = await api.post('/lesson-register', form);
      setRegisters(prev => [{ ...data, tutor_name: 'You' }, ...prev]);
      setSaved(true);
      setForm(f => ({ ...f, topic: '', description: '' }));
      setShowForm(false);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this register entry?')) return;
    try {
      await api.delete(`/lesson-register/${id}`);
      setRegisters(prev => prev.filter(r => r.id !== id));
    } catch {}
  };

  const fmtDuration = mins => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  };

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Lesson register</div>
          <div className="topbar-sub">Submit your class sessions to admin</div>
        </div>
        <div className="topbar-right">
          <span className="role-badge role-badge-tutor">Tutor</span>
          <button className="btn btn-navy btn-sm" onClick={() => { setShowForm(s => !s); setError(''); }}>
            {showForm ? 'Cancel' : '+ Log session'}
          </button>
        </div>
      </div>

      {saved && <div className="saved-note" style={{ marginBottom: 12 }}>Session submitted successfully.</div>}

      {showForm && (
        <div className="card">
          <div className="card-hd"><i className="ti ti-notebook" />Log a class session</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Session date</label>
              <input type="date" value={form.sessionDate}
                onChange={e => setForm(f => ({ ...f, sessionDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Grade</label>
              <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}>
                <option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Class duration</label>
              <select value={form.durationMins}
                onChange={e => setForm(f => ({ ...f, durationMins: parseInt(e.target.value) }))}>
                {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Topic covered</label>
            <input type="text" value={form.topic}
              onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              placeholder="e.g. Quadratic equations — factorisation" />
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Description / comments <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>(optional)</span></label>
            <textarea value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Any notes about learner engagement, homework set, follow-up needed..."
              style={{ minHeight: 80 }} />
          </div>

          {error && <div className="login-err" style={{ marginBottom: 10 }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-navy" onClick={handleSubmit} disabled={saving}
              style={{ padding: '9px 24px' }}>
              {saving ? 'Submitting...' : 'Submit session'}
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-hd"><i className="ti ti-history" />My submitted sessions</div>
        {loading ? <div className="no-data">Loading...</div> : registers.length === 0 ? (
          <div className="no-data">No sessions submitted yet.</div>
        ) : registers.map(r => (
          <div key={r.id} style={{
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 8, padding: '12px 14px', marginBottom: 8,
            background: 'var(--color-background-primary)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {r.subject} — {r.topic}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3, display: 'flex', gap: 10 }}>
                  <span><i className="ti ti-calendar" style={{ marginRight: 3 }} />
                    {new Date(r.session_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span><i className="ti ti-clock" style={{ marginRight: 3 }} />{fmtDuration(r.duration_mins)}</span>
                  <span><i className="ti ti-users" style={{ marginRight: 3 }} />{r.grade}</span>
                </div>
                {r.description && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6, fontStyle: 'italic' }}>
                    {r.description}
                  </div>
                )}
              </div>
              <button className="btn btn-red btn-sm" onClick={() => handleDelete(r.id)}
                style={{ flexShrink: 0, marginLeft: 10 }}>
                <i className="ti ti-trash" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../../api/client.js';

const SUBJECTS = ['', 'Mathematics', 'Physical Sciences', 'English'];

export default function AdminLessonRegisters() {
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [grade, setGrade]         = useState('');
  const [subject, setSubject]     = useState('');
  const [search, setSearch]       = useState('');

  useEffect(() => { fetchRegisters(); }, [grade, subject]);

  const fetchRegisters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (grade)   params.append('grade', grade);
      if (subject) params.append('subject', subject);
      const { data } = await api.get(`/lesson-register?${params}`);
      setRegisters(data);
    } catch { setRegisters([]); }
    finally { setLoading(false); }
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

  const filtered = search
    ? registers.filter(r =>
        r.tutor_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.topic?.toLowerCase().includes(search.toLowerCase())
      )
    : registers;

  const totalHours = registers.reduce((acc, r) => acc + (r.duration_mins || 0), 0);

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Lesson registers</div>
          <div className="topbar-sub">All tutor-submitted class sessions</div>
        </div>
        <div className="topbar-right">
          <span className="role-badge role-badge-admin">Admin</span>
        </div>
      </div>

      <div className="metrics-3">
        <div className="mcard">
          <div className="mcard-label">Total sessions</div>
          <div className="mcard-val">{registers.length}</div>
        </div>
        <div className="mcard">
          <div className="mcard-label">Total teaching hours</div>
          <div className="mcard-val">{(totalHours / 60).toFixed(1)}h</div>
        </div>
        <div className="mcard">
          <div className="mcard-label">Tutors reporting</div>
          <div className="mcard-val">{new Set(registers.map(r => r.tutor_id)).size}</div>
        </div>
      </div>

      <div className="filter-bar">
        <select value={grade} onChange={e => setGrade(e.target.value)}>
          <option value="">All grades</option>
          <option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
        </select>
        <select value={subject} onChange={e => setSubject(e.target.value)}>
          {SUBJECTS.map(s => <option key={s} value={s}>{s || 'All subjects'}</option>)}
        </select>
        <input className="search-bar" placeholder="Search tutor or topic..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? <div className="no-data">Loading...</div> : filtered.length === 0 ? (
          <div className="no-data">No sessions found.</div>
        ) : filtered.map(r => (
          <div key={r.id} style={{
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 8, padding: '12px 14px', marginBottom: 8,
            background: 'var(--color-background-primary)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {r.subject} — {r.topic}
                  </span>
                  <span className="pill pill-blue" style={{ fontSize: 10 }}>{r.grade}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span><i className="ti ti-user" style={{ marginRight: 3 }} />{r.tutor_name}</span>
                  <span><i className="ti ti-calendar" style={{ marginRight: 3 }} />
                    {new Date(r.session_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span><i className="ti ti-clock" style={{ marginRight: 3 }} />{fmtDuration(r.duration_mins)}</span>
                </div>
                {r.description && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6, fontStyle: 'italic' }}>
                    "{r.description}"
                  </div>
                )}
              </div>
              <button className="btn btn-red btn-sm" onClick={() => handleDelete(r.id)}
                style={{ flexShrink: 0, marginLeft: 12 }}>
                <i className="ti ti-trash" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

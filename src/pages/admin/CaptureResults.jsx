import { useState, useEffect } from 'react';
import api from '../../api/client.js';

const SUBJECTS = [
  { key: 'math', label: 'Mathematics' },
  { key: 'sci',  label: 'Physical sciences' },
  { key: 'eng',  label: 'English' },
];

export default function AdminCaptureResults() {
  const [learners, setLearners] = useState([]);
  const [grade, setGrade]       = useState('Grade 10');
  const [term, setTerm]         = useState('T1');
  const [year, setYear]         = useState('2025');
  const [learnerId, setLearnerId] = useState('');
  const [marks, setMarks]       = useState({ math_school:'', math_protec:'', sci_school:'', sci_protec:'', eng_school:'', eng_protec:'' });
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get(`/learners?grade=${grade}`).then(r => { setLearners(r.data); setLearnerId(''); }).catch(() => {});
  }, [grade]);

  useEffect(() => {
    if (!learnerId) return;
    api.get(`/results?term=${term}&year=${year}`).then(r => {
      const existing = r.data.find(x => x.learner_id === learnerId);
      if (existing) {
        setMarks({
          math_school: existing.math_school ?? '',
          math_protec: existing.math_protec ?? '',
          sci_school:  existing.sci_school  ?? '',
          sci_protec:  existing.sci_protec  ?? '',
          eng_school:  existing.eng_school  ?? '',
          eng_protec:  existing.eng_protec  ?? '',
        });
      } else {
        setMarks({ math_school:'', math_protec:'', sci_school:'', sci_protec:'', eng_school:'', eng_protec:'' });
      }
    }).catch(() => {});
  }, [learnerId, term, year]);

  const avg2 = (a, b) => {
    const na = parseFloat(a), nb = parseFloat(b);
    return !isNaN(na) && !isNaN(nb) ? Math.round((na + nb) / 2) : null;
  };

  const band = v => {
    if (v == null) return null;
    if (v < 50) return 'red';
    if (v < 60) return 'yellow';
    if (v < 80) return 'green';
    return 'blue';
  };

  const handleSave = async () => {
    if (!learnerId) { setError('Select a learner.'); return; }
    setSaving(true); setError(''); setSaved(false);
    try {
      await api.post('/results', { learnerId, term, year: parseInt(year), ...Object.fromEntries(Object.entries(marks).map(([k,v]) => [k, v === '' ? null : parseInt(v)])) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Capture results</div>
          <div className="topbar-sub">Enter school and Protec marks per subject</div>
        </div>
        <div className="topbar-right"><span className="role-badge role-badge-admin">Admin</span></div>
      </div>

      <div className="card">
        <div className="card-hd"><i className="ti ti-clipboard-list" />Select learner & term</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Grade</label>
            <select value={grade} onChange={e => setGrade(e.target.value)}>
              <option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Learner</label>
            <select value={learnerId} onChange={e => setLearnerId(e.target.value)}>
              <option value="">— Select learner —</option>
              {learners.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Term</label>
            <select value={term} onChange={e => setTerm(e.target.value)}>
              <option>T1</option><option>T2</option><option>T3</option><option>T4</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <select value={year} onChange={e => setYear(e.target.value)}>
              <option>2025</option><option>2026</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd"><i className="ti ti-pencil" />Enter marks</div>
        <div className="subj-hdr">
          <span>Subject</span><span>School mark</span><span>Protec mark</span><span>Average</span><span>Band</span>
        </div>
        {SUBJECTS.map(s => {
          const a = avg2(marks[`${s.key}_school`], marks[`${s.key}_protec`]);
          const b = band(a);
          return (
            <div key={s.key} className="subj-grid">
              <span style={{fontSize:'12px'}}>{s.label}</span>
              <input className="mark-input" type="number" min="0" max="100" placeholder="0–100"
                value={marks[`${s.key}_school`]}
                onChange={e => setMarks(m => ({...m, [`${s.key}_school`]: e.target.value}))} />
              <input className="mark-input" type="number" min="0" max="100" placeholder="0–100"
                value={marks[`${s.key}_protec`]}
                onChange={e => setMarks(m => ({...m, [`${s.key}_protec`]: e.target.value}))} />
              <div className="avg-display">{a != null ? `${a}%` : '—'}</div>
              <div>{b ? <span className={`mark mark-${b}`}>{a}%</span> : null}</div>
            </div>
          );
        })}
        {error && <div className="login-err" style={{marginTop:'10px'}}>{error}</div>}
        {saved && <div className="saved-note">Results saved successfully.</div>}
        <div style={{marginTop:'12px',display:'flex',justifyContent:'flex-end'}}>
          <button className="btn btn-navy" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save results'}
          </button>
        </div>
      </div>
    </div>
  );
}
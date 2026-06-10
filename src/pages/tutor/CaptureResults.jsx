// src/pages/tutor/CaptureResults.jsx
// Tutor capture results — same logic as admin capture
import { useState, useEffect } from 'react';
import api from '../../api/client.js';

export default function TutorCaptureResults() {
  const [learners, setLearners] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [term, setTerm] = useState('T2');
  const [marks, setMarks] = useState({ math_sch: '', math_pro: '', sci_sch: '', sci_pro: '', eng_sch: '', eng_pro: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    try {
      const { data } = await api.get('/learners');
      setLearners(data);
    } catch (err) {
      console.error('Failed to fetch learners');
    }
  };

  const filteredLearners = gradeFilter 
    ? learners.filter(l => l.grade === gradeFilter) 
    : learners;

  const loadLearnerData = async (learnerId) => {
    if (!learnerId) return;
    setSelectedLearner(learnerId);
    setSaved(false);
    try {
      const { data } = await api.get(`/results?term=${term}&year=2025`);
      const existing = data.find(r => r.learner_id === learnerId);
      if (existing && existing.result_id) {
        setMarks({
          math_sch: existing.math_school || '',
          math_pro: existing.math_protec || '',
          sci_sch: existing.sci_school || '',
          sci_pro: existing.sci_protec || '',
          eng_sch: existing.eng_school || '',
          eng_pro: existing.eng_protec || ''
        });
      } else {
        setMarks({ math_sch: '', math_pro: '', sci_sch: '', sci_pro: '', eng_sch: '', eng_pro: '' });
      }
    } catch (err) {
      console.error('Failed to load existing results');
    }
  };

  const calcAvg = (sch, pro) => {
    const s = parseFloat(sch);
    const p = parseFloat(pro);
    if (isNaN(s) || isNaN(p)) return null;
    return Math.round((s + p) / 2);
  };

  const overallAvg = () => {
    const m = calcAvg(marks.math_sch, marks.math_pro);
    const s = calcAvg(marks.sci_sch, marks.sci_pro);
    const e = calcAvg(marks.eng_sch, marks.eng_pro);
    if (m == null || s == null || e == null) return null;
    return Math.round((m + s + e) / 3);
  };

  const band = v => {
    if (v == null) return 'none';
    if (v < 50) return 'red';
    if (v < 60) return 'yellow';
    if (v < 80) return 'green';
    return 'blue';
  };

  const bandPill = v => {
    if (v == null) return '';
    const b = band(v);
    const labels = { red: 'Below 50%', yellow: '50–59%', green: '60–79%', blue: '80–100%' };
    return <span className={`pill pill-${b}`} style={{ fontSize: '10px', padding: '2px 6px' }}>{labels[b]}</span>;
  };

  const colorFor = v => {
    if (v < 50) return '#791F1F';
    if (v < 60) return '#854F0B';
    if (v < 80) return '#3B6D11';
    return '#185FA5';
  };

  const handleSave = async () => {
    if (!selectedLearner) return;
    setLoading(true);
    try {
      await api.post('/results', {
        learnerId: selectedLearner,
        term,
        year: 2025,
        math_school: marks.math_sch ? parseInt(marks.math_sch) : null,
        math_protec: marks.math_pro ? parseInt(marks.math_pro) : null,
        sci_school: marks.sci_sch ? parseInt(marks.sci_sch) : null,
        sci_protec: marks.sci_pro ? parseInt(marks.sci_pro) : null,
        eng_school: marks.eng_sch ? parseInt(marks.eng_sch) : null,
        eng_protec: marks.eng_pro ? parseInt(marks.eng_pro) : null
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMarks({ math_sch: '', math_pro: '', sci_sch: '', sci_pro: '', eng_sch: '', eng_pro: '' });
    setSaved(false);
  };

  const subjects = [
    { key: 'math', label: 'Mathematics', sch: 'math_sch', pro: 'math_pro' },
    { key: 'sci', label: 'Physical sciences', sch: 'sci_sch', pro: 'sci_pro' },
    { key: 'eng', label: 'English', sch: 'eng_sch', pro: 'eng_pro' }
  ];

  const selectedLearnerData = learners.find(l => l.id === selectedLearner);

  return (
    <div className="view active">
      <div className="topbar">
        <div>
          <div className="topbar-title">Capture results</div>
          <div className="topbar-sub">Record school and Protec marks per learner</div>
        </div>
        <div className="topbar-right">
          <span className="role-badge role-badge-tutor">Tutor</span>
        </div>
      </div>

      <div className="card">
        <div className="card-hd"><i className="ti ti-user-search"></i>Select learner</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Grade</label>
            <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
              <option value="">All grades</option>
              <option>Grade 10</option>
              <option>Grade 11</option>
              <option>Grade 12</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Term</label>
            <select value={term} onChange={e => setTerm(e.target.value)}>
              <option value="T1">Term 1</option>
              <option value="T2">Term 2</option>
              <option value="T3">Term 3</option>
              <option value="T4">Term 4</option>
            </select>
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: '10px' }}>
          <label className="form-label">Learner</label>
          <select value={selectedLearner} onChange={e => loadLearnerData(e.target.value)}>
            <option value="">— select learner —</option>
            {filteredLearners.map(l => (
              <option key={l.id} value={l.id}>{l.full_name} ({l.grade})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedLearner && (
        <div className="card">
          <div className="card-hd">
            <i className="ti ti-clipboard-list"></i>Enter marks
            <span className="card-hd-right">
              <span className="pill pill-blue">{selectedLearnerData?.grade}</span>
            </span>
          </div>
          
          <div className="subj-hdr">
            <span>Subject</span><span>School mark</span><span>Protec mark</span><span>Average</span><span>Band</span>
          </div>
          
          {subjects.map(s => {
            const avg = calcAvg(marks[s.sch], marks[s.pro]);
            return (
              <div className="subj-grid" key={s.key}>
                <span style={{ fontSize: '12px' }}>{s.label}</span>
                <input
                  className="mark-input"
                  type="number"
                  min="0"
                  max="100"
                  value={marks[s.sch]}
                  onChange={e => setMarks(prev => ({ ...prev, [s.sch]: e.target.value }))}
                  placeholder="0–100"
                />
                <input
                  className="mark-input"
                  type="number"
                  min="0"
                  max="100"
                  value={marks[s.pro]}
                  onChange={e => setMarks(prev => ({ ...prev, [s.pro]: e.target.value }))}
                  placeholder="0–100"
                />
                <div className="avg-display" style={{ color: avg != null ? colorFor(avg) : 'var(--text-secondary)' }}>
                  {avg != null ? `${avg}%` : '—'}
                </div>
                <div>{bandPill(avg)}</div>
              </div>
            );
          })}

          <div style={{ marginTop: '10px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Overall average</span>
            <span style={{ fontSize: '16px', fontWeight: '500' }}>{overallAvg() != null ? `${overallAvg()}%` : '—'}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button className="btn btn-navy" onClick={handleSave} disabled={loading}>
              <i className="ti ti-device-floppy" style={{ fontSize: '13px', verticalAlign: '-2px', marginRight: '4px' }}></i>
              {loading ? 'Saving...' : 'Save record'}
            </button>
            <button className="btn" onClick={handleClear}>Clear</button>
          </div>

          {saved && (
            <div className="saved-note" style={{ display: 'block' }}>
              <i className="ti ti-circle-check" style={{ fontSize: '14px', verticalAlign: '-2px', marginRight: '4px' }}></i>
              Record saved successfully.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../../api/client.js';

export default function TutorAttendanceUpload() {
  const [learners, setLearners]     = useState([]);
  const [grade, setGrade]           = useState('Grade 10');
  const [sessionDate, setDate]      = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setType]      = useState('Regular');
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    api.get(`/learners?grade=${grade}`).then(r => {
      setLearners(r.data);
      const init = {};
      r.data.forEach(l => { init[l.id] = 'present'; });
      setAttendance(init);
    }).catch(() => {});
  }, [grade]);

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const records = learners.map(l => ({ learnerId: l.id, status: attendance[l.id] || 'present' }));
      await api.post('/attendance', { sessionDate, sessionType, records });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const statuses = ['present','absent','late'];
  const statusColor = s => s==='present'?'green':s==='absent'?'red':'yellow';

  return (
    <div className="view">
      <div className="topbar">
        <div><div className="topbar-title">Upload attendance</div><div className="topbar-sub">Mark attendance for a session</div></div>
        <div className="topbar-right"><span className="role-badge role-badge-tutor">Tutor</span></div>
      </div>

      <div className="card">
        <div className="card-hd"><i className="ti ti-calendar-check" />Session details</div>
        <div className="form-row-3">
          <div className="form-group"><label className="form-label">Grade</label>
            <select value={grade} onChange={e=>setGrade(e.target.value)}><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></div>
          <div className="form-group"><label className="form-label">Session date</label>
            <input type="date" value={sessionDate} onChange={e=>setDate(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Session type</label>
            <select value={sessionType} onChange={e=>setType(e.target.value)}>
              <option>Regular</option><option>Extra class</option><option>Exam prep</option>
            </select></div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd"><i className="ti ti-users" />Mark attendance ({learners.length} learners)</div>
        <div className="att-hdr">
          <span>Learner</span><span>Present</span><span>Absent</span><span>Late</span>
          <span style={{gridColumn:'span 4'}}></span>
        </div>
        {learners.length === 0 ? <div className="no-data">No learners found for this grade.</div>
          : learners.map(l => (
          <div key={l.id} className="att-grid" style={{gridTemplateColumns:'1.4fr 1fr 1fr 1fr'}}>
            <span style={{fontSize:'12px'}}>{l.full_name}</span>
            {statuses.map(s => (
              <label key={s} style={{display:'flex',alignItems:'center',gap:'5px',cursor:'pointer'}}>
                <input type="radio" className="att-cb" name={`att-${l.id}`} checked={attendance[l.id]===s}
                  onChange={() => setAttendance(a=>({...a,[l.id]:s}))} />
                <span className={`pill pill-${statusColor(s)}`} style={{fontSize:'10px',padding:'2px 6px'}}>{s}</span>
              </label>
            ))}
          </div>
        ))}

        {error && <div className="login-err" style={{marginTop:'10px'}}>{error}</div>}
        {saved && <div className="saved-note">Attendance saved successfully.</div>}
        <div style={{marginTop:'12px',display:'flex',justifyContent:'flex-end'}}>
          <button className="btn btn-navy" onClick={handleSave} disabled={saving || learners.length===0}>
            {saving ? 'Saving...' : 'Save attendance'}
          </button>
        </div>
      </div>
    </div>
  );
}
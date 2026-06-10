import { useState, useEffect } from 'react';
import api from '../../api/client.js';

export default function TutorProgressTracker() {
  const [rows, setRows]       = useState([]);
  const [grade, setGrade]     = useState('');
  const [subject, setSubject] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [r1, r2] = await Promise.all([
        api.get('/results?term=T1&year=2025'),
        api.get('/results?term=T2&year=2025'),
      ]);
      // Build map keyed by learner_id; keep T1 and T2 data SEPARATELY
      const map = {};
      r1.data.forEach(r => {
        map[r.learner_id] = { learner_id: r.learner_id, full_name: r.full_name, grade: r.grade, t1: r };
      });
      r2.data.forEach(r => {
        if (map[r.learner_id]) map[r.learner_id].t2 = r;
        else map[r.learner_id] = { learner_id: r.learner_id, full_name: r.full_name, grade: r.grade, t2: r };
      });
      setRows(Object.values(map));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  function subjectAvg(r, subj) {
    if (!r?.result_id) return null;
    const a = (s, p) => s != null && p != null ? Math.round((s + p) / 2) : null;
    if (subj === 'math') return a(r.math_school, r.math_protec);
    if (subj === 'sci')  return a(r.sci_school, r.sci_protec);
    if (subj === 'eng')  return a(r.eng_school, r.eng_protec);
    const m = a(r.math_school, r.math_protec);
    const s = a(r.sci_school,  r.sci_protec);
    const e = a(r.eng_school,  r.eng_protec);
    return m != null && s != null && e != null ? Math.round((m + s + e) / 3) : null;
  }

  const markEl = v => {
    if (v == null) return <span className="mark-none">—</span>;
    const b = v < 50 ? 'red' : v < 60 ? 'yellow' : v < 80 ? 'green' : 'blue';
    return <span className={`mark mark-${b}`}>{v}%</span>;
  };

  const filtered = grade ? rows.filter(r => r.grade === grade) : rows;

  if (loading) return <div className="view"><div className="no-data">Loading...</div></div>;

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Progress tracker</div>
          <div className="topbar-sub">Term-on-term improvement per learner</div>
        </div>
        <div className="topbar-right">
          <span className="role-badge role-badge-tutor">Tutor</span>
        </div>
      </div>

      <div className="filter-bar">
        <select value={grade} onChange={e => setGrade(e.target.value)} style={{width:'auto',fontSize:'11px',padding:'5px 8px'}}>
          <option value="">All grades</option>
          <option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
        </select>
        <select value={subject} onChange={e => setSubject(e.target.value)} style={{width:'auto',fontSize:'11px',padding:'5px 8px'}}>
          <option value="all">All subjects (avg)</option>
          <option value="math">Mathematics</option>
          <option value="sci">Physical sciences</option>
          <option value="eng">English</option>
        </select>
      </div>

      <div className="card" style={{overflowX:'auto'}}>
        <table style={{tableLayout:'fixed',minWidth:'500px'}}>
          <thead>
            <tr>
              <th style={{width:'140px'}}>Learner</th>
              <th style={{width:'70px'}}>Grade</th>
              <th style={{width:'80px'}}>T1 avg</th>
              <th style={{width:'80px'}}>T2 avg</th>
              <th style={{width:'90px'}}>Change T1→T2</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="5" className="no-data">No data found.</td></tr>
            ) : filtered.map(d => {
              const v1 = subjectAvg(d.t1, subject);
              const v2 = subjectAvg(d.t2, subject);
              let changeEl = <span className="mark-none">—</span>;
              if (v1 != null && v2 != null) {
                const diff = v2 - v1;
                const sign = diff >= 0 ? '+' : '';
                const cls  = diff > 0 ? 'green' : diff < 0 ? 'red' : 'yellow';
                changeEl = <span className={`mark mark-${cls}`}>{sign}{diff}%</span>;
              }
              return (
                <tr key={d.learner_id}>
                  <td>{d.full_name}</td>
                  <td>{d.grade?.replace('Grade ','Gr ')}</td>
                  <td>{markEl(v1)}</td>
                  <td>{markEl(v2)}</td>
                  <td>{changeEl}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../../api/client.js';

export default function AdminProgressTracker() {
  const [t1, setT1] = useState([]);
  const [t2, setT2] = useState([]);
  const [grade, setGrade]   = useState('');
  const [subject, setSubject] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/results?term=T1&year=2025'),
      api.get('/results?term=T2&year=2025'),
    ]).then(([r1, r2]) => { setT1(r1.data); setT2(r2.data); })
    .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const subjAvg = (r, s) => {
    if (!r) return null;
    const a = (x, y) => x != null && y != null ? Math.round((x+y)/2) : null;
    if (s === 'math') return a(r.math_school, r.math_protec);
    if (s === 'sci')  return a(r.sci_school, r.sci_protec);
    if (s === 'eng')  return a(r.eng_school, r.eng_protec);
    const m = a(r.math_school, r.math_protec);
    const sc = a(r.sci_school, r.sci_protec);
    const e = a(r.eng_school, r.eng_protec);
    return m != null && sc != null && e != null ? Math.round((m+sc+e)/3) : null;
  };

  const markEl = v => {
    if (v == null) return <span className="mark-none">—</span>;
    const c = v < 50 ? 'red' : v < 60 ? 'yellow' : v < 80 ? 'green' : 'blue';
    return <span className={`mark mark-${c}`}>{v}%</span>;
  };

  const t1Map = {};
  t1.forEach(r => { t1Map[r.learner_id] = r; });

  const rows = t2
    .filter(r => !grade || r.grade === grade)
    .map(r => ({ ...r, t1row: t1Map[r.learner_id] || null }));

  if (loading) return <div className="view"><div className="no-data">Loading...</div></div>;

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Progress tracker</div>
          <div className="topbar-sub">Term-on-term improvement</div>
        </div>
        <div className="topbar-right"><span className="role-badge role-badge-admin">Admin</span></div>
      </div>

      <div className="filter-bar">
        <select value={grade} onChange={e => setGrade(e.target.value)}>
          <option value="">All grades</option>
          <option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
        </select>
        <select value={subject} onChange={e => setSubject(e.target.value)}>
          <option value="all">All subjects (avg)</option>
          <option value="math">Mathematics</option>
          <option value="sci">Physical sciences</option>
          <option value="eng">English</option>
        </select>
      </div>

      <div className="card" style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr><th>Learner</th><th>Grade</th><th>T1 avg</th><th>T2 avg</th><th>Change</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan="5" className="no-data">No T2 results found.</td></tr>
            ) : rows.map(r => {
              const v1 = subjAvg(r.t1row, subject);
              const v2 = subjAvg(r, subject);
              let changeEl = <span className="mark-none">—</span>;
              if (v1 != null && v2 != null) {
                const diff = v2 - v1;
                const sign = diff >= 0 ? '+' : '';
                const cls = diff > 0 ? 'green' : diff < 0 ? 'red' : 'yellow';
                changeEl = <span className={`mark mark-${cls}`}>{sign}{diff}%</span>;
              }
              return (
                <tr key={r.id}>
                  <td>{r.full_name}</td>
                  <td>{r.grade?.replace('Grade ','Gr ')}</td>
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
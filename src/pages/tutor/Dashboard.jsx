import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import api from '../../api/client.js';

export default function TutorDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats]     = useState({ learners: 0, captured: 0 });
  const [subjBars, setSubjBars] = useState([]);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/learners'), api.get('/results?term=T2&year=2025')])
      .then(([l, r]) => {
        const results = r.data;
        const avg2 = (a, b) => (a == null || b == null) ? null : Math.round((a+b)/2);
        const mA = mean(results.map(r => avg2(r.math_school, r.math_protec)));
        const sA = mean(results.map(r => avg2(r.sci_school,  r.sci_protec)));
        const eA = mean(results.map(r => avg2(r.eng_school,  r.eng_protec)));
        setStats({ learners: l.data.length, captured: results.length });
        setSubjBars([['Mathematics', mA], ['Physical Sciences', sA], ['English', eA]]);
        setRecent(results.slice(0, 5));
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const mean = arr => { const v = arr.filter(x => x != null); return v.length ? Math.round(v.reduce((a,b)=>a+b,0)/v.length) : null; };
  const avg2 = (a, b) => (a == null || b == null) ? null : Math.round((a+b)/2);
  const overallAvg = r => { const m=avg2(r.math_school,r.math_protec),s=avg2(r.sci_school,r.sci_protec),e=avg2(r.eng_school,r.eng_protec); return (m==null||s==null||e==null)?null:Math.round((m+s+e)/3); };
  const bandCls = v => v==null?'none':v<50?'red':v<60?'yellow':v<80?'green':'blue';
  const barColor = v => v==null?'#ccc':v<50?'#791F1F':v<60?'#854F0B':v<80?'#3B6D11':'#185FA5';

  if (loading) return <div className="view"><div className="no-data">Loading...</div></div>;

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-sub">Welcome back, {user?.fullName?.split(' ')[0]}</div>
        </div>
        <div className="topbar-right">
          <span className="role-badge role-badge-tutor">Tutor</span>
          <button className="btn btn-navy btn-sm" onClick={() => navigate('/tutor/capture')}>+ Capture results</button>
        </div>
      </div>

      <div className="metrics">
        <div className="mcard"><div className="mcard-label">Total learners</div><div className="mcard-val">{stats.learners}</div></div>
        <div className="mcard"><div className="mcard-label">Results captured</div><div className="mcard-val">{stats.captured}</div><div className="mcard-sub">T2 2025</div></div>
        <div className="mcard"><div className="mcard-label">Pending</div><div className="mcard-val">{Math.max(0, stats.learners - stats.captured)}</div></div>
        <div className="mcard"><div className="mcard-label">Completion</div><div className="mcard-val">{stats.learners ? Math.round(stats.captured/stats.learners*100) : 0}%</div></div>
      </div>

      <div className="row2">
        <div className="card">
          <div className="card-hd"><i className="ti ti-chart-bar"/>Subject averages — Term 2</div>
          {subjBars.map(([name, val]) => (
            <div key={name} className="pbar-wrap">
              <div className="pbar-lbl">{name}</div>
              <div className="pbar-bg">
                <div className="pbar-fill" style={{width:`${val||0}%`, background:barColor(val)}}/>
              </div>
              <div className="pbar-pct">{val != null ? `${val}%` : '—'}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-hd"><i className="ti ti-table"/>Recent captures</div>
          {recent.length === 0
            ? <div className="no-data">No results captured yet.</div>
            : (
              <table>
                <thead><tr><th>Learner</th><th>Grade</th><th>Term</th><th>Avg</th></tr></thead>
                <tbody>
                  {recent.map(r => {
                    const a = overallAvg(r);
                    return (
                      <tr key={r.id}>
                        <td>{r.full_name}</td>
                        <td>{r.grade}</td>
                        <td>{r.term} {r.year}</td>
                        <td>{a != null ? <span className={`mark mark-${bandCls(a)}`}>{a}%</span> : <span className="mark-none">—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          }
        </div>
      </div>
    </div>
  );
}
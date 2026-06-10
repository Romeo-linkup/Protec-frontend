import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import api from '../../api/client.js';

export default function TutorDashboard() {
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();
  const [stats, setStats]   = useState({ learners:0, captured:0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/learners'), api.get('/results?term=T2&year=2025')])
      .then(([l, r]) => {
        setStats({ learners: l.data.length, captured: r.data.length });
        setRecent(r.data.slice(0,5));
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const avg = r => {
    const v = [r.math_school,r.math_protec,r.sci_school,r.sci_protec,r.eng_school,r.eng_protec].filter(x=>x!=null);
    return v.length ? Math.round(v.reduce((a,b)=>a+b,0)/v.length) : null;
  };

  if (loading) return <div className="view"><div className="no-data">Loading...</div></div>;

  return (
    <div className="view">
      <div className="topbar">
        <div><div className="topbar-title">Dashboard</div><div className="topbar-sub">Welcome back, {user?.fullName?.split(' ')[0]}</div></div>
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

      <div className="card">
        <div className="card-hd"><i className="ti ti-table" />Recent captures</div>
        {recent.length === 0 ? <div className="no-data">No results captured yet.</div> : (
          <table>
            <thead><tr><th>Learner</th><th>Grade</th><th>Term</th><th>Overall avg</th></tr></thead>
            <tbody>
              {recent.map(r => {
                const a = avg(r);
                const c = a==null?'none':a<50?'red':a<60?'yellow':a<80?'green':'blue';
                return <tr key={r.id}><td>{r.full_name}</td><td>{r.grade}</td><td>{r.term} {r.year}</td><td>{a!=null?<span className={`mark mark-${c}`}>{a}%</span>:<span className="mark-none">—</span>}</td></tr>;
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ learners: 0, results: 0, interventions: 0, notifications: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/learners'),
      api.get('/results?year=2025&term=T2'),
      api.get('/interventions'),
    ]).then(([l, r, i]) => {
      setStats({ learners: l.data.length, results: r.data.length, interventions: i.data.length });
      setRecent(r.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const avg = r => {
    const vals = [r.math_school, r.math_protec, r.sci_school, r.sci_protec, r.eng_school, r.eng_protec].filter(v => v != null);
    return vals.length ? Math.round(vals.reduce((a,b) => a+b, 0) / vals.length) : null;
  };

  if (loading) return <div className="view"><div className="no-data">Loading...</div></div>;

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-sub">Protec INK branch overview</div>
        </div>
        <div className="topbar-right">
          <span className="role-badge role-badge-admin">Admin</span>
          <button className="btn btn-navy btn-sm" onClick={() => navigate('/admin/capture')}>+ Capture results</button>
        </div>
      </div>

      <div className="metrics">
        <div className="mcard"><div className="mcard-label">Total learners</div><div className="mcard-val">{stats.learners}</div></div>
        <div className="mcard"><div className="mcard-label">Results captured</div><div className="mcard-val">{stats.results}</div><div className="mcard-sub">T2 2025</div></div>
        <div className="mcard"><div className="mcard-label">Interventions</div><div className="mcard-val">{stats.interventions}</div></div>
        <div className="mcard"><div className="mcard-label">Pending capture</div><div className="mcard-val">{Math.max(0, stats.learners - stats.results)}</div></div>
      </div>

      <div className="card">
        <div className="card-hd"><i className="ti ti-trophy" />Academic rankings — T2 2025</div>
        {recent.length === 0 ? <div className="no-data">No results captured yet.</div> : (
          <table>
            <thead>
              <tr><th>#</th><th>Learner</th><th>Grade</th><th>Overall avg</th><th>Band</th></tr>
            </thead>
            <tbody>
              {[...recent]
                .map(r => ({ ...r, oa: avg(r) }))
                .filter(r => r.oa != null)
                .sort((a, b) => b.oa - a.oa)
                .map((r, i) => {
                  const cls = r.oa < 50 ? 'red' : r.oa < 60 ? 'yellow' : r.oa < 80 ? 'green' : 'blue';
                  const band = r.oa >= 80 ? 'Distinction' : r.oa >= 60 ? 'Merit' : r.oa >= 50 ? 'Pass' : 'Below pass';
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight:600, color:'var(--color-text-secondary)', width:32 }}>{i+1}</td>
                      <td>{r.full_name}</td>
                      <td>{r.grade}</td>
                      <td><span className={`mark mark-${cls}`}>{r.oa}%</span></td>
                      <td><span className={`pill pill-${cls}`}>{band}</span></td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
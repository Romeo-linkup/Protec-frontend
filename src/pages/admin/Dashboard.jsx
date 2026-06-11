import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ learners: 0, captured: 0, passRate: null, topSubj: null, topAvg: null });
  const [subjBars, setSubjBars] = useState([]);
  const [gradeBreakdown, setGradeBreakdown] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/learners'),
      api.get('/results?year=2025&term=T2'),
    ]).then(([l, r]) => {
      const learners = l.data;
      const results  = r.data;

      // Subject averages
      const mathAvgs = results.map(r => avg2(r.math_school, r.math_protec)).filter(v => v != null);
      const sciAvgs  = results.map(r => avg2(r.sci_school,  r.sci_protec)).filter(v => v != null);
      const engAvgs  = results.map(r => avg2(r.eng_school,  r.eng_protec)).filter(v => v != null);
      const mA = mathAvgs.length ? Math.round(mathAvgs.reduce((a,b)=>a+b,0)/mathAvgs.length) : null;
      const sA = sciAvgs.length  ? Math.round(sciAvgs.reduce((a,b)=>a+b,0)/sciAvgs.length)  : null;
      const eA = engAvgs.length  ? Math.round(engAvgs.reduce((a,b)=>a+b,0)/engAvgs.length)  : null;

      // Pass rate
      const overalls = results.map(r => overallAvg(r)).filter(v => v != null);
      const passRate = overalls.length ? Math.round(overalls.filter(v => v >= 50).length / overalls.length * 100) : null;

      // Top subject
      const subjMap = [['Mathematics', mA], ['Sciences', sA], ['English', eA]].filter(([,v]) => v != null);
      const top = subjMap.sort((a,b) => b[1]-a[1])[0] || null;

      // Grade breakdown
      const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
      const breakdown = grades.map(g => {
        const gl = learners.filter(l => l.grade === g);
        const gr = results.filter(r => r.grade === g);
        const avgs = gr.map(r => overallAvg(r)).filter(v => v != null);
        const avg  = avgs.length ? Math.round(avgs.reduce((a,b)=>a+b,0)/avgs.length) : null;
        const pr   = avgs.length ? Math.round(avgs.filter(v=>v>=50).length/avgs.length*100) : null;
        return { grade: g, count: gl.length, avg, passRate: pr };
      });

      // At-risk
      const risk = results.filter(r =>
        (r.math_school != null && r.math_school < 50) ||
        (r.math_protec != null && r.math_protec < 50) ||
        (r.sci_school  != null && r.sci_school  < 50) ||
        (r.sci_protec  != null && r.sci_protec  < 50) ||
        (r.eng_school  != null && r.eng_school  < 50) ||
        (r.eng_protec  != null && r.eng_protec  < 50)
      );

      setStats({ learners: learners.length, captured: results.length, passRate, topSubj: top?.[0], topAvg: top?.[1] });
      setSubjBars([['Mathematics', mA], ['Physical Sciences', sA], ['English', eA]]);
      setGradeBreakdown(breakdown);
      setAtRisk(risk);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const avg2 = (a, b) => (a == null || b == null) ? null : Math.round((a + b) / 2);
  const overallAvg = r => {
    const m = avg2(r.math_school, r.math_protec);
    const s = avg2(r.sci_school,  r.sci_protec);
    const e = avg2(r.eng_school,  r.eng_protec);
    if (m == null || s == null || e == null) return null;
    return Math.round((m + s + e) / 3);
  };
  const bandCls = v => v == null ? 'none' : v < 50 ? 'red' : v < 60 ? 'yellow' : v < 80 ? 'green' : 'blue';
  const barColor = v => v == null ? '#ccc' : v < 50 ? '#791F1F' : v < 60 ? '#854F0B' : v < 80 ? '#3B6D11' : '#185FA5';

  if (loading) return <div className="view"><div className="no-data">Loading...</div></div>;

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Dashboard — Protec INK</div>
          <div className="topbar-sub">2025 academic year</div>
        </div>
        <div className="topbar-right">
          <span className="role-badge role-badge-admin">Admin</span>
          <span className="pill pill-yellow"><i className="ti ti-clock" style={{fontSize:11,verticalAlign:-1,marginRight:2}}/>Term 3 in progress</span>
          <button className="btn btn-navy btn-sm" onClick={() => navigate('/admin/capture')}>+ Capture results</button>
        </div>
      </div>

      <div className="metrics">
        <div className="mcard">
          <div className="mcard-label">Total learners</div>
          <div className="mcard-val">{stats.learners}</div>
          <div className="mcard-sub">Grades 10, 11, 12</div>
        </div>
        <div className="mcard">
          <div className="mcard-label">Results captured (T2)</div>
          <div className="mcard-val">{stats.captured}</div>
          <div className="mcard-sub">of {stats.learners} learners</div>
        </div>
        <div className="mcard">
          <div className="mcard-label">Branch pass rate (T2)</div>
          <div className="mcard-val">{stats.passRate != null ? `${stats.passRate}%` : '—'}</div>
          <div className="mcard-sub">Above 50%</div>
        </div>
        <div className="mcard">
          <div className="mcard-label">Top subject (T2)</div>
          <div className="mcard-val" style={{fontSize:14,paddingTop:4}}>{stats.topSubj || '—'}</div>
          <div className="mcard-sub">{stats.topAvg != null ? `${stats.topAvg}% avg` : '—'}</div>
        </div>
      </div>

      <div className="row2">
        <div className="card">
          <div className="card-hd"><i className="ti ti-chart-bar"/>Subject averages — Term 2</div>
          {subjBars.map(([name, val]) => (
            <div key={name} className="pbar-wrap">
              <div className="pbar-lbl">{name}</div>
              <div className="pbar-bg">
                <div className="pbar-fill" style={{width: `${val || 0}%`, background: barColor(val)}}/>
              </div>
              <div className="pbar-pct">{val != null ? `${val}%` : '—'}</div>
            </div>
          ))}
          <div style={{marginTop:10,paddingTop:8,borderTop:'0.5px solid var(--color-border-tertiary)'}}>
            <div className="legend">
              {[['#791F1F','Below 50%'],['#854F0B','50–59%'],['#3B6D11','60–79%'],['#185FA5','80–100%']].map(([c,l]) => (
                <div key={l} className="leg-item"><div className="leg-dot" style={{background:c}}/>{l}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hd"><i className="ti ti-users"/>Grade breakdown — Term 2</div>
          <table>
            <thead><tr><th>Grade</th><th>Learners</th><th>Avg mark</th><th>Pass rate</th></tr></thead>
            <tbody>
              {gradeBreakdown.map(g => (
                <tr key={g.grade}>
                  <td>{g.grade}</td>
                  <td>{g.count}</td>
                  <td>{g.avg != null ? <span className={`mark mark-${bandCls(g.avg)}`}>{g.avg}%</span> : <span className="mark-none">—</span>}</td>
                  <td>{g.passRate != null ? <span className={`mark mark-${bandCls(g.passRate)}`}>{g.passRate}%</span> : <span className="mark-none">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-hd"><i className="ti ti-alert-triangle"/>At-risk learners — below 50% in any subject (T2)</div>
        {atRisk.length === 0
          ? <div className="no-data">No at-risk learners. Great work!</div>
          : (
            <table>
              <thead>
                <tr><th>Learner</th><th>Grade</th><th>Math (Sch/Pro)</th><th>Sci (Sch/Pro)</th><th>Eng (Sch/Pro)</th><th>Avg</th></tr>
              </thead>
              <tbody>
                {atRisk.map(r => {
                  const oa = overallAvg(r);
                  return (
                    <tr key={r.id}>
                      <td>{r.full_name}</td>
                      <td>{r.grade}</td>
                      <td><span className={`mark mark-${bandCls(r.math_school)}`}>{r.math_school ?? '—'}</span> / <span className={`mark mark-${bandCls(r.math_protec)}`}>{r.math_protec ?? '—'}</span></td>
                      <td><span className={`mark mark-${bandCls(r.sci_school)}`}>{r.sci_school ?? '—'}</span> / <span className={`mark mark-${bandCls(r.sci_protec)}`}>{r.sci_protec ?? '—'}</span></td>
                      <td><span className={`mark mark-${bandCls(r.eng_school)}`}>{r.eng_school ?? '—'}</span> / <span className={`mark mark-${bandCls(r.eng_protec)}`}>{r.eng_protec ?? '—'}</span></td>
                      <td>{oa != null ? <span className={`mark mark-${bandCls(oa)}`}>{oa}%</span> : <span className="mark-none">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  );
}
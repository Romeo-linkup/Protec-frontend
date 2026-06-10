import { useState, useEffect } from 'react';
import api from '../../api/client.js';

export default function AdminBranchReport() {
  const [rows, setRows]   = useState([]);
  const [term, setTerm]   = useState('T2');
  const [year, setYear]   = useState('2025');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReport(); }, [term, year]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/branch?term=${term}&year=${year}`);
      setRows(data);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };

  const markEl = v => {
    if (v == null) return <span className="mark-none">—</span>;
    const c = v < 50 ? 'red' : v < 60 ? 'yellow' : v < 80 ? 'green' : 'blue';
    return <span className={`mark mark-${c}`}>{v}%</span>;
  };

  const totals = rows.reduce((acc, r) => ({
    learners: acc.learners + parseInt(r.total_learners||0),
    math: acc.math + parseFloat(r.math_avg||0),
    sci:  acc.sci  + parseFloat(r.sci_avg||0),
    eng:  acc.eng  + parseFloat(r.eng_avg||0),
  }), {learners:0,math:0,sci:0,eng:0});

  return (
    <div className="view">
      <div className="topbar">
        <div><div className="topbar-title">Branch report</div><div className="topbar-sub">Performance summary by grade</div></div>
        <div className="topbar-right">
          <span className="role-badge role-badge-admin">Admin</span>
          <select value={term} onChange={e=>setTerm(e.target.value)} style={{fontSize:'11px',padding:'5px 8px',width:'auto'}}>
            <option>T1</option><option>T2</option><option>T3</option><option>T4</option>
          </select>
          <select value={year} onChange={e=>setYear(e.target.value)} style={{fontSize:'11px',padding:'5px 8px',width:'auto'}}>
            <option>2025</option><option>2026</option>
          </select>
        </div>
      </div>

      <div className="metrics-3">
        <div className="mcard"><div className="mcard-label">Total learners</div><div className="mcard-val">{totals.learners}</div></div>
        <div className="mcard"><div className="mcard-label">Avg math</div><div className="mcard-val">{rows.length ? Math.round(totals.math/rows.length) : '—'}%</div></div>
        <div className="mcard"><div className="mcard-label">Avg sciences</div><div className="mcard-val">{rows.length ? Math.round(totals.sci/rows.length) : '—'}%</div></div>
      </div>

      <div className="card" id="branch-report-content">
        {loading ? <div className="no-data">Loading...</div> : rows.length === 0 ? (
          <div className="no-data">No results for {term} {year}.</div>
        ) : (
          <table>
            <thead><tr><th>Grade</th><th>Learners</th><th>Math avg</th><th>Sci avg</th><th>Eng avg</th><th>Pass rate</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.grade}>
                  <td>{r.grade}</td>
                  <td>{r.total_learners}</td>
                  <td>{markEl(r.math_avg ? Math.round(r.math_avg) : null)}</td>
                  <td>{markEl(r.sci_avg  ? Math.round(r.sci_avg)  : null)}</td>
                  <td>{markEl(r.eng_avg  ? Math.round(r.eng_avg)  : null)}</td>
                  <td>{r.pass_rate != null ? <span className={`mark mark-${r.pass_rate<50?'red':r.pass_rate<75?'yellow':'green'}`}>{r.pass_rate}%</span> : <span className="mark-none">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
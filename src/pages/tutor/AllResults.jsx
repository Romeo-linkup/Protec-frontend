import { useState, useEffect } from 'react';
import api from '../../api/client.js';

export default function TutorAllResults() {
  const [rows, setRows]         = useState([]);
  const [attRates, setAttRates] = useState({});
  const [grade, setGrade]       = useState('');
  const [term, setTerm]         = useState('T2');
  const [year, setYear]         = useState('2025');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchData(); }, [grade, term, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ term, year });
      if (grade) p.append('grade', grade);
      const [resultsRes, attRes] = await Promise.all([
        api.get(`/results?${p}`),
        api.get(`/attendance/rates?term=${term}&year=${year}`),
      ]);
      setRows(resultsRes.data);
      setAttRates(attRes.data);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };

  const a2=(a,b)=>a!=null&&b!=null?Math.round((a+b)/2):null;

  const markEl = v => {
    if (v==null) return <span className="mark-none">—</span>;
    const c=v<50?'red':v<60?'yellow':v<80?'green':'blue';
    return <span className={`mark mark-${c}`}>{v}%</span>;
  };

  const attEl = v => {
    if (v==null) return <span className="mark-none">—</span>;
    const c=v<60?'red':v<80?'yellow':'green';
    return <span className={`mark mark-${c}`}>{v}%</span>;
  };

  const filtered = search
    ? rows.filter(r=>r.full_name.toLowerCase().includes(search.toLowerCase()))
    : rows;

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">View results</div>
          <div className="topbar-sub">{filtered.length} learners</div>
        </div>
        <div className="topbar-right"><span className="role-badge role-badge-tutor">Tutor</span></div>
      </div>
      <div className="filter-bar">
        <select value={grade} onChange={e=>setGrade(e.target.value)}>
          <option value="">All grades</option>
          <option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
        </select>
        <select value={term} onChange={e=>setTerm(e.target.value)}>
          <option>T1</option><option>T2</option><option>T3</option><option>T4</option>
        </select>
        <select value={year} onChange={e=>setYear(e.target.value)}>
          <option>2025</option><option>2026</option>
        </select>
        <input className="search-bar" placeholder="Search learner..."
          value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      <div className="card" style={{overflowX:'auto'}}>
        {loading ? <div className="no-data">Loading...</div> : (
          <table>
            <thead>
              <tr>
                <th>Learner</th><th>Grade</th>
                <th>Math avg</th><th>Sci avg</th><th>Eng avg</th>
                <th>Overall</th><th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan="7" className="no-data">No results found.</td></tr>
              ) : filtered.map(r => {
                const ma=a2(r.math_school,r.math_protec);
                const sa=a2(r.sci_school,r.sci_protec);
                const ea=a2(r.eng_school,r.eng_protec);
                const oa=ma!=null&&sa!=null&&ea!=null?Math.round((ma+sa+ea)/3):null;
                const att=attRates[r.learner_id]??null;
                return (
                  <tr key={r.id}>
                    <td>{r.full_name}</td>
                    <td>{r.grade?.replace('Grade ','Gr ')}</td>
                    <td>{markEl(ma)}</td><td>{markEl(sa)}</td><td>{markEl(ea)}</td>
                    <td>{markEl(oa)}</td>
                    <td>{attEl(att)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
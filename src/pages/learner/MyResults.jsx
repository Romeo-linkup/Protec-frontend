import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import api from '../../api/client.js';
import { getCurrentTermAndYear, getYearOptions } from '../../utils/termUtils.js';

const REMARKS = {
  distinction: [
    "Outstanding — you're leading the pack. Keep that standard high!",
    "Top performer! Your dedication is setting the benchmark.",
    "Exceptional work. Distinction level speaks for itself — stay hungry.",
    "You're excelling at the highest level. Protec INK is proud of you.",
    "Brilliant results. The top of the class is where you belong.",
  ],
  merit: [
    "Strong performance — distinction is well within your reach.",
    "You're doing great. One more push and the top spots are yours.",
    "Solid merit results. Your consistency is a real asset.",
    "Well done! Keep building momentum and distinction will follow.",
    "Great effort — you're on the right side of the class average.",
  ],
  pass: [
    "You're passing — now let's build on that foundation.",
    "Good effort. Every mark you earn counts. Keep going!",
    "Passing is a stepping stone. Aim higher next term.",
    "You showed up and delivered. Let's push for more next time.",
    "Steady progress. Stay consistent and the results will come.",
  ],
  below: [
    "This term was tough, but it's not your final chapter. Let's go again.",
    "Don't be discouraged — every struggle is building your strength.",
    "You have more in you than these marks show. Reach out for support.",
    "We believe in your potential. Let's make next term different.",
    "The comeback is always stronger than the setback. Keep going.",
  ],
};

function getRemark(avg, seed) {
  const bucket = avg >= 80 ? 'distinction' : avg >= 60 ? 'merit' : avg >= 50 ? 'pass' : 'below';
  const arr = REMARKS[bucket];
  return arr[seed % arr.length];
}

export default function MyResults() {
  const { user } = useContext(AuthContext);
  const { term: defaultTerm, year: defaultYear } = getCurrentTermAndYear();
  const [rankTerm, setRankTerm] = useState(defaultTerm);
  const [rankYear, setRankYear] = useState(defaultYear);
  const [results, setResults]   = useState([]);
  const [rankings, setRankings] = useState({});
  const [loading, setLoading]   = useState(true);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    if (!user?.learnerId) return;
    Promise.all([
      api.get(`/results/${user.learnerId}/my`),
      api.get(`/results?term=${rankTerm}&year=${rankYear}`),
      api.get(`/attendance/rate/${user.learnerId}`),
    ]).then(([myRes, awardsRes, attRes]) => {
      setResults(myRes.data);
      setAttendance(attRes.data);

      const t2 = awardsRes.data;
      const overall = r => {
        const a2=(x,y)=>x!=null&&y!=null?Math.round((x+y)/2):null;
        const m=a2(r.math_school,r.math_protec),s=a2(r.sci_school,r.sci_protec),e=a2(r.eng_school,r.eng_protec);
        return m!=null&&s!=null&&e!=null?Math.round((m+s+e)/3):null;
      };
      const sorted=[...t2].map(r=>({...r,avg:overall(r)})).filter(x=>x.avg!=null).sort((a,b)=>b.avg-a.avg);
      const myRank=sorted.findIndex(r=>r.learner_id===user.learnerId)+1;
      const total=sorted.length;
      const myAvg=sorted.find(r=>r.learner_id===user.learnerId)?.avg??null;
      setRankings({ rank:myRank||null, total, avg:myAvg });
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, [user, rankTerm, rankYear]);

  const a2 = (a,b) => a!=null&&b!=null ? Math.round((a+b)/2) : null;

  const markEl = v => {
    if (v==null) return <span className="mark-none">—</span>;
    const c = v<50?'red':v<60?'yellow':v<80?'green':'blue';
    return <span className={`mark mark-${c}`}>{v}%</span>;
  };

  if (loading) return <div className="view"><div className="no-data">Loading your results...</div></div>;

  const seed = user?.fullName?.length || 3;

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">My results</div>
          <div className="topbar-sub">{user?.fullName}</div>
        </div>
        <div className="topbar-right">
          <select className="btn btn-sm" style={{fontWeight:400}} value={rankTerm} onChange={e=>setRankTerm(e.target.value)}>
            <option>T1</option><option>T2</option><option>T3</option><option>T4</option>
          </select>
          <select className="btn btn-sm" style={{fontWeight:400}} value={rankYear} onChange={e=>setRankYear(e.target.value)}>
            {getYearOptions().map(y=><option key={y}>{y}</option>)}
          </select>
          <span className="role-badge role-badge-learner">Learner</span>
        </div>
      </div>

      {rankings.rank && rankings.avg != null && (
        <div className="card" style={{
          background: rankings.avg >= 80 ? 'var(--blue-bg)' : rankings.avg >= 60 ? 'var(--green-bg)' : rankings.avg >= 50 ? 'var(--yellow-bg)' : 'var(--red-light)',
          border: `0.5px solid ${rankings.avg >= 80 ? 'var(--blue-border)' : rankings.avg >= 60 ? 'var(--green-border)' : rankings.avg >= 50 ? 'var(--yellow-border)' : '#f5c6c6'}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: rankings.avg >= 80 ? 'var(--blue-text)' : rankings.avg >= 60 ? 'var(--green-text)' : rankings.avg >= 50 ? 'var(--yellow-text)' : 'var(--red-dark)',
              }}>
                Class ranking (${rankTerm} ${rankYear}) — #{rankings.rank} of {rankings.total}
              </div>
              <div style={{
                fontSize: 11, marginTop: 5, fontStyle: 'italic',
                color: rankings.avg >= 80 ? 'var(--blue-text)' : rankings.avg >= 60 ? 'var(--green-text)' : rankings.avg >= 50 ? 'var(--yellow-text)' : 'var(--red-dark)',
              }}>
                "{getRemark(rankings.avg, seed)}"
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {rankings.avg}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{rankTerm} {rankYear} overall avg</div>
            </div>
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <div className="card"><div className="no-data">No results captured yet. Check back after your term results have been entered.</div></div>
      ) : results.map(r => {
        const ma=a2(r.math_school,r.math_protec), sa=a2(r.sci_school,r.sci_protec), ea=a2(r.eng_school,r.eng_protec);
        const oa=ma!=null&&sa!=null&&ea!=null ? Math.round((ma+sa+ea)/3) : null;
        return (
          <div key={r.id} className="card">
            <div className="card-hd">
              <i className="ti ti-chart-bar" />{r.term} {r.year}
              <div className="card-hd-right">{markEl(oa)}</div>
            </div>
            <div className="subj-hdr">
              <span>Subject</span><span>School</span><span>Protec</span><span>Average</span><span>Band</span>
            </div>
            {[
              { label:'Mathematics',        sch:r.math_school, pro:r.math_protec, avg:ma },
              { label:'Physical sciences',  sch:r.sci_school,  pro:r.sci_protec,  avg:sa },
              { label:'English',            sch:r.eng_school,  pro:r.eng_protec,  avg:ea },
            ].map(s => (
              <div key={s.label} className="subj-grid">
                <span style={{ fontSize:'12px' }}>{s.label}</span>
                {markEl(s.sch)}{markEl(s.pro)}{markEl(s.avg)}
                <span>
                  {s.avg != null
                    ? <span className={`pill pill-${s.avg<50?'red':s.avg<60?'yellow':s.avg<80?'green':'blue'}`}>
                        {s.avg<50?'Below pass':s.avg<60?'Pass':s.avg<80?'Merit':'Distinction'}
                      </span>
                    : null}
                </span>
              </div>
            ))}
            {attendance[r.term] && attendance[r.term].total > 0 && (
              <div style={{
                marginTop: 10, padding: '8px 10px',
                background: 'var(--color-background-secondary)',
                borderRadius: 6, display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
                <div style={{fontSize:11, color:'var(--color-text-secondary)'}}>
                  <i className="ti ti-calendar-check" style={{marginRight:4}} />
                  Attendance — {r.term} {r.year}
                </div>
                <div style={{display:'flex', gap:12, alignItems:'center'}}>
                  <span style={{fontSize:11, color:'var(--color-text-secondary)'}}>
                    {attendance[r.term].present} present · {attendance[r.term].late} late · {attendance[r.term].absent} absent
                  </span>
                  {attendance[r.term].rate != null && (
                    <span className={`mark mark-${attendance[r.term].rate<60?'red':attendance[r.term].rate<80?'yellow':'green'}`}>
                      {attendance[r.term].rate}%
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
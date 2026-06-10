import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import api from '../../api/client.js';

export default function ParentProgressReport() {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [learner, setLearner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.learnerId) return;
    Promise.all([
      api.get(`/results/${user.learnerId}/parent`),
      api.get(`/attendance/learner/${user.learnerId}`),
      api.get(`/learners/${user.learnerId}/parent-view`),
    ]).then(([r, a, l]) => {
      setResults(r.data); setAttendance(a.data); setLearner(l.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const a2=(a,b)=>a!=null&&b!=null?Math.round((a+b)/2):null;
  const markEl=v=>{
    if(v==null) return <span className="mark-none">—</span>;
    const c=v<50?'red':v<60?'yellow':v<80?'green':'blue';
    return <span className={`mark mark-${c}`}>{v}%</span>;
  };

  const attSummary = () => {
    const total = attendance.length;
    const present = attendance.filter(a=>a.status==='present').length;
    const rate = total ? Math.round(present/total*100) : null;
    return { total, present, rate };
  };

  if (loading) return <div className="view"><div className="no-data">Loading...</div></div>;

  const att = attSummary();

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Progress report</div>
          <div className="topbar-sub">{learner?.full_name} · {learner?.grade}</div>
        </div>
        <div className="topbar-right"><span className="role-badge role-badge-parent">Parent</span></div>
      </div>

      <div className="metrics-3">
        <div className="mcard"><div className="mcard-label">Terms on record</div><div className="mcard-val">{results.length}</div></div>
        <div className="mcard"><div className="mcard-label">Sessions attended</div><div className="mcard-val">{att.present}/{att.total}</div></div>
        <div className="mcard"><div className="mcard-label">Attendance rate</div><div className="mcard-val">{att.rate!=null?`${att.rate}%`:'—'}</div></div>
      </div>

      {results.length === 0 ? (
        <div className="card"><div className="no-data">No results available yet.</div></div>
      ) : results.map(r => {
        const ma=a2(r.math_school,r.math_protec), sa=a2(r.sci_school,r.sci_protec), ea=a2(r.eng_school,r.eng_protec);
        const oa=ma!=null&&sa!=null&&ea!=null?Math.round((ma+sa+ea)/3):null;
        return (
          <div key={r.id} className="card" id="parent-report-content">
            <div className="card-hd"><i className="ti ti-report" />{r.term} {r.year}
              <div className="card-hd-right">{markEl(oa)}</div>
            </div>
            {[{label:'Mathematics',avg:ma},{label:'Physical sciences',avg:sa},{label:'English',avg:ea}].map(s=>(
              <div key={s.label} className="rc-row">
                <div className="rc-subj">{s.label}</div>
                <div className="rc-vals">{markEl(s.avg)}</div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import api from '../../api/client.js';
import { getCurrentTermAndYear, getYearOptions } from '../../utils/termUtils.js';

const COMMENTS = {
  distinction: ["Exceptional work — you're setting the standard!","Outstanding performance. Your dedication truly shows.","Top of the class! Keep pushing those boundaries.","Brilliant results — you make Protec INK proud.","Remarkable. Stay hungry, stay focused."],
  merit: ["Strong performance — you're on the right track!","Great work. A little more push and you'll reach distinction.","Solid results. Your consistency is paying off.","Well done! Keep building on this momentum.","Impressive effort — the top spots are within reach."],
  pass: ["Good effort. Every mark counts — keep going!","You're making progress. Stay consistent.","Passing is just the beginning — aim higher next term.","Keep showing up. It's working.","Small improvements add up to big wins."],
  below: ["Don't give up — every challenge is a chance to grow.","We believe in you. Let's turn this around together.","Struggles now make success sweeter later.","You are more capable than these marks show.","This is not your ceiling. Keep fighting."],
};

function getComment(avg, seed) {
  const bucket = avg >= 80 ? 'distinction' : avg >= 60 ? 'merit' : avg >= 50 ? 'pass' : 'below';
  return COMMENTS[bucket][seed % COMMENTS[bucket].length];
}

const MEDALS = ['🥇','🥈','🥉'];
const MEDAL_CLS = ['gold','silver','bronze'];

const SUBJECTS = [
  { label: 'Mathematics',        schoolKey: 'math_school' },
  { label: 'Physical Sciences',  schoolKey: 'sci_school'  },
  { label: 'English',            schoolKey: 'eng_school'  },
];

const TAB_STYLE = (active) => ({
  padding: '6px 16px',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
  borderRadius: '6px',
  border: '0.5px solid',
  borderColor: active ? 'var(--navy)' : 'var(--color-border-secondary)',
  background: active ? 'var(--navy)' : 'var(--color-background-primary)',
  color: active ? '#fff' : 'var(--color-text-secondary)',
});

function SubjectRankList({ data, schoolKey, currentLearnerId }) {
  const ranked = [...data]
    .filter(r => r[schoolKey] != null)
    .sort((a, b) => b[schoolKey] - a[schoolKey])
    .slice(0, 10);

  const myRank = ranked.findIndex(r => r.learner_id === currentLearnerId) + 1;

  return (
    <>
      {myRank > 0 && (
        <div style={{ background:'var(--blue-bg)', border:'0.5px solid var(--blue-border)', borderRadius:'6px', padding:'7px 10px', marginBottom:'8px', fontSize:'11px', color:'var(--blue-text)', fontWeight:500 }}>
          Your ranking in this subject — #{myRank} of {ranked.length}
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
        {ranked.map((x, i) => {
          const isMe = x.learner_id === currentLearnerId;
          return (
            <div key={x.learner_id} style={{
              background: isMe ? 'var(--blue-bg)' : i < 3 ? 'var(--color-background-primary)' : 'var(--color-background-secondary)',
              border: isMe ? '0.5px solid var(--blue-border)' : '0.5px solid var(--color-border-tertiary)',
              borderRadius: '8px', padding: '10px 12px',
              display: 'flex', alignItems: 'flex-start', gap: '10px',
            }}>
              {i < 3 ? (
                <div className={`award-icon ${MEDAL_CLS[i]}`}>{MEDALS[i]}</div>
              ) : (
                <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--color-background-tertiary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:600, color:'var(--color-text-secondary)', flexShrink:0 }}>
                  {i + 1}
                </div>
              )}
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div className="award-name">
                    {x.full_name}{isMe && <span style={{ fontSize:'10px', color:'var(--blue-text)', marginLeft:4 }}>(you)</span>}
                  </div>
                  <span className={`mark mark-${x[schoolKey]>=80?'blue':x[schoolKey]>=60?'green':x[schoolKey]>=50?'yellow':'red'}`}>
                    {x[schoolKey]}%
                  </span>
                </div>
                <div className="award-detail" style={{ marginTop:2 }}>{x.grade}</div>
              </div>
            </div>
          );
        })}
        {ranked.length === 0 && <div className="no-data">No results yet.</div>}
      </div>
    </>
  );
}

export default function LearnerAwards() {
  const { user } = useContext(AuthContext);
  const { term: defaultTerm, year: defaultYear } = getCurrentTermAndYear();
  const [term, setTerm] = useState(defaultTerm);
  const [year, setYear] = useState(defaultYear);
  const [tab, setTab] = useState('overall');
  const [data, setData] = useState({ t1:[], t2:[] });
  const [loading, setLoading] = useState(true);

  const termOrder = ['T1','T2','T3','T4'];
  const tIdx = termOrder.indexOf(term);
  const prevTerm = tIdx > 0 ? termOrder[tIdx - 1] : null;
  const prevYear = (tIdx === 0 && parseInt(year) > 2025) ? String(parseInt(year) - 1) : year;

  useEffect(() => {
    setLoading(true);
    const fetches = [
      prevTerm
        ? api.get(`/results?term=${prevTerm}&year=${prevYear}`)
        : Promise.resolve({ data: [] }),
      api.get(`/results?term=${term}&year=${year}`),
    ];
    Promise.all(fetches)
      .then(([r1, r2]) => setData({ t1: r1.data, t2: r2.data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [term, year]);

  const overall = r => {
    const a2 = (x, y) => x != null && y != null ? Math.round((x + y) / 2) : null;
    const m = a2(r.math_school, r.math_protec), s = a2(r.sci_school, r.sci_protec), e = a2(r.eng_school, r.eng_protec);
    return m != null && s != null && e != null ? Math.round((m + s + e) / 3) : null;
  };

  const t1Map = {};
  data.t1.forEach(r => { t1Map[r.learner_id] = overall(r); });

  const withAvg = data.t2
    .map(r => ({ ...r, avg: overall(r) }))
    .filter(x => x.avg != null)
    .sort((a, b) => b.avg - a.avg);

  const improved = withAvg
    .map(r => ({ ...r, diff: t1Map[r.learner_id] != null ? r.avg - t1Map[r.learner_id] : null }))
    .filter(x => x.diff != null)
    .sort((a, b) => b.diff - a.diff);

  const myRank = withAvg.findIndex(r => r.learner_id === user?.learnerId) + 1;
  const myRecord = withAvg.find(r => r.learner_id === user?.learnerId);

  if (loading) return <div className="view"><div className="no-data">Loading awards...</div></div>;

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Awards &amp; recognition</div>
          <div className="topbar-sub">Top achievers and most improved — {term} {year}</div>
        </div>
        <div className="topbar-right">
          <select className="btn btn-sm" style={{fontWeight:400}} value={term} onChange={e=>setTerm(e.target.value)}>
            <option>T1</option><option>T2</option><option>T3</option><option>T4</option>
          </select>
          <select className="btn btn-sm" style={{fontWeight:400}} value={year} onChange={e=>setYear(e.target.value)}>
            {getYearOptions().map(y=><option key={y}>{y}</option>)}
          </select>
          <span className="role-badge role-badge-learner">Learner</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'14px' }}>
        <button style={TAB_STYLE(tab === 'overall')} onClick={() => setTab('overall')}>
          Overall Awards
        </button>
        <button style={TAB_STYLE(tab === 'subject')} onClick={() => setTab('subject')}>
          Subject Awards
        </button>
      </div>

      {tab === 'overall' && (
        <>
          {myRecord && (
            <div className="card" style={{ background:'var(--blue-bg)', border:'0.5px solid var(--blue-border)', marginBottom:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:'12px', fontWeight:600, color:'var(--blue-text)' }}>
                    Your ranking — #{myRank} of {withAvg.length}
                  </div>
                  <div style={{ fontSize:'11px', color:'var(--blue-text)', marginTop:4, fontStyle:'italic' }}>
                    "{getComment(myRecord.avg, myRecord.full_name.length)}"
                  </div>
                </div>
                <span className={`mark mark-${myRecord.avg>=80?'blue':myRecord.avg>=60?'green':myRecord.avg>=50?'yellow':'red'}`} style={{ fontSize:'16px' }}>
                  {myRecord.avg}%
                </span>
              </div>
            </div>
          )}
          <div className="row2">
            <div className="card">
              <div className="card-hd"><i className="ti ti-star" />Top achievers — overall avg</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {withAvg.slice(0, 10).map((x, i) => (
                  <div key={x.learner_id} style={{
                    background: x.learner_id === user?.learnerId ? 'var(--blue-bg)' : i < 3 ? 'var(--color-background-primary)' : 'var(--color-background-secondary)',
                    border: x.learner_id === user?.learnerId ? '0.5px solid var(--blue-border)' : '0.5px solid var(--color-border-tertiary)',
                    borderRadius:'8px', padding:'10px 12px', display:'flex', alignItems:'flex-start', gap:'10px',
                  }}>
                    {i < 3 ? (
                      <div className={`award-icon ${MEDAL_CLS[i]}`}>{MEDALS[i]}</div>
                    ) : (
                      <div style={{width:36,height:36,borderRadius:'50%',background:'var(--color-background-tertiary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:600,color:'var(--color-text-secondary)',flexShrink:0}}>{i+1}</div>
                    )}
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div className="award-name">
                          {x.full_name}{x.learner_id === user?.learnerId && <span style={{fontSize:'10px',color:'var(--blue-text)',marginLeft:4}}>(you)</span>}
                        </div>
                        <span className={`mark mark-${x.avg>=80?'blue':x.avg>=60?'green':x.avg>=50?'yellow':'red'}`}>{x.avg}%</span>
                      </div>
                      <div className="award-detail" style={{marginTop:2}}>{x.grade}</div>
                    </div>
                  </div>
                ))}
                {withAvg.length === 0 && <div className="no-data">No results yet.</div>}
              </div>
            </div>
            <div className="card">
              <div className="card-hd"><i className="ti ti-trending-up" />Most improved — {prevTerm || 'N/A'}→{term}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {improved.slice(0, 10).map((x, i) => (
                  <div key={x.learner_id} style={{
                    background: x.learner_id === user?.learnerId ? 'var(--blue-bg)' : i < 3 ? 'var(--color-background-primary)' : 'var(--color-background-secondary)',
                    border: x.learner_id === user?.learnerId ? '0.5px solid var(--blue-border)' : '0.5px solid var(--color-border-tertiary)',
                    borderRadius:'8px', padding:'10px 12px', display:'flex', alignItems:'flex-start', gap:'10px',
                  }}>
                    {i < 3 ? (
                      <div className={`award-icon ${MEDAL_CLS[i]}`}>{MEDALS[i]}</div>
                    ) : (
                      <div style={{width:36,height:36,borderRadius:'50%',background:'var(--color-background-tertiary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:600,color:'var(--color-text-secondary)',flexShrink:0}}>{i+1}</div>
                    )}
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div className="award-name">
                          {x.full_name}{x.learner_id === user?.learnerId && <span style={{fontSize:'10px',color:'var(--blue-text)',marginLeft:4}}>(you)</span>}
                        </div>
                        <span className={`mark mark-${x.diff>0?'green':'yellow'}`}>{x.diff>0?'+':''}{x.diff}%</span>
                      </div>
                      <div className="award-detail" style={{marginTop:2}}>{x.grade}</div>
                    </div>
                  </div>
                ))}
                {improved.length === 0 && <div className="no-data">Need T1 and T2 data to compare.</div>}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'subject' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
          {SUBJECTS.map(({ label, schoolKey }) => (
            <div className="card" key={schoolKey}>
              <div className="card-hd">
                <i className="ti ti-school" />{label}
                <span style={{ marginLeft:'auto', fontSize:'10px', color:'var(--color-text-secondary)', fontWeight:400 }}>
                  School mark
                </span>
              </div>
              <SubjectRankList data={data.t2} schoolKey={schoolKey} currentLearnerId={user?.learnerId} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
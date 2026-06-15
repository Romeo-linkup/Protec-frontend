import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { getCurrentTermAndYear, getYearOptions } from '../../utils/termUtils.js';

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

function RankList({ data, type }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
      {data.slice(0, 10).map((x, i) => (
        <div key={x.learner_id || x.id} style={{
          background: i < 3 ? 'var(--color-background-primary)' : 'var(--color-background-secondary)',
          border: '0.5px solid var(--color-border-tertiary)',
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
              <div className="award-name">{x.full_name}</div>
              {type === 'achiever'
                ? <span className={`mark mark-${x.avg>=80?'blue':x.avg>=60?'green':x.avg>=50?'yellow':'red'}`}>{x.avg}%</span>
                : <span className={`mark mark-${x.diff>0?'green':'yellow'}`}>{x.diff>0?'+':''}{x.diff}%</span>
              }
            </div>
            <div className="award-detail" style={{ marginTop:2 }}>{x.grade}</div>
          </div>
        </div>
      ))}
      {data.length === 0 && <div className="no-data">No data yet.</div>}
    </div>
  );
}

function SubjectRankList({ data, schoolKey }) {
  const ranked = [...data]
    .filter(r => r[schoolKey] != null)
    .sort((a, b) => b[schoolKey] - a[schoolKey])
    .slice(0, 10);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
      {ranked.map((x, i) => (
        <div key={x.learner_id} style={{
          background: i < 3 ? 'var(--color-background-primary)' : 'var(--color-background-secondary)',
          border: '0.5px solid var(--color-border-tertiary)',
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
              <div className="award-name">{x.full_name}</div>
              <span className={`mark mark-${x[schoolKey]>=80?'blue':x[schoolKey]>=60?'green':x[schoolKey]>=50?'yellow':'red'}`}>
                {x[schoolKey]}%
              </span>
            </div>
            <div className="award-detail" style={{ marginTop:2 }}>{x.grade}</div>
          </div>
        </div>
      ))}
      {ranked.length === 0 && <div className="no-data">No data yet.</div>}
    </div>
  );
}

export default function AdminAwards() {
  const { term: defaultTerm, year: defaultYear } = getCurrentTermAndYear();
  const [term, setTerm] = useState(defaultTerm);
  const [year, setYear] = useState(defaultYear);
  const [tab, setTab] = useState('overall');
  const [t1, setT1] = useState([]);
  const [t2, setT2] = useState([]);
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(true);

  const termOrder = ['T1','T2','T3','T4'];
  const tIdx = termOrder.indexOf(term);
  const prevTerm = tIdx > 0 ? termOrder[tIdx - 1] : null;

  useEffect(() => {
    setLoading(true);
    const prevYear = (tIdx === 0 && parseInt(year) > 2025) ? String(parseInt(year) - 1) : year;
    const fetches = [
      prevTerm
        ? api.get(`/results?term=${prevTerm}&year=${prevYear}`)
        : Promise.resolve({ data: [] }),
      api.get(`/results?term=${term}&year=${year}`),
    ];
    Promise.all(fetches)
      .then(([r1, r2]) => { setT1(r1.data); setT2(r2.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [term, year]);

  const overall = r => {
    const a2 = (x, y) => x != null && y != null ? Math.round((x + y) / 2) : null;
    const m = a2(r.math_school, r.math_protec), s = a2(r.sci_school, r.sci_protec), e = a2(r.eng_school, r.eng_protec);
    return m != null && s != null && e != null ? Math.round((m + s + e) / 3) : null;
  };

  const t1Map = {};
  t1.forEach(r => { t1Map[r.learner_id] = overall(r); });

  const filtered = grade ? t2.filter(r => r.grade === grade) : t2;

  const withAvg = filtered
    .map(r => ({ ...r, avg: overall(r) }))
    .filter(x => x.avg != null)
    .sort((a, b) => b.avg - a.avg);

  const improved = withAvg
    .map(r => ({ ...r, diff: t1Map[r.learner_id] != null ? r.avg - t1Map[r.learner_id] : null }))
    .filter(x => x.diff != null)
    .sort((a, b) => b.diff - a.diff);

  if (loading) return <div className="view"><div className="no-data">Loading...</div></div>;

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Awards &amp; recognition</div>
          <div className="topbar-sub">Top 10 achievers and most improved — {term} {year}</div>
        </div>
        <div className="topbar-right">
          <select className="btn btn-sm" style={{fontWeight:400}} value={term} onChange={e=>setTerm(e.target.value)}>
            <option>T1</option><option>T2</option><option>T3</option><option>T4</option>
          </select>
          <select className="btn btn-sm" style={{fontWeight:400}} value={year} onChange={e=>setYear(e.target.value)}>
            {getYearOptions().map(y=><option key={y}>{y}</option>)}
          </select>
          <select value={grade} onChange={e=>setGrade(e.target.value)} style={{fontSize:'11px',padding:'5px 8px',width:'auto'}}>
            <option value="">All grades</option>
            <option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
          </select>
          <span className="role-badge role-badge-admin">Admin</span>
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
        <div className="row2">
          <div className="card">
            <div className="card-hd"><i className="ti ti-star" />Top achievers — overall average</div>
            <RankList data={withAvg} type="achiever" />
          </div>
          <div className="card">
            <div className="card-hd"><i className="ti ti-trending-up" />Most improved — {prevTerm || 'N/A'}→{term}</div>
            <RankList data={improved} type="improved" />
          </div>
        </div>
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
              <SubjectRankList data={filtered} schoolKey={schoolKey} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
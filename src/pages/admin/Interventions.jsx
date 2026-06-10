import { useState, useEffect } from 'react';
import api from '../../api/client.js';

const TYPES = ['Academic Support','Attendance','Behaviour','Parent Contact','Counselling','Other'];

export default function AdminInterventions() {
  const [interventions, setInterventions] = useState([]);
  const [learners, setLearners]           = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [form, setForm]                   = useState({ learnerId:'', type:'Academic Support', notes:'' });
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([api.get('/interventions'), api.get('/learners')])
      .then(([i, l]) => { setInterventions(i.data); setLearners(l.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.learnerId || !form.notes) { setError('Select a learner and enter notes.'); return; }
    setSaving(true); setError('');
    try {
      const { data } = await api.post('/interventions', form);
      setInterventions(prev => [data, ...prev]);
      setForm({ learnerId:'', type:'Academic Support', notes:'' });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const typePill = t => {
    const map = {'Academic Support':'blue','Attendance':'yellow','Behaviour':'red','Parent Contact':'green','Counselling':'blue','Other':'yellow'};
    return <span className={`pill pill-${map[t]||'blue'}`}>{t}</span>;
  };

  if (loading) return <div className="view"><div className="no-data">Loading...</div></div>;

  return (
    <div className="view">
      <div className="topbar">
        <div><div className="topbar-title">Interventions</div><div className="topbar-sub">Support actions recorded for learners</div></div>
        <div className="topbar-right">
          <span className="role-badge role-badge-admin">Admin</span>
          <button className="btn btn-navy btn-sm" onClick={() => setShowForm(s=>!s)}>
            {showForm ? 'Cancel' : '+ Log intervention'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <div className="card-hd"><i className="ti ti-first-aid-kit" />Log intervention</div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Learner</label>
              <select value={form.learnerId} onChange={e => setForm(f=>({...f,learnerId:e.target.value}))}>
                <option value="">— Select —</option>
                {learners.map(l => <option key={l.id} value={l.id}>{l.full_name} ({l.grade})</option>)}
              </select></div>
            <div className="form-group"><label className="form-label">Type</label>
              <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select></div>
          </div>
          <div className="form-group" style={{marginBottom:'10px'}}>
            <label className="form-label">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Describe the intervention..." />
          </div>
          {error && <div className="login-err">{error}</div>}
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button className="btn btn-navy" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      )}

      <div id="intv-log">
        {interventions.length === 0 ? <div className="no-data">No interventions recorded yet.</div>
          : interventions.map(i => (
          <div key={i.id} className="intv-card">
            <div className="intv-hd">
              <div>
                <div className="intv-name">{i.full_name} <span style={{fontWeight:400,color:'var(--color-text-secondary)'}}>· {i.grade}</span></div>
                <div className="intv-date">{new Date(i.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</div>
              </div>
              <div className="intv-tags">{typePill(i.type)}</div>
            </div>
            <div className="intv-body">{i.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
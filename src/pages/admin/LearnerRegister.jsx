import { useState, useEffect } from 'react';
import api from '../../api/client.js';

export default function AdminLearnerRegister() {
  const [viewTab, setViewTab]   = useState('learners');
  const [formTab, setFormTab]   = useState('learners');
  const [learners, setLearners] = useState([]);
  const [staff, setStaff]       = useState([]);
  const [grade, setGrade]       = useState('');
  const [search, setSearch]     = useState('');
  const [loadingL, setLoadingL] = useState(true);
  const [loadingS, setLoadingS] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ fullName:'', grade:'Grade 10', email:'', parentEmail:'' });
  const [staffForm, setStaffForm] = useState({ fullName:'', email:'' });
  const [saving, setSaving]     = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => { fetchLearners(); }, [grade]);
  useEffect(() => { fetchStaff(); }, []);

  const fetchLearners = async () => {
    setLoadingL(true);
    try {
      const { data } = await api.get(`/learners${grade ? `?grade=${grade}` : ''}`);
      setLearners(data);
    } catch { setLearners([]); }
    finally { setLoadingL(false); }
  };

  const fetchStaff = async () => {
    setLoadingS(true);
    try {
      const { data } = await api.get('/learners/staff-list');
      setStaff(data);
    } catch { setStaff([]); }
    finally { setLoadingS(false); }
  };

  const handleRegister = async () => {
    if (!form.fullName || !form.email) { setError('Full name and email are required.'); return; }
    setSaving(true); setError(''); setResult(null);
    try {
      const { data } = await api.post('/learners', form);
      setResult({ type: 'learner', ...data });
      setForm({ fullName:'', grade:'Grade 10', email:'', parentEmail:'' });
      fetchLearners();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register learner.');
    } finally { setSaving(false); }
  };

  const handleStaffRegister = async (role) => {
    if (!staffForm.fullName || !staffForm.email) { setError('Full name and email are required.'); return; }
    setSaving(true); setError(''); setResult(null);
    try {
      const { data } = await api.post('/learners/register-staff', { ...staffForm, role });
      setResult({ type: 'staff', ...data });
      setStaffForm({ fullName:'', email:'' });
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register.');
    } finally { setSaving(false); }
  };

  const handleDeleteLearner = async (id) => {
    if (!confirm('Permanently delete this learner and their account? This cannot be undone.')) return;
    try {
      await api.delete(`/learners/${id}`);
      setLearners(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete.');
    }
  };

  const handleDeleteStaff = async (userId) => {
    if (!confirm('Permanently delete this account? This cannot be undone.')) return;
    try {
      await api.delete(`/learners/staff/${userId}`);
      setStaff(prev => prev.filter(s => s.id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete.');
    }
  };

  const filteredLearners = learners.filter(l =>
    (!search || l.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredStaff = staff.filter(s =>
    (!search || s.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">User register</div>
          <div className="topbar-sub">Manage learners, tutors and parents</div>
        </div>
        <div className="topbar-right">
          <span className="role-badge role-badge-admin">Admin</span>
          <button className="btn btn-navy btn-sm" onClick={() => { setShowForm(s => !s); setError(''); setResult(null); }}>
            <i className="ti ti-plus" style={{fontSize:'12px',verticalAlign:'-1px',marginRight:'3px'}} />
            {showForm ? 'Cancel' : 'Register user'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
            {['learners','tutor','parent'].map(t => (
              <button key={t}
                className={`btn${formTab===t?' btn-navy':''}`}
                onClick={() => { setFormTab(t); setError(''); setResult(null); }}>
                {t === 'learners' ? 'Learner' : t === 'tutor' ? 'Tutor' : 'Parent'}
              </button>
            ))}
          </div>

          {formTab === 'learners' && (
            <>
              <div className="card-hd"><i className="ti ti-user-plus" />Register new learner</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input type="text" value={form.fullName}
                    onChange={e => setForm(f=>({...f,fullName:e.target.value}))}
                    placeholder="e.g. Sipho Dlamini" />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select value={form.grade} onChange={e => setForm(f=>({...f,grade:e.target.value}))}>
                    <option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Learner email</label>
                  <input type="text" value={form.email}
                    onChange={e => setForm(f=>({...f,email:e.target.value}))}
                    placeholder="learner@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Parent email (optional)</label>
                  <input type="text" value={form.parentEmail}
                    onChange={e => setForm(f=>({...f,parentEmail:e.target.value}))}
                    placeholder="parent@example.com" />
                </div>
              </div>
              {error && <div className="login-err">{error}</div>}
              {result?.type === 'learner' && (
                <div className="saved-note">
                  ✅ Registered <strong>{result.learner?.full_name}</strong>. Temp password: <strong>{result.tempPassword}</strong>. Share with learner.
                </div>
              )}
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:'10px'}}>
                <button className="btn btn-navy" onClick={handleRegister} disabled={saving}>
                  {saving ? 'Saving...' : 'Register learner'}
                </button>
              </div>
            </>
          )}

          {(formTab === 'tutor' || formTab === 'parent') && (
            <>
              <div className="card-hd">
                <i className="ti ti-user-plus" />
                Register {formTab === 'tutor' ? 'tutor' : 'parent / guardian'}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input type="text" value={staffForm.fullName}
                    onChange={e => setStaffForm(f=>({...f,fullName:e.target.value}))}
                    placeholder={formTab === 'tutor' ? 'e.g. Ms Nkosi' : 'e.g. Mr Dlamini'} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input type="text" value={staffForm.email}
                    onChange={e => setStaffForm(f=>({...f,email:e.target.value}))}
                    placeholder="email@example.com" />
                </div>
              </div>
              {error && <div className="login-err">{error}</div>}
              {result?.type === 'staff' && (
                <div className="saved-note">
                  ✅ Registered <strong>{result.user?.full_name}</strong> as {result.user?.role}. Temp password: <strong>{result.tempPassword}</strong>. Share this with them.
                </div>
              )}
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:'10px'}}>
                <button className="btn btn-navy"
                  onClick={() => handleStaffRegister(formTab)}
                  disabled={saving}>
                  {saving ? 'Saving...' : `Register ${formTab}`}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* VIEW TABS */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
        {['learners','tutors','parents'].map(t => (
          <button key={t}
            className={`btn${viewTab===t?' btn-navy':''}`}
            onClick={() => { setViewTab(t); setSearch(''); }}>
            {t === 'learners' ? `Learners (${learners.length})` : t === 'tutors' ? `Tutors (${staff.filter(s=>s.role==='tutor').length})` : `Parents (${staff.filter(s=>s.role==='parent').length})`}
          </button>
        ))}
      </div>

      {viewTab === 'learners' && (
        <>
          <div className="filter-bar">
            <select value={grade} onChange={e => setGrade(e.target.value)}>
              <option value="">All grades</option>
              <option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
            </select>
            <input className="search-bar" placeholder="Search name..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="card" style={{overflowX:'auto'}}>
            {loadingL ? <div className="no-data">Loading...</div> : (
              <table>
                <thead>
                  <tr><th>Name</th><th>Grade</th><th>Email</th><th>Registered</th><th></th></tr>
                </thead>
                <tbody>
                  {filteredLearners.length === 0 ? (
                    <tr><td colSpan="5" className="no-data">No learners found.</td></tr>
                  ) : filteredLearners.map(l => (
                    <tr key={l.id}>
                      <td>{l.full_name}</td>
                      <td>{l.grade}</td>
                      <td style={{color:'var(--color-text-secondary)'}}>{l.email || '—'}</td>
                      <td style={{color:'var(--color-text-secondary)'}}>
                        {new Date(l.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td>
                        <button className="btn btn-red btn-sm" onClick={() => handleDeleteLearner(l.id)}>
                          <i className="ti ti-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {(viewTab === 'tutors' || viewTab === 'parents') && (
        <>
          <div className="filter-bar">
            <input className="search-bar" placeholder="Search name..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="card" style={{overflowX:'auto'}}>
            {loadingS ? <div className="no-data">Loading...</div> : (
              <table>
                <thead>
                  <tr><th>Name</th><th>Role</th><th>Email</th><th>Registered</th><th></th></tr>
                </thead>
                <tbody>
                  {filteredStaff.filter(s => s.role === (viewTab === 'tutors' ? 'tutor' : 'parent')).length === 0 ? (
                    <tr><td colSpan="5" className="no-data">No {viewTab} found.</td></tr>
                  ) : filteredStaff
                      .filter(s => s.role === (viewTab === 'tutors' ? 'tutor' : 'parent'))
                      .map(s => (
                    <tr key={s.id}>
                      <td>{s.full_name}</td>
                      <td>
                        <span className={`role-badge role-badge-${s.role}`}>{s.role}</span>
                      </td>
                      <td style={{color:'var(--color-text-secondary)'}}>{s.email || '—'}</td>
                      <td style={{color:'var(--color-text-secondary)'}}>
                        {new Date(s.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td>
                        <button className="btn btn-red btn-sm" onClick={() => handleDeleteStaff(s.id)}>
                          <i className="ti ti-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
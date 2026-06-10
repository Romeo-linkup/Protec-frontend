import { useState, useEffect, useRef } from 'react';
import api from '../../api/client.js';

const CATEGORIES = ['Visitor', 'Maintenance', 'Sports', 'Academic', 'Community', 'Other'];
const CAT_COLORS = {
  Visitor:     'blue',
  Maintenance: 'yellow',
  Sports:      'green',
  Academic:    'blue',
  Community:   'green',
  Other:       'yellow',
};

export default function AdminActivityLog() {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [saved, setSaved]         = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo]   = useState('');
  const [previews, setPreviews]   = useState([]);
  const [lightbox, setLightbox]   = useState(null);
  const fileRef = useRef();

  const [form, setForm] = useState({
    eventName: '', category: 'Visitor',
    eventDate: new Date().toISOString().split('T')[0],
    description: '', files: [],
  });

  useEffect(() => { fetchEvents(); }, [filterCat, filterFrom, filterTo]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCat)  params.append('category', filterCat);
      if (filterFrom) params.append('from', filterFrom);
      if (filterTo)   params.append('to', filterTo);
      const { data } = await api.get(`/activity-log?${params}`);
      setEvents(data);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    setForm(f => ({ ...f, files }));
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!form.eventName || !form.eventDate) { setError('Event name and date are required.'); return; }
    setSaving(true); setError(''); setSaved(false);
    try {
      const fd = new FormData();
      fd.append('eventName', form.eventName);
      fd.append('category', form.category);
      fd.append('eventDate', form.eventDate);
      fd.append('description', form.description);
      form.files.forEach(f => fd.append('images', f));
      const { data } = await api.post('/activity-log', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEvents(prev => [data, ...prev]);
      setForm({ eventName:'', category:'Visitor', eventDate: new Date().toISOString().split('T')[0], description:'', files:[] });
      setPreviews([]);
      if (fileRef.current) fileRef.current.value = '';
      setSaved(true); setShowForm(false);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save event.');
    } finally { setSaving(false); }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Delete this entire event and all its images? This cannot be undone.')) return;
    try {
      await api.delete(`/activity-log/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch {}
  };

  const handleDeleteImage = async (eventId, imageId) => {
    if (!confirm('Delete this image?')) return;
    try {
      await api.delete(`/activity-log/image/${imageId}`);
      setEvents(prev => prev.map(e =>
        e.id === eventId
          ? { ...e, images: e.images.filter(i => i.id !== imageId) }
          : e
      ));
    } catch {}
  };

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Activity log</div>
          <div className="topbar-sub">Branch events, visits and activities — admin only</div>
        </div>
        <div className="topbar-right">
          <span className="role-badge role-badge-admin">Admin</span>
          <button className="btn btn-navy btn-sm"
            onClick={() => { setShowForm(s => !s); setError(''); }}>
            {showForm ? 'Cancel' : '+ Log event'}
          </button>
        </div>
      </div>

      {saved && <div className="saved-note" style={{ marginBottom: 12 }}>Event logged successfully.</div>}

      {showForm && (
        <div className="card">
          <div className="card-hd"><i className="ti ti-calendar-event" />New event</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Event name</label>
              <input type="text" value={form.eventName}
                onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))}
                placeholder="e.g. Electrician visit, Sports day, Guest speaker" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" value={form.eventDate}
                onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">
                Images <span style={{ color:'var(--color-text-secondary)', fontWeight:400 }}>(up to 10)</span>
              </label>
              <input type="file" accept="image/*" multiple ref={fileRef}
                onChange={handleFileChange}
                style={{ fontSize: 12, padding: '5px 0' }} />
            </div>
          </div>

          {previews.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
              {previews.map((src, i) => (
                <img key={i} src={src} alt=""
                  style={{ width:80, height:80, objectFit:'cover', borderRadius:6,
                    border:'0.5px solid var(--color-border-tertiary)' }} />
              ))}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">
              Description / notes <span style={{ color:'var(--color-text-secondary)', fontWeight:400 }}>(optional)</span>
            </label>
            <textarea value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What happened, who was involved, outcome..."
              style={{ minHeight: 80 }} />
          </div>

          {error && <div className="login-err" style={{ marginBottom: 12 }}>{error}</div>}

          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button className="btn btn-navy" onClick={handleSubmit} disabled={saving}
              style={{ padding:'9px 24px' }}>
              {saving ? 'Saving...' : 'Save event'}
            </button>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
          style={{ fontSize:11, padding:'5px 8px', border:'0.5px solid var(--color-border-secondary)',
            borderRadius:'var(--border-radius-md)', background:'var(--color-background-primary)',
            color:'var(--color-text-secondary)', fontFamily:'var(--font)' }} />
        <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
          style={{ fontSize:11, padding:'5px 8px', border:'0.5px solid var(--color-border-secondary)',
            borderRadius:'var(--border-radius-md)', background:'var(--color-background-primary)',
            color:'var(--color-text-secondary)', fontFamily:'var(--font)' }} />
        {(filterCat || filterFrom || filterTo) && (
          <button className="btn btn-sm" onClick={() => { setFilterCat(''); setFilterFrom(''); setFilterTo(''); }}>
            Clear filters
          </button>
        )}
      </div>

      {loading ? <div className="no-data">Loading...</div> : events.length === 0 ? (
        <div className="card"><div className="no-data">No events logged yet.</div></div>
      ) : events.map(e => (
        <div key={e.id} className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <span style={{ fontSize:14, fontWeight:600, color:'var(--color-text-primary)' }}>
                  {e.event_name}
                </span>
                <span className={`pill pill-${CAT_COLORS[e.category] || 'blue'}`} style={{ fontSize:10 }}>
                  {e.category}
                </span>
              </div>
              <div style={{ fontSize:11, color:'var(--color-text-secondary)', display:'flex', gap:14 }}>
                <span><i className="ti ti-calendar" style={{ marginRight:3 }} />
                  {new Date(e.event_date).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}
                </span>
                <span><i className="ti ti-user" style={{ marginRight:3 }} />{e.created_by_name}</span>
                <span><i className="ti ti-photo" style={{ marginRight:3 }} />{e.images?.length || 0} image{e.images?.length !== 1 ? 's' : ''}</span>
              </div>
              {e.description && (
                <div style={{ fontSize:12, color:'var(--color-text-secondary)', marginTop:8, lineHeight:1.6 }}>
                  {e.description}
                </div>
              )}
            </div>
            <button className="btn btn-red btn-sm" onClick={() => handleDeleteEvent(e.id)}
              style={{ flexShrink:0, marginLeft:12 }}>
              <i className="ti ti-trash" /> Delete event
            </button>
          </div>

          {e.images?.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:10 }}>
              {e.images.map(img => (
                <div key={img.id} style={{ position:'relative' }}>
                  <img
                    src={img.cloudinary_url}
                    alt=""
                    onClick={() => setLightbox(img.cloudinary_url)}
                    style={{
                      width: 110, height: 110, objectFit:'cover',
                      borderRadius: 8, cursor:'pointer',
                      border:'0.5px solid var(--color-border-tertiary)',
                      transition:'opacity 0.15s',
                    }}
                  />
                  <button
                    onClick={() => handleDeleteImage(e.id, img.id)}
                    style={{
                      position:'absolute', top:4, right:4,
                      background:'rgba(0,0,0,0.55)', border:'none',
                      borderRadius:'50%', width:20, height:20,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor:'pointer', color:'#fff', fontSize:11,
                    }}
                    title="Remove image"
                  >
                    <i className="ti ti-x" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.85)',
            display:'flex', alignItems:'center', justifyContent:'center',
            zIndex: 2000, cursor:'zoom-out',
          }}
        >
          <img src={lightbox} alt=""
            style={{ maxWidth:'90vw', maxHeight:'90vh', borderRadius:10,
              boxShadow:'0 8px 40px rgba(0,0,0,0.4)' }} />
        </div>
      )}
    </div>
  );
}
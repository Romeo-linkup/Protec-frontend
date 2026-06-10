import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import api from '../api/client.js';

export default function CalendarPage() {
  const { user }              = useContext(AuthContext);
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [saved, setSaved]     = useState(false);
  const [form, setForm]       = useState({
    title: '', eventDate: '', eventTime: '', meetingLink: '', notes: '',
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/calendar');
      setEvents(data);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.eventDate) { setError('Title and date are required.'); return; }
    setSaving(true); setError('');
    try {
      const { data } = await api.post('/calendar', form);
      setEvents(prev => [...prev, data].sort((a,b) =>
        a.event_date.localeCompare(b.event_date) || (a.event_time||'').localeCompare(b.event_time||'')
      ));
      setForm({ title:'', eventDate:'', eventTime:'', meetingLink:'', notes:'' });
      setShowForm(false); setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this event?')) return;
    try {
      await api.delete(`/calendar/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch {}
  };

  const isToday  = d => d === today;
  const isPast   = d => d < today;
  const isSoon   = d => d > today && d <= new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];

  const fmtDate = d => new Date(d).toLocaleDateString('en-GB', {
    weekday:'long', day:'2-digit', month:'long', year:'numeric'
  });

  const fmtTime = t => {
    if (!t) return null;
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  const upcoming = events.filter(e => !isPast(e.event_date));
  const past     = events.filter(e => isPast(e.event_date));

  const statusBadge = (e) => {
    if (isToday(e.event_date))  return { label:'Today',    color:'var(--red)',        bg:'var(--red-light)' };
    if (isSoon(e.event_date))   return { label:'This week', color:'var(--yellow-text)', bg:'var(--yellow-bg)' };
    return { label:'Upcoming', color:'var(--blue-text)', bg:'var(--blue-bg)' };
  };

  const EventCard = ({ e }) => {
    const badge  = statusBadge(e);
    const canDel = user?.role === 'admin' || e.created_by === user?.id;

    return (
      <div style={{
        border: isToday(e.event_date) ? '1.5px solid var(--red)' : '0.5px solid var(--color-border-tertiary)',
        borderRadius: 10, padding: '14px 16px', marginBottom: 10,
        background: isToday(e.event_date) ? 'var(--red-light)' : 'var(--color-background-primary)',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{ fontSize:14, fontWeight:600, color:'var(--color-text-primary)' }}>
                {e.title}
              </span>
              <span style={{
                fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:8,
                background: badge.bg, color: badge.color,
              }}>
                {badge.label}
              </span>
            </div>

            <div style={{ fontSize:11, color:'var(--color-text-secondary)', display:'flex', gap:14, flexWrap:'wrap', marginBottom: e.notes ? 8 : 0 }}>
              <span><i className="ti ti-calendar" style={{marginRight:3}} />{fmtDate(e.event_date)}</span>
              {e.event_time && <span><i className="ti ti-clock" style={{marginRight:3}} />{fmtTime(e.event_time)}</span>}
              <span><i className="ti ti-user" style={{marginRight:3}} />{e.created_by_name}</span>
            </div>

            {e.notes && (
              <div style={{ fontSize:11, color:'var(--color-text-secondary)', marginTop:6, lineHeight:1.6 }}>
                {e.notes}
              </div>
            )}
          </div>

          <div style={{ display:'flex', gap:8, flexShrink:0, marginLeft:12 }}>
            {e.meeting_link && (
              <a
                href={e.meeting_link}
                target="_blank"
                rel="noreferrer"
                style={{
                  display:'flex', alignItems:'center', gap:6,
                  padding:'7px 14px', borderRadius:6, fontSize:12, fontWeight:600,
                  background: isToday(e.event_date) ? 'var(--navy)' : 'var(--color-background-secondary)',
                  color: isToday(e.event_date) ? '#fff' : 'var(--color-text-primary)',
                  border: `0.5px solid ${isToday(e.event_date) ? 'var(--navy)' : 'var(--color-border-secondary)'}`,
                  textDecoration:'none', cursor:'pointer',
                }}
              >
                <i className="ti ti-brand-teams" style={{fontSize:14}} />
                {isToday(e.event_date) ? 'Join now' : 'Join meeting'}
              </a>
            )}
            {canDel && (
              <button className="btn btn-red btn-sm" onClick={() => handleDelete(e.id)}>
                <i className="ti ti-trash" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Calendar</div>
          <div className="topbar-sub">
            {upcoming.length} upcoming event{upcoming.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="topbar-right">
          <span className={`role-badge role-badge-${user?.role}`}>{user?.role}</span>
          <button className="btn btn-navy btn-sm"
            onClick={() => { setShowForm(s => !s); setError(''); }}>
            {showForm ? 'Cancel' : '+ Add event'}
          </button>
        </div>
      </div>

      {saved && <div className="saved-note" style={{marginBottom:12}}>Event added successfully.</div>}

      {showForm && (
        <div className="card">
          <div className="card-hd"><i className="ti ti-calendar-plus" />New event</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Event title</label>
              <input type="text" value={form.title}
                onChange={e => setForm(f=>({...f,title:e.target.value}))}
                placeholder="e.g. Weekly team meeting, Parent evening" />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" value={form.eventDate}
                onChange={e => setForm(f=>({...f,eventDate:e.target.value}))} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Time <span style={{color:'var(--color-text-secondary)',fontWeight:400}}>(optional)</span></label>
              <input type="time" value={form.eventTime}
                onChange={e => setForm(f=>({...f,eventTime:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">
                Teams / meeting link <span style={{color:'var(--color-text-secondary)',fontWeight:400}}>(optional)</span>
              </label>
              <input type="text" value={form.meetingLink}
                onChange={e => setForm(f=>({...f,meetingLink:e.target.value}))}
                placeholder="Paste Teams or Zoom link here" />
            </div>
          </div>

          <div className="form-group" style={{marginBottom:14}}>
            <label className="form-label">
              Notes <span style={{color:'var(--color-text-secondary)',fontWeight:400}}>(optional)</span>
            </label>
            <textarea value={form.notes}
              onChange={e => setForm(f=>({...f,notes:e.target.value}))}
              placeholder="Agenda, what to prepare, any important details..."
              style={{minHeight:70}} />
          </div>

          {error && <div className="login-err" style={{marginBottom:12}}>{error}</div>}

          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button className="btn btn-navy" onClick={handleSubmit} disabled={saving}
              style={{padding:'9px 24px'}}>
              {saving ? 'Saving...' : 'Add event'}
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="no-data">Loading...</div> : (
        <>
          {upcoming.length === 0 && past.length === 0 && (
            <div className="card"><div className="no-data">No events yet. Add one above.</div></div>
          )}

          {upcoming.length > 0 && (
            <div className="card">
              <div className="card-hd"><i className="ti ti-calendar-event" />Upcoming</div>
              {upcoming.map(e => <EventCard key={e.id} e={e} />)}
            </div>
          )}

          {past.length > 0 && (
            <div className="card">
              <div className="card-hd" style={{color:'var(--color-text-secondary)'}}>
                <i className="ti ti-history" />Past events
              </div>
              <div style={{opacity:0.7}}>
                {past.slice().reverse().map(e => <EventCard key={e.id} e={e} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
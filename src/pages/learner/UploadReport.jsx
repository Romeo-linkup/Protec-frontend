import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import api from '../../api/client.js';

export default function UploadReport() {
  const { user } = useContext(AuthContext);
  const [file, setFile]         = useState(null);
  const [term, setTerm]         = useState('T1');
  const [year, setYear]         = useState('2025');
  const [previous, setPrevious] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get('/uploads/my-reports').then(r => setPrevious(r.data)).catch(() => {});
  }, [done]);

  const handleUpload = async () => {
    if (!file) { setError('Select a file first.'); return; }
    setUploading(true); setError(''); setDone(false);
    try {
      const fd = new FormData();
      fd.append('report', file);
      fd.append('term', term);
      fd.append('year', year);
      await api.post('/uploads/report', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDone(true); setFile(null);
      setTimeout(() => setDone(false), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
    } finally { setUploading(false); }
  };

  return (
    <div className="view">
      <div className="topbar">
        <div><div className="topbar-title">Upload term report</div><div className="topbar-sub">Submit your school report card</div></div>
        <div className="topbar-right"><span className="role-badge role-badge-learner">Learner</span></div>
      </div>

      <div className="card" style={{maxWidth:'520px'}}>
        <div className="card-hd"><i className="ti ti-upload" />Upload report</div>

        <div className="form-row" style={{marginBottom:'12px'}}>
          <div className="form-group"><label className="form-label">Term</label>
            <select value={term} onChange={e=>setTerm(e.target.value)}><option>T1</option><option>T2</option><option>T3</option><option>T4</option></select></div>
          <div className="form-group"><label className="form-label">Year</label>
            <select value={year} onChange={e=>setYear(e.target.value)}><option>2025</option><option>2026</option></select></div>
        </div>

        <label className="upload-zone" style={{
          cursor: 'pointer',
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '14px',
        }}>
          <i className="ti ti-file-upload" style={{ fontSize: '36px' }} />
          <p style={{ fontSize: '13px' }}>
            {file ? file.name : 'Click to select PDF, JPG or PNG (max 5MB)'}
          </p>
          {file && (
            <span className="pill pill-blue" style={{ fontSize: '11px' }}>
              {(file.size / 1024).toFixed(0)} KB — ready to upload
            </span>
          )}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={e => setFile(e.target.files[0])}
          />
        </label>

        {error && <div className="login-err" style={{marginBottom:'10px'}}>{error}</div>}
        {done  && <div className="saved-note">Report uploaded successfully.</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-navy" onClick={handleUpload} disabled={uploading || !file}
            style={{ padding: '9px 24px', fontSize: '13px' }}>
            {uploading ? 'Uploading...' : 'Upload report'}
          </button>
        </div>
      </div>

      {previous.length > 0 && (
        <div className="card">
          <div className="card-hd"><i className="ti ti-history" />Previously uploaded reports</div>
          <table>
            <thead>
              <tr><th>Term</th><th>Year</th><th>Uploaded</th><th>View</th></tr>
            </thead>
            <tbody>
              {previous.map(r => (
                <tr key={r.id}>
                  <td>{r.term}</td>
                  <td>{r.year}</td>
                  <td>{new Date(r.uploaded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <a href={r.cloudinary_url} target="_blank" rel="noreferrer"
                      className="btn btn-sm" style={{ textDecoration: 'none' }}>
                      <i className="ti ti-external-link" /> View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
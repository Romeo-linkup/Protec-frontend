import { useState, useEffect } from 'react';
import api from '../../api/client.js';

export default function AdminUploadedReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [grade, setGrade]     = useState('');

  useEffect(() => {
    api.get('/uploads/all').then(r => setReports(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter(r =>
    (!grade || r.grade === grade) &&
    (!search || r.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="view">
      <div className="topbar">
        <div>
          <div className="topbar-title">Uploaded reports</div>
          <div className="topbar-sub">Term reports submitted by learners</div>
        </div>
        <div className="topbar-right">
          <span className="role-badge role-badge-admin">Admin</span>
        </div>
      </div>

      <div className="filter-bar">
        <select value={grade} onChange={e => setGrade(e.target.value)}>
          <option value="">All grades</option>
          <option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
        </select>
        <input className="search-bar" placeholder="Search learner..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        {loading ? <div className="no-data">Loading...</div> : filtered.length === 0 ? (
          <div className="no-data">No reports uploaded yet.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Learner</th><th>Grade</th><th>Term</th><th>Year</th><th>Uploaded</th><th>View</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>{r.full_name}</td>
                  <td>{r.grade}</td>
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
        )}
      </div>
    </div>
  );
}

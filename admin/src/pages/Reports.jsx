import { useState, useEffect } from 'react';
import api from '../api/client';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState('open');
  const [loading, setLoading] = useState(true);

  const fetchReports = async (status) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/reports', { params: { status } });
      setReports(data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(tab); }, [tab]);

  const resolve = async (id, action) => {
    const labels = { resolved: 'Resolve', dismissed: 'Dismiss', banned: 'Ban the reported user and resolve' };
    if (!confirm(`${labels[action]}? This cannot be undone.`)) return;

    try {
      await api.put(`/admin/reports/${id}`, { action });
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed.');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Reports</h1>
        <p>Review and moderate reported content</p>
      </div>

      <div className="tabs">
        {['open', 'resolved', 'dismissed', 'banned'].map(t => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="empty">No {tab} reports.</div>
      ) : reports.map(r => (
        <div key={r.id} className="report-card">
          <div className="report-reason">{r.reason}</div>

          <div className="report-meta">
            <strong>Reporter:</strong> {r.reporter.fullName} ({r.reporter.email})<br />
            {r.reportedUser && (
              <>
                <strong>Reported user:</strong> {r.reportedUser.fullName} ({r.reportedUser.email})
                {r.reportedUser.isBanned && <span className="badge badge-red" style={{ marginLeft: 8 }}>Banned</span>}
                <br />
              </>
            )}
            <strong>Date:</strong> {new Date(r.createdAt).toLocaleString()}
            {r.resolvedByName && <><br /><strong>Resolved by:</strong> {r.resolvedByName}</>}
          </div>

          {r.reportedPost && (
            <div className="report-content">
              <strong>Reported post:</strong><br />
              {r.reportedPost.text || '(media only)'}
              {r.reportedPost.mediaUrl && <><br /><em>{r.reportedPost.mediaUrl}</em></>}
            </div>
          )}

          {tab === 'open' && (
            <div className="report-actions">
              <button className="btn btn-success btn-sm" onClick={() => resolve(r.id, 'resolved')}>Resolve</button>
              <button className="btn btn-ghost btn-sm" onClick={() => resolve(r.id, 'dismissed')}>Dismiss</button>
              <button className="btn btn-danger btn-sm" onClick={() => resolve(r.id, 'banned')}>Ban User &amp; Resolve</button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

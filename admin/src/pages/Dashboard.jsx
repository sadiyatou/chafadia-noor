import { useState, useEffect } from 'react';
import api from '../api/client';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty">Loading...</div>;
  if (!data?.success) return <div className="empty">Failed to load stats.</div>;

  const { stats, recentUsers } = data;

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of Chafadia Noor platform activity</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="label">Total Users</div><div className="value">{stats.totalUsers}</div></div>
        <div className="stat-card"><div className="label">Online Now</div><div className="value">{stats.onlineUsers}</div></div>
        <div className="stat-card"><div className="label">Banned Users</div><div className="value">{stats.bannedUsers}</div></div>
        <div className="stat-card"><div className="label">Total Posts</div><div className="value">{stats.totalPosts}</div></div>
        <div className="stat-card"><div className="label">Open Reports</div><div className="value">{stats.openReports}</div></div>
        <div className="stat-card"><div className="label">Total Chats</div><div className="value">{stats.totalChats}</div></div>
        <div className="stat-card"><div className="label">Total Calls</div><div className="value">{stats.totalCalls}</div></div>
        <div className="stat-card"><div className="label">Live Streams</div><div className="value">{stats.liveStreams}</div></div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Recent Users</h3></div>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {recentUsers.map(u => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'main_admin' ? 'badge-yellow' : u.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>{u.role}</span></td>
                <td>{u.isBanned ? <span className="badge badge-red">Banned</span> : <span className="badge badge-green">Active</span>}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

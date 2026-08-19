import { useState, useEffect } from 'react';
import api from '../api/client';

export default function Chats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(() => {
      setLoading(false);
    }).catch(() => setLoading(false));

    api.get('/admin/chats').then(r => {
      setChats(r.data.chats || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>Chat Moderation</h1>
        <p>Overview of active chats on the platform</p>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Chat</th><th>Type</th><th>Last Message</th><th>Members</th><th>Created</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
            ) : chats.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No chats visible to this admin account.</td></tr>
            ) : chats.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name || `Chat #${c.id}`}</strong></td>
                <td><span className={`badge ${c.type === 'group' ? 'badge-blue' : 'badge-gray'}`}>{c.type}</span></td>
                <td style={{ maxWidth: 200 }}>{c.lastMessage || '—'}</td>
                <td>{c.memberCount}</td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

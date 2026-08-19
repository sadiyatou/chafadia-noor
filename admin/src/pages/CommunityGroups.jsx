import { useState, useEffect } from 'react';
import api from '../api/client';

export default function CommunityGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/community-groups/admin/all');
      setGroups(data.groups || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGroups(); }, []);

  const openGroup = async (g) => {
    setSelected(g);
    setMsgLoading(true);
    try {
      const { data } = await api.get(`/community-groups/${g.id}/messages`, { params: { limit: 100 } });
      setMessages(data.messages || []);
    } catch { setMessages([]); }
    finally { setMsgLoading(false); }
  };

  const toggleActive = async (g) => {
    try {
      await api.put(`/community-groups/${g.id}`, { is_active: !g.is_active });
      setGroups(prev => prev.map(x => x.id === g.id ? { ...x, is_active: !x.is_active } : x));
      if (selected?.id === g.id) setSelected(s => ({ ...s, is_active: !s.is_active }));
    } catch { alert('Failed.'); }
  };

  const filtered = groups.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) return (
    <>
      <div className="page-header">
        <h1>Group: {selected.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-sm ${selected.is_active ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleActive(selected)}>
            {selected.is_active ? 'Deactivate Group' : 'Reactivate Group'}
          </button>
          <button className="btn" onClick={() => setSelected(null)}>← Back</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Group Info</h3>
          <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
            <div><strong>Status:</strong> <span className={`badge ${selected.is_active ? 'badge-green' : 'badge-red'}`}>{selected.is_active ? 'Active' : 'Deactivated'}</span></div>
            <div><strong>Visibility:</strong> {selected.is_public ? 'Public' : 'Private'}</div>
            <div><strong>Members:</strong> {selected.member_count}</div>
            <div><strong>Created by:</strong> {selected.creator_name || '—'}</div>
            <div><strong>Created:</strong> {new Date(selected.created_at).toLocaleDateString()}</div>
            {selected.description && <div><strong>About:</strong> {selected.description}</div>}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Messages ({messages.length}) — Admin View</h3>
          <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {msgLoading ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: 16 }}>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: 16 }}>No messages yet.</p>
            ) : messages.map(m => (
              <div key={m.id} style={{ padding: '8px 12px', background: '#F7F5EE', borderRadius: 8, borderLeft: '3px solid #063B28' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: 13, color: '#063B28' }}>{m.sender_name}</strong>
                  <span style={{ fontSize: 11, color: '#9b9b9b' }}>{new Date(m.created_at).toLocaleString()}</span>
                </div>
                {m.content && <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>{m.content}</p>}
                {m.type !== 'text' && <span className="badge badge-gray" style={{ fontSize: 11, marginTop: 4 }}>{m.type}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="page-header">
        <h1>Community Groups</h1>
        <p>{groups.length} groups total</p>
      </div>

      <div className="search-bar" style={{ marginBottom: 16 }}>
        <input placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Group Name</th><th>Creator</th><th>Members</th><th>Visibility</th><th>Status</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 24 }}>No groups found.</td></tr>
            ) : filtered.map(g => (
              <tr key={g.id}>
                <td><strong>{g.name}</strong>{g.description && <div style={{ fontSize: 11, color: '#6b7280' }}>{g.description}</div>}</td>
                <td>{g.creator_name || '—'}</td>
                <td>{g.member_count}</td>
                <td><span className={`badge ${g.is_public ? 'badge-green' : 'badge-gray'}`}>{g.is_public ? 'Public' : 'Private'}</span></td>
                <td><span className={`badge ${g.is_active ? 'badge-green' : 'badge-red'}`}>{g.is_active ? 'Active' : 'Deactivated'}</span></td>
                <td>{new Date(g.created_at).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm btn-primary" onClick={() => openGroup(g)}>Monitor</button>
                  <button className={`btn btn-sm ${g.is_active ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleActive(g)}>
                    {g.is_active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

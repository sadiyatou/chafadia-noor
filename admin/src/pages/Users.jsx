import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [banFilter, setBanFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.q = search;
      if (roleFilter) params.role = roleFilter;
      if (banFilter) params.banned = banFilter;

      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, banFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleBan = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/ban`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: data.isBanned } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed.');
    }
  };

  const toggleVerified = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/verified`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: data.verified } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed.');
    }
  };

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <>
      <div className="page-header">
        <h1>Users</h1>
        <p>{total} users total</p>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="main_admin">Main Admin</option>
        </select>
        <select value={banFilter} onChange={(e) => { setBanFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="false">Active</option>
          <option value="true">Banned</option>
        </select>
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      <div className="card">
        <table>
          <thead>
            <tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Verified</th><th>Status</th><th>Online</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>No users found.</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td><strong>{u.fullName}</strong></td>
                <td>{u.email || '—'}</td>
                <td>{u.phone || '—'}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    style={{ padding: '2px 6px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}
                    disabled={u.role === 'main_admin'}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                    <option value="main_admin">main_admin</option>
                  </select>
                </td>
                <td>
                  {u.verified
                    ? <span className="badge badge-green">Verified</span>
                    : <span className="badge badge-red">Unverified</span>}
                </td>
                <td>{u.isBanned ? <span className="badge badge-red">Banned</span> : <span className="badge badge-green">Active</span>}</td>
                <td>{u.isOnline ? <span className="badge badge-green">Online</span> : <span className="badge badge-gray">Offline</span>}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button
                    className={`btn btn-sm ${u.verified ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => toggleVerified(u.id)}
                    disabled={u.role === 'main_admin'}
                    title={u.verified ? 'Mark as unverified' : 'Mark as verified'}
                  >
                    {u.verified ? 'Unverify' : 'Verify'}
                  </button>
                  <button
                    className={`btn btn-sm ${u.isBanned ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => toggleBan(u.id)}
                    disabled={u.role === 'main_admin'}
                  >
                    {u.isBanned ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</button>
          </div>
        )}
      </div>
    </>
  );
}

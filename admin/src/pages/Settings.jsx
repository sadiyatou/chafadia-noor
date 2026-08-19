import { getUser, logout } from '../api/client';

export default function Settings() {
  const user = getUser();

  return (
    <>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Admin account and platform settings</p>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#063b28' }}>Admin Profile</h3>
        <table>
          <tbody>
            <tr><td style={{ fontWeight: 600, width: 140 }}>Name</td><td>{user?.fullName}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Email</td><td>{user?.email}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Role</td><td><span className="badge badge-yellow">{user?.role}</span></td></tr>
            <tr><td style={{ fontWeight: 600 }}>User ID</td><td>{user?.id}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#063b28' }}>Platform Info</h3>
        <table>
          <tbody>
            <tr><td style={{ fontWeight: 600, width: 140 }}>API</td><td>{(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Database</td><td>PostgreSQL — chafadia_noor</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Real-time</td><td>Socket.io (same host as API)</td></tr>
          </tbody>
        </table>

        <div style={{ marginTop: 24 }}>
          <button className="btn btn-danger" onClick={logout}>Logout</button>
        </div>
      </div>
    </>
  );
}

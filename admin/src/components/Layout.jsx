import { NavLink, Outlet } from 'react-router-dom';
import { logout, getUser } from '../api/client';

export default function Layout() {
  const user = getUser();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>CHAFADIA NOOR</h2>
          <p>Admin Dashboard</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/posts">Posts</NavLink>
          <NavLink to="/chats">Messages</NavLink>
          <NavLink to="/community-groups">Community Groups</NavLink>
          <NavLink to="/arabic-resources">Arabic Resources</NavLink>
          <NavLink to="/courses">Islamic Courses</NavLink>
          <NavLink to="/articles">Articles</NavLink>
          <NavLink to="/essentials">Islamic Essentials</NavLink>
          <NavLink to="/downloads">Offline Downloads</NavLink>
          <NavLink to="/reports">Reports</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: 12, marginBottom: 8, opacity: 0.7 }}>
            {user?.fullName} ({user?.role})
          </div>
          <button onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

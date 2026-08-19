import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './api/client';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Posts from './pages/Posts';
import Reports from './pages/Reports';
import Chats from './pages/Chats';
import Settings from './pages/Settings';
import ArabicResources from './pages/ArabicResources';
import Courses from './pages/Courses';
import CommunityGroups from './pages/CommunityGroups';
import Articles from './pages/Articles';
import Essentials from './pages/Essentials';
import Downloads from './pages/Downloads';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="posts" element={<Posts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="chats" element={<Chats />} />
          <Route path="arabic-resources" element={<ArabicResources />} />
          <Route path="courses" element={<Courses />} />
          <Route path="community-groups" element={<CommunityGroups />} />
          <Route path="articles" element={<Articles />} />
          <Route path="essentials" element={<Essentials />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

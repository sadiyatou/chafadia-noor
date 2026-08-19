import { useState, useEffect } from 'react';
import api from '../api/client';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/posts', { params: { page, limit: 20 } });
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [page]);

  const deletePost = async (postId) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setTotal(t => t - 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed.');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Posts</h1>
        <p>{total} community posts</p>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Content</th><th>Author</th><th>Likes</th><th>Comments</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No posts.</td></tr>
            ) : posts.map(p => (
              <tr key={p.id}>
                <td style={{ maxWidth: 300 }}>
                  <div style={{ fontSize: 13 }}>{p.text ? (p.text.length > 100 ? p.text.slice(0, 100) + '...' : p.text) : <em>(media only)</em>}</div>
                  {p.mediaType && <span className="badge badge-blue" style={{ marginTop: 4 }}>{p.mediaType}</span>}
                </td>
                <td>
                  <div>{p.author.fullName}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{p.author.email}</div>
                  {p.author.isBanned && <span className="badge badge-red">Banned</span>}
                </td>
                <td>{p.likes}</td>
                <td>{p.commentsCount}</td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => deletePost(p.id)}>Delete</button>
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

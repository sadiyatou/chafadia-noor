import { useState, useEffect } from 'react';
import api from '../api/client';

const CATEGORIES = ['general', 'quran', 'hadith', 'fiqh', 'seerah', 'family', 'worship', 'character'];

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'general', excerpt: '', content: '', author: '', read_minutes: 5, cover_image: '' });
  const [coverFile, setCoverFile] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/articles/admin/all', { params: filter ? { category: filter } : {} });
      setArticles(data.articles || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]);

  const openModal = (article = null) => {
    if (article) {
      setEditing(article);
      setForm({
        title: article.title, category: article.category, excerpt: article.excerpt || '',
        content: article.content, author: article.author || '', read_minutes: article.read_minutes || 5,
        cover_image: article.cover_image || '',
      });
    } else {
      setEditing(null);
      setForm({ title: '', category: 'general', excerpt: '', content: '', author: '', read_minutes: 5, cover_image: '' });
    }
    setCoverFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) { alert('Title and content are required.'); return; }
    setSaving(true);
    try {
      let cover_image = form.cover_image;
      if (coverFile) {
        const fd = new FormData();
        fd.append('file', coverFile);
        const { data: up } = await api.post('/upload/community-media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        cover_image = up.url;
      }

      const payload = { ...form, cover_image, read_minutes: parseInt(form.read_minutes) || 5 };
      if (editing) await api.put(`/articles/${editing.id}`, payload);
      else await api.post('/articles', payload);

      setShowModal(false);
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed.');
    } finally { setSaving(false); }
  };

  const togglePublish = async (a) => {
    try {
      await api.put(`/articles/${a.id}`, { is_published: !a.is_published });
      setArticles(prev => prev.map(x => x.id === a.id ? { ...x, is_published: !x.is_published } : x));
    } catch { alert('Failed.'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this article?')) return;
    try {
      await api.delete(`/articles/${id}`);
      setArticles(prev => prev.filter(x => x.id !== id));
    } catch { alert('Failed.'); }
  };

  return (
    <>
      <div className="page-header">
        <h1>Islamic Articles</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ New Article</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['', ...CATEGORIES].map(c => (
          <button key={c} className={`btn btn-sm ${filter === c ? 'btn-primary' : ''}`} onClick={() => setFilter(c)}>
            {c || 'All'}
          </button>
        ))}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Title</th><th>Category</th><th>Author</th><th>Views</th><th>Published</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
            ) : articles.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 24 }}>No articles yet. Create one!</td></tr>
            ) : articles.map(a => (
              <tr key={a.id}>
                <td><strong>{a.title}</strong>{a.excerpt && <div style={{ fontSize: 11, color: '#6b7280' }}>{a.excerpt}</div>}</td>
                <td><span className="badge badge-green">{a.category}</span></td>
                <td>{a.author || a.author_name || '—'}</td>
                <td>{a.view_count}</td>
                <td>
                  <span className={`badge ${a.is_published ? 'badge-green' : 'badge-red'}`}>
                    {a.is_published ? 'Published' : 'Hidden'}
                  </span>
                </td>
                <td>{new Date(a.created_at).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm" onClick={() => openModal(a)}>Edit</button>
                  <button className={`btn btn-sm ${a.is_published ? 'btn-danger' : 'btn-success'}`} onClick={() => togglePublish(a)}>
                    {a.is_published ? 'Hide' : 'Publish'}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => del(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ marginBottom: 20 }}>{editing ? 'Edit Article' : 'New Article'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={field}>
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={input}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={field}>
                <label>Title *</label>
                <input style={input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div style={field}>
                <label>Excerpt</label>
                <input style={input} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short summary shown in the list" />
              </div>
              <div style={field}>
                <label>Content *</label>
                <textarea style={{ ...input, height: 160 }} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ ...field, flex: 1 }}>
                  <label>Author</label>
                  <input style={input} value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
                </div>
                <div style={{ ...field, width: 120 }}>
                  <label>Read (min)</label>
                  <input type="number" min="1" style={input} value={form.read_minutes} onChange={e => setForm(f => ({ ...f, read_minutes: e.target.value }))} />
                </div>
              </div>
              <div style={field}>
                <label>Cover Image</label>
                <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} />
                {form.cover_image && !coverFile && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Current: {form.cover_image}</div>}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modal = { background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' };
const field = { marginBottom: 14 };
const input = { display: 'block', width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box', marginTop: 4 };

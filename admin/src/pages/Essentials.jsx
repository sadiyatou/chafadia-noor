import { useState, useEffect, useRef } from 'react';
import api from '../api/client';

const CATEGORIES = ['pillars', 'beliefs', 'worship', 'character', 'general'];
const MEDIA_TYPES = { text: 'Text only', video: '🎥 Video', audio: '🎵 Audio', image: '🖼️ Image' };
const ACCEPT = { video: 'video/*', audio: 'audio/*', image: 'image/*' };
const UPLOAD_ENDPOINT = { video: '/upload/community-media', audio: '/upload/voice-note', image: '/upload/community-media' };

export default function Essentials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'pillars', description: '', content: '', media_type: 'text', order_index: 0, media_url: '' });
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/essentials/admin/all');
      setItems(data.essentials || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const visible = filter ? items.filter(i => i.category === filter) : items;

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setForm({
        title: item.title, category: item.category, description: item.description || '',
        content: item.content || '', media_type: item.media_type || 'text',
        order_index: item.order_index || 0, media_url: item.media_url || '',
      });
    } else {
      setEditing(null);
      setForm({ title: '', category: 'pillars', description: '', content: '', media_type: 'text', order_index: 0, media_url: '' });
    }
    setFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { alert('Title is required.'); return; }
    setSaving(true);
    try {
      let media_url = form.media_url;
      if (file && form.media_type !== 'text') {
        const fd = new FormData();
        fd.append('file', file);
        const { data: up } = await api.post(UPLOAD_ENDPOINT[form.media_type], fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        media_url = up.url;
      }

      const payload = { ...form, media_url, order_index: parseInt(form.order_index) || 0 };
      if (editing) await api.put(`/essentials/${editing.id}`, payload);
      else await api.post('/essentials', payload);

      setShowModal(false);
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed.');
    } finally { setSaving(false); }
  };

  const togglePublish = async (item) => {
    try {
      await api.put(`/essentials/${item.id}`, { is_published: !item.is_published });
      setItems(prev => prev.map(x => x.id === item.id ? { ...x, is_published: !x.is_published } : x));
    } catch { alert('Failed.'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/essentials/${id}`);
      setItems(prev => prev.filter(x => x.id !== id));
    } catch { alert('Failed.'); }
  };

  return (
    <>
      <div className="page-header">
        <h1>Islamic Essentials</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ New Lesson</button>
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
            <tr><th>#</th><th>Title</th><th>Category</th><th>Media</th><th>Published</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
            ) : visible.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 24 }}>No lessons yet. Create one!</td></tr>
            ) : visible.map(item => (
              <tr key={item.id}>
                <td>{item.order_index}</td>
                <td><strong>{item.title}</strong>{item.description && <div style={{ fontSize: 11, color: '#6b7280' }}>{item.description}</div>}</td>
                <td><span className="badge badge-green">{item.category}</span></td>
                <td>{MEDIA_TYPES[item.media_type] || 'Text only'}</td>
                <td>
                  <span className={`badge ${item.is_published ? 'badge-green' : 'badge-red'}`}>
                    {item.is_published ? 'Published' : 'Hidden'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm" onClick={() => openModal(item)}>Edit</button>
                  <button className={`btn btn-sm ${item.is_published ? 'btn-danger' : 'btn-success'}`} onClick={() => togglePublish(item)}>
                    {item.is_published ? 'Hide' : 'Publish'}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => del(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ marginBottom: 20 }}>{editing ? 'Edit Lesson' : 'New Lesson'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ ...field, flex: 1 }}>
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={input}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ ...field, width: 100 }}>
                  <label>Order</label>
                  <input type="number" style={input} value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: e.target.value }))} />
                </div>
              </div>
              <div style={field}>
                <label>Title *</label>
                <input style={input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div style={field}>
                <label>Description</label>
                <input style={input} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={field}>
                <label>Content</label>
                <textarea style={{ ...input, height: 120 }} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Lesson text (optional if media-only)" />
              </div>
              <div style={field}>
                <label>Media Type</label>
                <select value={form.media_type} onChange={e => { setForm(f => ({ ...f, media_type: e.target.value })); setFile(null); }} style={input}>
                  {Object.entries(MEDIA_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {form.media_type !== 'text' && (
                <div style={field}>
                  <label>Media File {editing ? '(leave empty to keep current)' : '*'}</label>
                  <input ref={fileRef} type="file" accept={ACCEPT[form.media_type]} onChange={e => setFile(e.target.files[0])} />
                  {form.media_url && !file && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Current: {form.media_url}</div>}
                </div>
              )}
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

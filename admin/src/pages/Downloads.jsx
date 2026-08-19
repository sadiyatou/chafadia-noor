import { useState, useEffect, useRef } from 'react';
import api from '../api/client';

const CATEGORIES = ['general', 'quran', 'lectures', 'nasheeds', 'courses', 'kids'];
const TYPE_LABELS = { video: '🎥 Video', audio: '🎵 Audio', pdf: '📄 PDF', document: '📃 Document', image: '🖼️ Image' };
const ACCEPT = { video: 'video/*', audio: 'audio/*', pdf: '.pdf', document: '*', image: 'image/*' };
const UPLOAD_ENDPOINT = { video: '/upload/community-media', audio: '/upload/voice-note', pdf: '/upload/document', document: '/upload/document', image: '/upload/community-media' };

function formatSize(bytes) {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export default function Downloads() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: 'general', file_type: 'video' });
  const [file, setFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const fileRef = useRef();

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/downloads/admin/all');
      setItems(data.downloads || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const visible = filter ? items.filter(i => i.category === filter) : items;

  const openModal = () => {
    setForm({ title: '', description: '', category: 'general', file_type: 'video' });
    setFile(null);
    setThumbFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !file) { alert('Title and file are required.'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data: up } = await api.post(UPLOAD_ENDPOINT[form.file_type], fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      let thumbnail_url = null;
      if (thumbFile) {
        const tfd = new FormData();
        tfd.append('file', thumbFile);
        const { data: tup } = await api.post('/upload/community-media', tfd, { headers: { 'Content-Type': 'multipart/form-data' } });
        thumbnail_url = tup.url;
      }

      await api.post('/downloads', {
        title: form.title,
        description: form.description,
        category: form.category,
        file_type: form.file_type,
        file_url: up.url,
        file_name: file.name,
        file_size: file.size,
        thumbnail_url,
      });

      setShowModal(false);
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally { setUploading(false); }
  };

  const togglePublish = async (item) => {
    try {
      await api.put(`/downloads/${item.id}`, { is_published: !item.is_published });
      setItems(prev => prev.map(x => x.id === item.id ? { ...x, is_published: !x.is_published } : x));
    } catch { alert('Failed.'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this file? Devices that already downloaded it will keep their local copy.')) return;
    try {
      await api.delete(`/downloads/${id}`);
      setItems(prev => prev.filter(x => x.id !== id));
    } catch { alert('Failed.'); }
  };

  return (
    <>
      <div className="page-header">
        <h1>Offline Downloads</h1>
        <button className="btn btn-primary" onClick={openModal}>+ Upload Material</button>
      </div>
      <p style={{ color: '#6b7280', fontSize: 13, marginTop: -8, marginBottom: 16 }}>
        Files uploaded here appear in every user's Downloads tab and can be saved to their device for offline use.
      </p>

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
            <tr><th>Title</th><th>Type</th><th>Category</th><th>Size</th><th>Downloads</th><th>Published</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
            ) : visible.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24 }}>No material yet. Upload something!</td></tr>
            ) : visible.map(item => (
              <tr key={item.id}>
                <td><strong>{item.title}</strong>{item.description && <div style={{ fontSize: 11, color: '#6b7280' }}>{item.description}</div>}</td>
                <td><span className="badge badge-green">{TYPE_LABELS[item.file_type]}</span></td>
                <td>{item.category}</td>
                <td style={{ fontSize: 12 }}>{formatSize(item.file_size)}</td>
                <td>{item.download_count}</td>
                <td>
                  <span className={`badge ${item.is_published ? 'badge-green' : 'badge-red'}`}>
                    {item.is_published ? 'Published' : 'Hidden'}
                  </span>
                </td>
                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm" onClick={() => window.open(item.file_url, '_blank')}>View</button>
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
            <h2 style={{ marginBottom: 20 }}>Upload Offline Material</h2>
            <form onSubmit={handleSubmit}>
              <div style={field}>
                <label>Type</label>
                <select value={form.file_type} onChange={e => { setForm(f => ({ ...f, file_type: e.target.value })); setFile(null); }} style={input}>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
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
                <label>Description</label>
                <textarea style={{ ...input, height: 72 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={field}>
                <label>File * ({TYPE_LABELS[form.file_type]})</label>
                <input ref={fileRef} type="file" accept={ACCEPT[form.file_type]} onChange={e => setFile(e.target.files[0])} />
                {file && <div style={{ fontSize: 12, color: '#059669' }}>Selected: {file.name} ({formatSize(file.size)})</div>}
              </div>
              <div style={field}>
                <label>Thumbnail (optional)</label>
                <input type="file" accept="image/*" onChange={e => setThumbFile(e.target.files[0])} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload & Publish'}
                </button>
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
const modal = { background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' };
const field = { marginBottom: 14 };
const input = { display: 'block', width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box', marginTop: 4 };

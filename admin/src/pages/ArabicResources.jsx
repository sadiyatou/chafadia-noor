import { useState, useEffect, useRef } from 'react';
import api from '../api/client';

const TYPE_LABELS = { pdf: '📄 PDF', image: '🖼️ Image', video: '🎥 Video', audio: '🎵 Audio' };
const ACCEPT = { pdf: '.pdf', image: 'image/*', video: 'video/*', audio: 'audio/*' };
const UPLOAD_ENDPOINT = { pdf: '/upload/document', image: '/upload/community-media', video: '/upload/community-media', audio: '/upload/voice-note' };

export default function ArabicResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ title: '', description: '', type: 'pdf' });
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/arabic-resources/admin/all', { params: filter ? { type: filter } : {} });
      setResources(data.resources || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]);

  const openModal = () => {
    setForm({ title: '', description: '', type: 'pdf' });
    setFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !file) { alert('Title and file are required.'); return; }
    setUploading(true);
    try {
      // Step 1: upload file
      const fd = new FormData();
      fd.append('file', file);
      const { data: up } = await api.post(UPLOAD_ENDPOINT[form.type], fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Step 2: create resource record
      await api.post('/arabic-resources', {
        title: form.title,
        description: form.description,
        type: form.type,
        url: up.url,
        file_name: file.name,
        file_size: file.size,
      });

      setShowModal(false);
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally { setUploading(false); }
  };

  const togglePublish = async (r) => {
    try {
      await api.put(`/arabic-resources/${r.id}`, { is_published: !r.is_published });
      setResources(prev => prev.map(x => x.id === r.id ? { ...x, is_published: !x.is_published } : x));
    } catch { alert('Failed.'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await api.delete(`/arabic-resources/${id}`);
      setResources(prev => prev.filter(x => x.id !== id));
    } catch { alert('Failed.'); }
  };

  return (
    <>
      <div className="page-header">
        <h1>Arabic Resources</h1>
        <button className="btn btn-primary" onClick={openModal}>+ Upload Resource</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['', 'pdf', 'image', 'video', 'audio'].map(t => (
          <button key={t} className={`btn btn-sm ${filter === t ? 'btn-primary' : ''}`}
            onClick={() => setFilter(t)}>
            {t ? TYPE_LABELS[t] : 'All'}
          </button>
        ))}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Title</th><th>Type</th><th>File</th><th>Views</th><th>Published</th><th>Uploaded By</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
            ) : resources.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24 }}>No resources yet. Upload one!</td></tr>
            ) : resources.map(r => (
              <tr key={r.id}>
                <td><strong>{r.title}</strong>{r.description && <div style={{ fontSize: 11, color: '#6b7280' }}>{r.description}</div>}</td>
                <td><span className="badge badge-green">{TYPE_LABELS[r.type]}</span></td>
                <td style={{ fontSize: 12 }}>{r.file_name || '—'}</td>
                <td>{r.view_count}</td>
                <td>
                  <span className={`badge ${r.is_published ? 'badge-green' : 'badge-red'}`}>
                    {r.is_published ? 'Published' : 'Hidden'}
                  </span>
                </td>
                <td>{r.uploader_name || '—'}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm" onClick={() => window.open(r.url, '_blank')}>View</button>
                  <button className={`btn btn-sm ${r.is_published ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => togglePublish(r)}>
                    {r.is_published ? 'Hide' : 'Publish'}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => del(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ marginBottom: 20 }}>Upload Arabic Resource</h2>
            <form onSubmit={handleSubmit}>
              <div style={field}>
                <label>Resource Type</label>
                <select value={form.type} onChange={e => { setForm(f => ({ ...f, type: e.target.value })); setFile(null); }} style={input}>
                  <option value="pdf">PDF Document</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              <div style={field}>
                <label>Title *</label>
                <input style={input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Arabic Alphabet Chart" required />
              </div>
              <div style={field}>
                <label>Description</label>
                <textarea style={{ ...input, height: 72 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
              </div>
              <div style={field}>
                <label>File * ({TYPE_LABELS[form.type]})</label>
                <input ref={fileRef} type="file" accept={ACCEPT[form.type]} onChange={e => setFile(e.target.files[0])} style={{ marginBottom: 4 }} />
                {file && <div style={{ fontSize: 12, color: '#059669' }}>Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</div>}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload & Save'}
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

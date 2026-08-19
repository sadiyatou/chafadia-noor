import { useState, useEffect } from 'react';
import api from '../api/client';

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const LESSON_TYPES = ['text', 'video', 'audio', 'pdf', 'quiz'];
const UPLOAD_EP = { video: '/upload/community-media', audio: '/upload/voice-note', pdf: '/upload/document' };

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'edit' | 'enrollments'
  const [selected, setSelected] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', type: 'text', order_index: 0, duration_minutes: 0 });
  const [lessonFile, setLessonFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', level: 'beginner', language: 'en', duration_minutes: 0, is_published: false });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/courses/admin/all');
      setCourses(data.courses || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const openNew = () => {
    setSelected(null);
    setCourseForm({ title: '', description: '', level: 'beginner', language: 'en', duration_minutes: 0, is_published: false });
    setLessons([]);
    setView('edit');
  };

  const openEdit = async (course) => {
    setSelected(course);
    setCourseForm({ title: course.title, description: course.description || '', level: course.level, language: course.language, duration_minutes: course.duration_minutes, is_published: course.is_published });
    try {
      const { data } = await api.get(`/courses/${course.id}`);
      setLessons(data.lessons || []);
    } catch { setLessons([]); }
    setView('edit');
  };

  const openEnrollments = async (course) => {
    setSelected(course);
    try {
      const { data } = await api.get(`/courses/${course.id}/enrollments`);
      setEnrollments(data.enrollments || []);
    } catch { setEnrollments([]); }
    setView('enrollments');
  };

  const saveCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selected) {
        const { data } = await api.put(`/courses/${selected.id}`, courseForm);
        setCourses(prev => prev.map(c => c.id === selected.id ? { ...c, ...data.course } : c));
        setSelected(data.course);
      } else {
        const { data } = await api.post('/courses', courseForm);
        setCourses(prev => [data.course, ...prev]);
        setSelected(data.course);
      }
    } catch (e) { alert(e.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course and all its lessons?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
      setView('list');
    } catch { alert('Failed.'); }
  };

  const addLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title) { alert('Title is required.'); return; }
    if (!selected) { alert('Save the course first.'); return; }
    setSaving(true);
    try {
      let media_url = null, file_name = null;
      if (lessonFile && UPLOAD_EP[lessonForm.type]) {
        const fd = new FormData();
        fd.append('file', lessonFile);
        const { data: up } = await api.post(UPLOAD_EP[lessonForm.type], fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        media_url = up.url;
        file_name = lessonFile.name;
      }
      const { data } = await api.post(`/courses/${selected.id}/lessons`, { ...lessonForm, media_url, file_name });
      setLessons(prev => [...prev, data.lesson].sort((a, b) => a.order_index - b.order_index));
      setShowLessonModal(false);
      setLessonFile(null);
      setLessonForm({ title: '', content: '', type: 'text', order_index: lessons.length, duration_minutes: 0 });
    } catch (e) { alert(e.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const sendCertificate = async (courseId, userId, name) => {
    if (!confirm(`Send certificate to ${name}?`)) return;
    try {
      await api.post(`/courses/${courseId}/enrollments/${userId}/certificate`);
      setEnrollments(prev => prev.map(e => e.user_id === userId ? { ...e, certificate_sent: true } : e));
      alert('Certificate sent!');
    } catch (e) { alert(e.response?.data?.message || 'Failed.'); }
  };

  if (view === 'enrollments' && selected) return (
    <>
      <div className="page-header">
        <h1>Enrollments — {selected.title}</h1>
        <button className="btn" onClick={() => setView('list')}>← Back</button>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Student</th><th>Email</th><th>Progress</th><th>Completed</th><th>Enrolled</th><th>Certificate</th></tr></thead>
          <tbody>
            {enrollments.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 24 }}>No enrollments yet.</td></tr>
            ) : enrollments.map(e => (
              <tr key={e.id}>
                <td><strong>{e.full_name}</strong></td>
                <td>{e.email || '—'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4 }}>
                      <div style={{ width: `${e.progress_percent}%`, height: '100%', background: '#059669', borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12 }}>{e.progress_percent}%</span>
                  </div>
                </td>
                <td>{e.completed_at ? <span className="badge badge-green">✓ Done</span> : <span className="badge badge-gray">In Progress</span>}</td>
                <td>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                <td>
                  {e.certificate_sent
                    ? <span className="badge badge-green">Sent ✓</span>
                    : <button className="btn btn-sm btn-success" onClick={() => sendCertificate(selected.id, e.user_id, e.full_name)} disabled={!e.completed_at}>
                        {e.completed_at ? 'Send Certificate' : 'Not completed'}
                      </button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  if (view === 'edit') return (
    <>
      <div className="page-header">
        <h1>{selected ? 'Edit Course' : 'New Course'}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {selected && <button className="btn btn-danger" onClick={() => deleteCourse(selected.id)}>Delete Course</button>}
          <button className="btn" onClick={() => setView('list')}>← Back</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Course Details</h3>
        <form onSubmit={saveCourse} style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={lbl}>Title *</label>
              <input style={inp} value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <label style={lbl}>Level</label>
              <select style={inp} value={courseForm.level} onChange={e => setCourseForm(f => ({ ...f, level: e.target.value }))}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Description</label>
            <textarea style={{ ...inp, height: 80 }} value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={lbl}>Language</label>
              <select style={inp} value={courseForm.language} onChange={e => setCourseForm(f => ({ ...f, language: e.target.value }))}>
                {['en','ar','fr','ha','sw','ur','tr','id'].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Duration (minutes)</label>
              <input style={inp} type="number" min={0} value={courseForm.duration_minutes} onChange={e => setCourseForm(f => ({ ...f, duration_minutes: +e.target.value }))} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={courseForm.is_published} onChange={e => setCourseForm(f => ({ ...f, is_published: e.target.checked }))} />
                <span style={{ fontWeight: 600 }}>Published (visible to users)</span>
              </label>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: 'fit-content' }}>
            {saving ? 'Saving...' : selected ? 'Save Changes' : 'Create Course'}
          </button>
        </form>
      </div>

      {selected && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Lessons ({lessons.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { setLessonForm({ title: '', content: '', type: 'text', order_index: lessons.length, duration_minutes: 0 }); setLessonFile(null); setShowLessonModal(true); }}>+ Add Lesson</button>
          </div>
          {lessons.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: 20 }}>No lessons yet. Add the first lesson.</p>
          ) : (
            <table>
              <thead><tr><th>#</th><th>Title</th><th>Type</th><th>Duration</th><th>Media</th></tr></thead>
              <tbody>
                {lessons.map((l) => (
                  <tr key={l.id}>
                    <td>{l.order_index + 1}</td>
                    <td><strong>{l.title}</strong>{l.content && <div style={{ fontSize: 11, color: '#6b7280', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.content}</div>}</td>
                    <td><span className="badge badge-green">{l.type}</span></td>
                    <td>{l.duration_minutes ? `${l.duration_minutes} min` : '—'}</td>
                    <td>{l.media_url ? <a href={l.media_url} target="_blank" rel="noreferrer" style={{ color: '#059669' }}>View</a> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showLessonModal && (
        <div style={overlayS}>
          <div style={modalS}>
            <h3 style={{ marginBottom: 16 }}>Add Lesson</h3>
            <form onSubmit={addLesson} style={{ display: 'grid', gap: 12 }}>
              <div><label style={lbl}>Title *</label><input style={inp} value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Type</label>
                  <select style={inp} value={lessonForm.type} onChange={e => { setLessonForm(f => ({ ...f, type: e.target.value })); setLessonFile(null); }}>
                    {LESSON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Order</label><input style={inp} type="number" min={0} value={lessonForm.order_index} onChange={e => setLessonForm(f => ({ ...f, order_index: +e.target.value }))} /></div>
              </div>
              <div><label style={lbl}>Content / Text</label><textarea style={{ ...inp, height: 80 }} value={lessonForm.content} onChange={e => setLessonForm(f => ({ ...f, content: e.target.value }))} /></div>
              {['video','audio','pdf'].includes(lessonForm.type) && (
                <div>
                  <label style={lbl}>Upload File</label>
                  <input type="file" accept={lessonForm.type === 'video' ? 'video/*' : lessonForm.type === 'audio' ? 'audio/*' : '.pdf'} onChange={e => setLessonFile(e.target.files[0])} />
                  {lessonFile && <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>{lessonFile.name}</div>}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Lesson'}</button>
                <button type="button" className="btn" onClick={() => setShowLessonModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="page-header">
        <h1>Islamic Courses</h1>
        <button className="btn btn-primary" onClick={openNew}>+ New Course</button>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Title</th><th>Level</th><th>Lessons</th><th>Enrolled</th><th>Completed</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 24 }}>No courses yet.</td></tr>
            ) : courses.map(c => (
              <tr key={c.id}>
                <td><strong>{c.title}</strong></td>
                <td><span className="badge badge-gray">{c.level}</span></td>
                <td>{c.lesson_count}</td>
                <td>{c.enrollment_count}</td>
                <td>{c.completed_count}</td>
                <td><span className={`badge ${c.is_published ? 'badge-green' : 'badge-red'}`}>{c.is_published ? 'Published' : 'Draft'}</span></td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm btn-primary" onClick={() => openEdit(c)}>Edit</button>
                  <button className="btn btn-sm" onClick={() => openEnrollments(c)}>Enrollments</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const lbl = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' };
const inp = { display: 'block', width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' };
const overlayS = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalS = { background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto' };

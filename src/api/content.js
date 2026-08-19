import api from './client';

// ── Arabic Resources ────────────────────────────────────────────
export const getArabicResources = async (type = null) => {
  try {
    const params = {};
    if (type) params.type = type;
    const { data } = await api.get('/arabic-resources', { params });
    return data;
  } catch (e) { return { success: false, resources: [] }; }
};

// ── Courses ─────────────────────────────────────────────────────
export const getCourses = async (level = null) => {
  try {
    const params = {};
    if (level) params.level = level;
    const { data } = await api.get('/courses', { params });
    return data;
  } catch (e) { return { success: false, courses: [] }; }
};

export const getCourse = async (id) => {
  try {
    const { data } = await api.get(`/courses/${id}`);
    return data;
  } catch (e) { return { success: false }; }
};

export const enrollCourse = async (id) => {
  try {
    const { data } = await api.post(`/courses/${id}/enroll`);
    return data;
  } catch (e) { return { success: false, message: e.response?.data?.message || 'Failed.' }; }
};

export const completeLesson = async (courseId, lessonId) => {
  try {
    const { data } = await api.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
    return data;
  } catch (e) { return { success: false }; }
};

// ── Articles ────────────────────────────────────────────────────
export const getArticles = async (category = null) => {
  try {
    const params = {};
    if (category) params.category = category;
    const { data } = await api.get('/articles', { params });
    return data;
  } catch (e) { return { success: false, articles: [] }; }
};

export const getArticle = async (id) => {
  try {
    const { data } = await api.get(`/articles/${id}`);
    return data;
  } catch (e) { return { success: false }; }
};

// ── Islamic Essentials ─────────────────────────────────────────
export const getEssentials = async (category = null) => {
  try {
    const params = {};
    if (category) params.category = category;
    const { data } = await api.get('/essentials', { params });
    return data;
  } catch (e) { return { success: false, essentials: [] }; }
};

export const getEssential = async (id) => {
  try {
    const { data } = await api.get(`/essentials/${id}`);
    return data;
  } catch (e) { return { success: false }; }
};

// ── Offline Downloads ───────────────────────────────────────────
export const getDownloads = async (category = null) => {
  try {
    const params = {};
    if (category) params.category = category;
    const { data } = await api.get('/downloads', { params });
    return data;
  } catch (e) { return { success: false, downloads: [] }; }
};

export const registerDownload = async (id) => {
  try {
    const { data } = await api.get(`/downloads/${id}`);
    return data;
  } catch (e) { return { success: false }; }
};

import api, { saveToken, saveUser, clearAuth, getToken, getUser } from './client';

export const registerUser = async ({ fullName, email, phone, password }) => {
  try {
    const { data } = await api.post('/auth/register', { fullName, email, phone, password });
    if (data.success && data.token) {
      await saveToken(data.token);
      await saveUser(data.user);
    }
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Cannot connect to server.' };
  }
};

export const loginUser = async ({ contact, password }) => {
  try {
    const { data } = await api.post('/auth/login', { contact, password });
    if (data.success && data.token) {
      await saveToken(data.token);
      await saveUser(data.user);
    }
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Cannot connect to server.' };
  }
};

export const logoutUser = async () => {
  try { await api.post('/auth/logout'); } catch (_) {}
  await clearAuth();
  return { success: true };
};

export const resetPassword = async (email) => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Could not send reset email.' };
  }
};

export const getMe = async () => {
  try {
    const { data } = await api.get('/auth/me');
    if (data.success) await saveUser(data.user);
    return data;
  } catch (error) {
    return { success: false, user: null };
  }
};

export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

export const getCurrentUser = async () => getUser();

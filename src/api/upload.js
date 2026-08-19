import api from './client';

// React Native FormData needs { uri, name, type } for a file part, not a Blob/File.
export const uploadFile = async (endpoint, uri, name, mimeType) => {
  const fd = new FormData();
  fd.append('file', { uri, name, type: mimeType });
  const { data } = await api.post(endpoint, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
};

// 'audio/mp4' is the m4a container's registered MIME type and is on the
// server's allowlist (server/config/multer.js) — 'audio/m4a' is not.
export const uploadVoiceNote  = (uri, name = `voice_${Date.now()}.m4a`, mimeType = 'audio/mp4') =>
  uploadFile('/upload/voice-note', uri, name, mimeType);

export const uploadChatMedia  = (uri, name, mimeType) =>
  uploadFile('/upload/chat-media', uri, name, mimeType);

export const uploadDocument   = (uri, name, mimeType) =>
  uploadFile('/upload/document', uri, name, mimeType);

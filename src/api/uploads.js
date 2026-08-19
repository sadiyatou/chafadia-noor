import api from './client';
import { Platform } from 'react-native';

const uploadFile = async (uri, endpoint) => {
  try {
    const formData = new FormData();
    const ext = uri.split('.').pop() || 'jpg';
    const name = `upload-${Date.now()}.${ext}`;

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('file', blob, name);
    } else {
      formData.append('file', { uri, name, type: 'application/octet-stream' });
    }

    const { data } = await api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });

    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Upload failed.' };
  }
};

export const uploadProfileImage = (uri) => uploadFile(uri, '/upload/profile-image');
export const uploadChatImage = (uri) => uploadFile(uri, '/upload/chat-media');
export const uploadChatVideo = (uri) => uploadFile(uri, '/upload/chat-media');
export const uploadVoiceNote = (uri) => uploadFile(uri, '/upload/voice-note');
export const uploadDocument = ({ uri }) => uploadFile(uri, '/upload/document');
export const uploadCommunityMedia = ({ uri }) => uploadFile(uri, '/upload/community-media');
export const uploadStatusMedia = ({ uri }) => uploadFile(uri, '/upload/status-media');
export const uploadLiveThumbnail = (uri) => uploadFile(uri, '/upload/stream-thumbnail');

export const deleteFile = async (filename, subDir) => {
  try {
    const { data } = await api.delete('/upload', { data: { filename, subDir } });
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed.' };
  }
};

export default {
  uploadProfileImage, uploadChatImage, uploadChatVideo,
  uploadVoiceNote, uploadDocument, uploadCommunityMedia,
  uploadStatusMedia, uploadLiveThumbnail, deleteFile,
};

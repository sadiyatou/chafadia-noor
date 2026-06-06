// src/api/storageApi.js

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import uploadService from '../services/uploadService';

/* =========================================================
   GENERAL UPLOAD
========================================================= */

export const uploadFile = async options => {
  try {
    const response = await uploadService.uploadFile(options);

    return {
      success: response.success,
      data: response,
      message: response.success
        ? 'File uploaded successfully.'
        : response.error,
    };
  } catch (error) {
    console.log('UPLOAD FILE API ERROR:', error);

    return {
      success: false,
      data: null,
      message: error.message || 'Failed to upload file.',
    };
  }
};

/* =========================================================
   PROFILE / CHAT / COMMUNITY / STATUS
========================================================= */

export const uploadProfileImage = async (uri, userId) => {
  return uploadService.uploadProfileImage(uri, userId);
};

export const uploadChatImage = async (uri, userId) => {
  return uploadService.uploadChatImage(uri, userId);
};

export const uploadChatVideo = async (uri, userId) => {
  return uploadService.uploadChatVideo(uri, userId);
};

export const uploadVoiceNote = async (uri, userId) => {
  return uploadService.uploadVoiceNote(uri, userId);
};

export const uploadDocument = async ({
  uri,
  userId,
  fileName = '',
  mimeType = '',
}) => {
  return uploadService.uploadDocument({
    uri,
    userId,
    fileName,
    mimeType,
  });
};

export const uploadCommunityMedia = async ({
  uri,
  userId,
  type = 'image',
  fileName = '',
  mimeType = '',
}) => {
  return uploadService.uploadCommunityMedia({
    uri,
    userId,
    type,
    fileName,
    mimeType,
  });
};

export const uploadStatusMedia = async ({
  uri,
  userId,
  type = 'image',
  fileName = '',
  mimeType = '',
}) => {
  return uploadService.uploadStatusMedia({
    uri,
    userId,
    type,
    fileName,
    mimeType,
  });
};

/* =========================================================
   MULTIPLE UPLOADS
========================================================= */

export const uploadMultipleFiles = async ({
  files = [],
  userId,
  folder = 'uploads',
}) => {
  try {
    const uploaded = [];

    for (const file of files) {
      const response = await uploadService.uploadFile({
        uri: file.uri,
        userId,
        folder,
        fileName: file.name || file.fileName || '',
        contentType: file.mimeType || file.type || '',
      });

      uploaded.push(response);
    }

    return {
      success: true,
      files: uploaded,
    };
  } catch (error) {
    console.log('UPLOAD MULTIPLE FILES ERROR:', error);

    return {
      success: false,
      files: [],
      message: error.message || 'Failed to upload files.',
    };
  }
};

/* =========================================================
   DOWNLOAD FILE
========================================================= */

export const downloadFile = async ({
  url,
  fileName = `download-${Date.now()}`,
}) => {
  try {
    if (!url) {
      return {
        success: false,
        message: 'Download URL is required.',
      };
    }

    const downloadPath = `${FileSystem.documentDirectory}${fileName}`;

    const result = await FileSystem.downloadAsync(url, downloadPath);

    return {
      success: true,
      uri: result.uri,
      status: result.status,
      message: 'File downloaded successfully.',
    };
  } catch (error) {
    console.log('DOWNLOAD FILE ERROR:', error);

    return {
      success: false,
      uri: null,
      message: error.message || 'Failed to download file.',
    };
  }
};

/* =========================================================
   SHARE / SAVE DOWNLOADED FILE
========================================================= */

export const shareDownloadedFile = async uri => {
  try {
    if (!uri) {
      return {
        success: false,
        message: 'File URI is required.',
      };
    }

    const available = await Sharing.isAvailableAsync();

    if (!available) {
      return {
        success: false,
        message: 'Sharing is not available on this device.',
      };
    }

    await Sharing.shareAsync(uri);

    return {
      success: true,
      message: 'File shared successfully.',
    };
  } catch (error) {
    console.log('SHARE FILE ERROR:', error);

    return {
      success: false,
      message: error.message || 'Failed to share file.',
    };
  }
};

export const downloadAndShareFile = async ({
  url,
  fileName = `download-${Date.now()}`,
}) => {
  const download = await downloadFile({
    url,
    fileName,
  });

  if (!download.success) return download;

  return shareDownloadedFile(download.uri);
};

/* =========================================================
   LOCAL FILE HELPERS
========================================================= */

export const getLocalFileInfo = async uri => {
  try {
    const info = await FileSystem.getInfoAsync(uri);

    return {
      success: true,
      info,
    };
  } catch (error) {
    console.log('GET LOCAL FILE INFO ERROR:', error);

    return {
      success: false,
      info: null,
      message: error.message,
    };
  }
};

export const deleteLocalFile = async uri => {
  try {
    const info = await FileSystem.getInfoAsync(uri);

    if (info.exists) {
      await FileSystem.deleteAsync(uri, {
        idempotent: true,
      });
    }

    return {
      success: true,
      message: 'Local file deleted successfully.',
    };
  } catch (error) {
    console.log('DELETE LOCAL FILE ERROR:', error);

    return {
      success: false,
      message: error.message || 'Failed to delete local file.',
    };
  }
};

/* =========================================================
   FIREBASE DELETE
========================================================= */

export const deleteFile = async path => {
  try {
    const response = await uploadService.deleteFile(path);

    return {
      success: response.success,
      message: response.success
        ? 'File deleted successfully.'
        : response.error,
    };
  } catch (error) {
    console.log('DELETE STORAGE FILE ERROR:', error);

    return {
      success: false,
      message: error.message || 'Failed to delete file.',
    };
  }
};

/* =========================================================
   HELPERS
========================================================= */

export const getFileExtension = uri => {
  return uploadService.getFileExtension(uri);
};

export const createFileName = options => {
  return uploadService.createFileName(options);
};

export const uriToBlob = async uri => {
  return uploadService.uriToBlob(uri);
};

/* =========================================================
   EXPORT DEFAULT
========================================================= */

export default {
  uploadFile,

  uploadProfileImage,
  uploadChatImage,
  uploadChatVideo,
  uploadVoiceNote,
  uploadDocument,
  uploadCommunityMedia,
  uploadStatusMedia,

  uploadMultipleFiles,

  downloadFile,
  shareDownloadedFile,
  downloadAndShareFile,

  getLocalFileInfo,
  deleteLocalFile,

  deleteFile,

  getFileExtension,
  createFileName,
  uriToBlob,
};
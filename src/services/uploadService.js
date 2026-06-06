// src/services/uploadService.js

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

import { storage } from '../firebase/firebaseConfig';

/* =========================================================
   CONVERT LOCAL URI TO BLOB
========================================================= */

export const uriToBlob = async uri => {
  const response = await fetch(uri);
  return await response.blob();
};

/* =========================================================
   GET FILE EXTENSION
========================================================= */

export const getFileExtension = uri => {
  if (!uri) return 'file';

  const cleanUri = uri.split('?')[0];
  const parts = cleanUri.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'file';
};

/* =========================================================
   CREATE UNIQUE FILE NAME
========================================================= */

export const createFileName = ({
  userId = 'unknown',
  folder = 'uploads',
  uri = '',
  fileName = '',
}) => {
  const extension = fileName
    ? getFileExtension(fileName)
    : getFileExtension(uri);

  return `${folder}/${userId}/${Date.now()}.${extension}`;
};

/* =========================================================
   UPLOAD FILE TO FIREBASE STORAGE
========================================================= */

export const uploadFile = async ({
  uri,
  userId = 'unknown',
  folder = 'uploads',
  fileName = '',
  contentType = '',
}) => {
  try {
    if (!uri) {
      return {
        success: false,
        error: 'No file URI provided.',
      };
    }

    const blob = await uriToBlob(uri);

    const path = createFileName({
      userId,
      folder,
      uri,
      fileName,
    });

    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, blob, {
      contentType: contentType || blob.type || 'application/octet-stream',
    });

    const downloadURL = await getDownloadURL(storageRef);

    return {
      success: true,
      url: downloadURL,
      path,
      fileName: fileName || path.split('/').pop(),
      contentType: contentType || blob.type || '',
    };
  } catch (error) {
    console.log('UPLOAD FILE ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   PROFILE PICTURE
========================================================= */

export const uploadProfileImage = async (uri, userId) => {
  return uploadFile({
    uri,
    userId,
    folder: 'profilePictures',
    contentType: 'image/jpeg',
  });
};

/* =========================================================
   CHAT IMAGE
========================================================= */

export const uploadChatImage = async (uri, userId) => {
  return uploadFile({
    uri,
    userId,
    folder: 'chatImages',
    contentType: 'image/jpeg',
  });
};

/* =========================================================
   CHAT VIDEO
========================================================= */

export const uploadChatVideo = async (uri, userId) => {
  return uploadFile({
    uri,
    userId,
    folder: 'chatVideos',
    contentType: 'video/mp4',
  });
};

/* =========================================================
   VOICE NOTE
========================================================= */

export const uploadVoiceNote = async (uri, userId) => {
  return uploadFile({
    uri,
    userId,
    folder: 'voiceNotes',
    contentType: 'audio/m4a',
  });
};

/* =========================================================
   DOCUMENT
========================================================= */

export const uploadDocument = async ({
  uri,
  userId,
  fileName = '',
  mimeType = '',
}) => {
  return uploadFile({
    uri,
    userId,
    folder: 'documents',
    fileName,
    contentType: mimeType || 'application/octet-stream',
  });
};

/* =========================================================
   COMMUNITY MEDIA
========================================================= */

export const uploadCommunityMedia = async ({
  uri,
  userId,
  type = 'image',
  fileName = '',
  mimeType = '',
}) => {
  const folder =
    type === 'video'
      ? 'communityVideos'
      : type === 'audio'
      ? 'communityAudio'
      : type === 'file'
      ? 'communityFiles'
      : 'communityImages';

  return uploadFile({
    uri,
    userId,
    folder,
    fileName,
    contentType: mimeType,
  });
};

/* =========================================================
   STATUS MEDIA
========================================================= */

export const uploadStatusMedia = async ({
  uri,
  userId,
  type = 'image',
  fileName = '',
  mimeType = '',
}) => {
  const folder = type === 'video' ? 'statusVideos' : 'statusImages';

  return uploadFile({
    uri,
    userId,
    folder,
    fileName,
    contentType: mimeType,
  });
};

/* =========================================================
   DELETE FILE FROM STORAGE
========================================================= */

export const deleteFile = async path => {
  try {
    if (!path) {
      return {
        success: false,
        error: 'No storage path provided.',
      };
    }

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);

    return {
      success: true,
    };
  } catch (error) {
    console.log('DELETE FILE ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   EXPORT ALL
========================================================= */

export default {
  uriToBlob,
  getFileExtension,
  createFileName,
  uploadFile,

  uploadProfileImage,
  uploadChatImage,
  uploadChatVideo,
  uploadVoiceNote,
  uploadDocument,
  uploadCommunityMedia,
  uploadStatusMedia,

  deleteFile,
};
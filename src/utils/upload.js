import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import storageApi from '../api/storageApi';
import {
  requestCameraPermission,
  requestMediaLibraryPermission,
} from './permissions';

/* =========================================================
   PICK IMAGE FROM GALLERY
========================================================= */

export const pickImage = async () => {
  const granted = await requestMediaLibraryPermission();

  if (!granted) {
    return {
      success: false,
      asset: null,
      message: 'Gallery permission denied.',
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.9,
  });

  if (result.canceled) {
    return {
      success: false,
      asset: null,
      message: 'Image selection cancelled.',
    };
  }

  return {
    success: true,
    asset: result.assets[0],
  };
};

/* =========================================================
   TAKE PHOTO
========================================================= */

export const takePhoto = async () => {
  const granted = await requestCameraPermission();

  if (!granted) {
    return {
      success: false,
      asset: null,
      message: 'Camera permission denied.',
    };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.9,
  });

  if (result.canceled) {
    return {
      success: false,
      asset: null,
      message: 'Camera cancelled.',
    };
  }

  return {
    success: true,
    asset: result.assets[0],
  };
};

/* =========================================================
   PICK VIDEO
========================================================= */

export const pickVideo = async () => {
  const granted = await requestMediaLibraryPermission();

  if (!granted) {
    return {
      success: false,
      asset: null,
      message: 'Gallery permission denied.',
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled) {
    return {
      success: false,
      asset: null,
      message: 'Video selection cancelled.',
    };
  }

  return {
    success: true,
    asset: result.assets[0],
  };
};

/* =========================================================
   PICK IMAGE OR VIDEO
========================================================= */

export const pickMedia = async () => {
  const granted = await requestMediaLibraryPermission();

  if (!granted) {
    return {
      success: false,
      asset: null,
      message: 'Gallery permission denied.',
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: false,
    quality: 0.85,
  });

  if (result.canceled) {
    return {
      success: false,
      asset: null,
      message: 'Media selection cancelled.',
    };
  }

  return {
    success: true,
    asset: result.assets[0],
  };
};

/* =========================================================
   PICK DOCUMENT
========================================================= */

export const pickDocument = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) {
    return {
      success: false,
      asset: null,
      message: 'Document selection cancelled.',
    };
  }

  return {
    success: true,
    asset: result.assets[0],
  };
};

/* =========================================================
   PICK MULTIPLE DOCUMENTS
========================================================= */

export const pickMultipleDocuments = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: true,
  });

  if (result.canceled) {
    return {
      success: false,
      assets: [],
      message: 'Document selection cancelled.',
    };
  }

  return {
    success: true,
    assets: result.assets || [],
  };
};

/* =========================================================
   UPLOAD HELPERS
========================================================= */

export const uploadPickedProfileImage = async userId => {
  const picked = await pickImage();

  if (!picked.success) return picked;

  const uploaded = await storageApi.uploadProfileImage(
    picked.asset.uri,
    userId
  );

  return {
    ...uploaded,
    asset: picked.asset,
  };
};

export const uploadPickedChatImage = async userId => {
  const picked = await pickImage();

  if (!picked.success) return picked;

  const uploaded = await storageApi.uploadChatImage(
    picked.asset.uri,
    userId
  );

  return {
    ...uploaded,
    asset: picked.asset,
  };
};

export const uploadPickedChatVideo = async userId => {
  const picked = await pickVideo();

  if (!picked.success) return picked;

  const uploaded = await storageApi.uploadChatVideo(
    picked.asset.uri,
    userId
  );

  return {
    ...uploaded,
    asset: picked.asset,
  };
};

export const uploadPickedDocument = async userId => {
  const picked = await pickDocument();

  if (!picked.success) return picked;

  const uploaded = await storageApi.uploadDocument({
    uri: picked.asset.uri,
    userId,
    fileName: picked.asset.name,
    mimeType: picked.asset.mimeType,
  });

  return {
    ...uploaded,
    asset: picked.asset,
  };
};

export const uploadPickedCommunityMedia = async userId => {
  const picked = await pickMedia();

  if (!picked.success) return picked;

  const type = picked.asset.type === 'video' ? 'video' : 'image';

  const uploaded = await storageApi.uploadCommunityMedia({
    uri: picked.asset.uri,
    userId,
    type,
    fileName: picked.asset.fileName || picked.asset.name || '',
    mimeType: picked.asset.mimeType || '',
  });

  return {
    ...uploaded,
    asset: picked.asset,
    type,
  };
};

export const uploadPickedStatusMedia = async userId => {
  const picked = await pickMedia();

  if (!picked.success) return picked;

  const type = picked.asset.type === 'video' ? 'video' : 'image';

  const uploaded = await storageApi.uploadStatusMedia({
    uri: picked.asset.uri,
    userId,
    type,
    fileName: picked.asset.fileName || picked.asset.name || '',
    mimeType: picked.asset.mimeType || '',
  });

  return {
    ...uploaded,
    asset: picked.asset,
    type,
  };
};

/* =========================================================
   FILE TYPE HELPERS
========================================================= */

export const getFileType = asset => {
  const mime = asset?.mimeType || '';
  const uri = asset?.uri || '';

  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (uri.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return 'image';
  if (uri.match(/\.(mp4|mov|avi|mkv|webm)$/i)) return 'video';
  if (uri.match(/\.(mp3|m4a|wav|aac)$/i)) return 'audio';

  return 'document';
};

export const formatUploadAsset = asset => {
  if (!asset) return null;

  return {
    uri: asset.uri,
    name:
      asset.name ||
      asset.fileName ||
      `file-${Date.now()}`,
    mimeType: asset.mimeType || '',
    size: asset.size || asset.fileSize || 0,
    type: getFileType(asset),
  };
};

/* =========================================================
   EXPORT DEFAULT
========================================================= */

export default {
  pickImage,
  takePhoto,
  pickVideo,
  pickMedia,
  pickDocument,
  pickMultipleDocuments,

  uploadPickedProfileImage,
  uploadPickedChatImage,
  uploadPickedChatVideo,
  uploadPickedDocument,
  uploadPickedCommunityMedia,
  uploadPickedStatusMedia,

  getFileType,
  formatUploadAsset,
};
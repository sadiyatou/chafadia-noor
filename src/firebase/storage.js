// src/firebase/storage.js

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
} from 'firebase/storage';

import { storage } from './firebaseConfig';

/* =========================================================
   URI TO BLOB
========================================================= */

export const uriToBlob = async uri => {
  const response = await fetch(uri);
  return await response.blob();
};

/* =========================================================
   CREATE FILE NAME
========================================================= */

export const createFileName = ({
  userId = 'user',
  extension = 'jpg',
  prefix = 'file',
}) => {
  return `${prefix}_${userId}_${Date.now()}.${extension}`;
};

/* =========================================================
   GET FILE EXTENSION
========================================================= */

export const getFileExtension = uri => {
  if (!uri) return '';

  const parts = uri.split('.');
  return parts[parts.length - 1];
};

/* =========================================================
   UPLOAD FILE
========================================================= */

export const uploadFile = async ({
  uri,
  storagePath,
}) => {
  try {
    const blob = await uriToBlob(uri);

    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, blob);

    const downloadURL =
      await getDownloadURL(storageRef);

    return {
      success: true,
      url: downloadURL,
      path: storagePath,
    };
  } catch (error) {
    console.log('UPLOAD FILE ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   UPLOAD WITH PROGRESS
========================================================= */

export const uploadFileWithProgress = ({
  uri,
  storagePath,
  onProgress,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const blob = await uriToBlob(uri);

      const storageRef = ref(
        storage,
        storagePath
      );

      const task =
        uploadBytesResumable(
          storageRef,
          blob
        );

      task.on(
        'state_changed',
        snapshot => {
          const progress =
            (snapshot.bytesTransferred /
              snapshot.totalBytes) *
            100;

          onProgress?.(progress);
        },
        error => {
          reject(error);
        },
        async () => {
          const downloadURL =
            await getDownloadURL(
              task.snapshot.ref
            );

          resolve({
            success: true,
            url: downloadURL,
            path: storagePath,
          });
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/* =========================================================
   PROFILE IMAGE
========================================================= */

export const uploadProfileImage =
  async (uri, userId) => {
    const extension =
      getFileExtension(uri);

    const fileName =
      createFileName({
        userId,
        extension,
        prefix: 'profile',
      });

    return uploadFile({
      uri,
      storagePath: `users/${userId}/profile/${fileName}`,
    });
  };

/* =========================================================
   CHAT IMAGE
========================================================= */

export const uploadChatImage =
  async (uri, userId) => {
    const extension =
      getFileExtension(uri);

    const fileName =
      createFileName({
        userId,
        extension,
        prefix: 'chat_image',
      });

    return uploadFile({
      uri,
      storagePath: `users/${userId}/chat/images/${fileName}`,
    });
  };

/* =========================================================
   CHAT VIDEO
========================================================= */

export const uploadChatVideo =
  async (uri, userId) => {
    const extension =
      getFileExtension(uri);

    const fileName =
      createFileName({
        userId,
        extension,
        prefix: 'chat_video',
      });

    return uploadFile({
      uri,
      storagePath: `users/${userId}/chat/videos/${fileName}`,
    });
  };

/* =========================================================
   VOICE NOTE
========================================================= */

export const uploadVoiceNote =
  async (uri, userId) => {
    const extension =
      getFileExtension(uri);

    const fileName =
      createFileName({
        userId,
        extension,
        prefix: 'voice_note',
      });

    return uploadFile({
      uri,
      storagePath: `users/${userId}/audio/${fileName}`,
    });
  };

/* =========================================================
   DOCUMENT
========================================================= */

export const uploadDocument =
  async ({
    uri,
    userId,
    fileName,
  }) => {
    return uploadFile({
      uri,
      storagePath: `users/${userId}/documents/${fileName}`,
    });
  };

/* =========================================================
   COMMUNITY MEDIA
========================================================= */

export const uploadCommunityMedia =
  async ({
    uri,
    userId,
    type = 'image',
  }) => {
    const extension =
      getFileExtension(uri);

    const fileName =
      createFileName({
        userId,
        extension,
        prefix: 'community',
      });

    return uploadFile({
      uri,
      storagePath: `community/${type}/${fileName}`,
    });
  };

/* =========================================================
   STATUS MEDIA
========================================================= */

export const uploadStatusMedia =
  async ({
    uri,
    userId,
    type = 'image',
  }) => {
    const extension =
      getFileExtension(uri);

    const fileName =
      createFileName({
        userId,
        extension,
        prefix: 'status',
      });

    return uploadFile({
      uri,
      storagePath: `status/${userId}/${type}/${fileName}`,
    });
  };

/* =========================================================
   LIVE STREAM THUMBNAIL
========================================================= */

export const uploadLiveThumbnail =
  async (uri, userId) => {
    const extension =
      getFileExtension(uri);

    const fileName =
      createFileName({
        userId,
        extension,
        prefix: 'stream',
      });

    return uploadFile({
      uri,
      storagePath: `streams/thumbnails/${fileName}`,
    });
  };

/* =========================================================
   GET DOWNLOAD URL
========================================================= */

export const getStorageDownloadUrl =
  async path => {
    try {
      const fileRef = ref(
        storage,
        path
      );

      const url =
        await getDownloadURL(fileRef);

      return {
        success: true,
        url,
      };
    } catch (error) {
      console.log(
        'GET DOWNLOAD URL ERROR:',
        error
      );

      return {
        success: false,
        url: null,
      };
    }
  };

/* =========================================================
   FILE METADATA
========================================================= */

export const getStorageFileMetadata =
  async path => {
    try {
      const fileRef = ref(
        storage,
        path
      );

      const metadata =
        await getMetadata(fileRef);

      return {
        success: true,
        metadata,
      };
    } catch (error) {
      console.log(
        'GET METADATA ERROR:',
        error
      );

      return {
        success: false,
        metadata: null,
      };
    }
  };

/* =========================================================
   LIST FILES
========================================================= */

export const listFiles = async path => {
  try {
    const folderRef = ref(
      storage,
      path
    );

    const result =
      await listAll(folderRef);

    const files =
      await Promise.all(
        result.items.map(
          async item => ({
            name: item.name,
            path: item.fullPath,
            url:
              await getDownloadURL(
                item
              ),
          })
        )
      );

    return {
      success: true,
      files,
    };
  } catch (error) {
    console.log(
      'LIST FILES ERROR:',
      error
    );

    return {
      success: false,
      files: [],
    };
  }
};

/* =========================================================
   DELETE FILE
========================================================= */

export const deleteFile =
  async path => {
    try {
      const fileRef = ref(
        storage,
        path
      );

      await deleteObject(fileRef);

      return {
        success: true,
      };
    } catch (error) {
      console.log(
        'DELETE FILE ERROR:',
        error
      );

      return {
        success: false,
        message: error.message,
      };
    }
  };

/* =========================================================
   EXPORT
========================================================= */

export default {
  uriToBlob,

  createFileName,
  getFileExtension,

  uploadFile,
  uploadFileWithProgress,

  uploadProfileImage,
  uploadChatImage,
  uploadChatVideo,
  uploadVoiceNote,
  uploadDocument,

  uploadCommunityMedia,
  uploadStatusMedia,

  uploadLiveThumbnail,

  getStorageDownloadUrl,
  getStorageFileMetadata,

  listFiles,
  deleteFile,
};
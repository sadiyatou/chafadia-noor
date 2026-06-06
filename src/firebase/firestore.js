import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

import { db } from './firebaseConfig';

/* =========================================================
   USERS
========================================================= */

export const createUserDocument = async (
  userId,
  userData
) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('CREATE USER ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const getUserDocument = async userId => {
  try {
    const snapshot = await getDoc(
      doc(db, 'users', userId)
    );

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.log('GET USER ERROR:', error);
    return null;
  }
};

export const updateUserDocument = async (
  userId,
  updates
) => {
  try {
    await updateDoc(
      doc(db, 'users', userId),
      {
        ...updates,
        updatedAt: serverTimestamp(),
      }
    );

    return {
      success: true,
    };
  } catch (error) {
    console.log('UPDATE USER ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   POSTS
========================================================= */

export const createPost = async postData => {
  try {
    const ref = await addDoc(
      collection(db, 'posts'),
      {
        ...postData,
        likes: 0,
        comments: 0,
        views: 0,
        createdAt: serverTimestamp(),
      }
    );

    return {
      success: true,
      postId: ref.id,
    };
  } catch (error) {
    console.log('CREATE POST ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const getPosts = async () => {
  try {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(docItem => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.log('GET POSTS ERROR:', error);
    return [];
  }
};

export const deletePost = async postId => {
  try {
    await deleteDoc(doc(db, 'posts', postId));

    return {
      success: true,
    };
  } catch (error) {
    console.log('DELETE POST ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   CHATS
========================================================= */

export const createChat = async chatData => {
  try {
    const ref = await addDoc(
      collection(db, 'chats'),
      {
        ...chatData,
        createdAt: serverTimestamp(),
      }
    );

    return {
      success: true,
      chatId: ref.id,
    };
  } catch (error) {
    console.log('CREATE CHAT ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const sendMessage = async (
  chatId,
  messageData
) => {
  try {
    const ref = await addDoc(
      collection(
        db,
        'chats',
        chatId,
        'messages'
      ),
      {
        ...messageData,
        createdAt: serverTimestamp(),
      }
    );

    return {
      success: true,
      messageId: ref.id,
    };
  } catch (error) {
    console.log('SEND MESSAGE ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const getMessages = async chatId => {
  try {
    const q = query(
      collection(
        db,
        'chats',
        chatId,
        'messages'
      ),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(docItem => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.log('GET MESSAGES ERROR:', error);
    return [];
  }
};

export const listenToMessages = (
  chatId,
  callback
) => {
  const q = query(
    collection(
      db,
      'chats',
      chatId,
      'messages'
    ),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(
      docItem => ({
        id: docItem.id,
        ...docItem.data(),
      })
    );

    callback(messages);
  });
};

/* =========================================================
   CALLS
========================================================= */

export const createCall = async callData => {
  try {
    const ref = await addDoc(
      collection(db, 'calls'),
      {
        ...callData,
        createdAt: serverTimestamp(),
      }
    );

    return {
      success: true,
      callId: ref.id,
    };
  } catch (error) {
    console.log('CREATE CALL ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const getCalls = async userId => {
  try {
    const q = query(
      collection(db, 'calls'),
      where('participants', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(docItem => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.log('GET CALLS ERROR:', error);
    return [];
  }
};

/* =========================================================
   NOTIFICATIONS
========================================================= */

export const createNotification = async data => {
  try {
    const ref = await addDoc(
      collection(db, 'notifications'),
      {
        ...data,
        read: false,
        createdAt: serverTimestamp(),
      }
    );

    return {
      success: true,
      notificationId: ref.id,
    };
  } catch (error) {
    console.log(
      'CREATE NOTIFICATION ERROR:',
      error
    );

    return {
      success: false,
      message: error.message,
    };
  }
};

export const markNotificationRead =
  async notificationId => {
    try {
      await updateDoc(
        doc(
          db,
          'notifications',
          notificationId
        ),
        {
          read: true,
        }
      );

      return {
        success: true,
      };
    } catch (error) {
      console.log(
        'MARK NOTIFICATION ERROR:',
        error
      );

      return {
        success: false,
        message: error.message,
      };
    }
  };

/* =========================================================
   FOLLOWERS
========================================================= */

export const followUser = async (
  currentUserId,
  targetUserId
) => {
  try {
    await updateDoc(
      doc(db, 'users', currentUserId),
      {
        following: arrayUnion(targetUserId),
      }
    );

    await updateDoc(
      doc(db, 'users', targetUserId),
      {
        followers: arrayUnion(currentUserId),
        followersCount: increment(1),
      }
    );

    return {
      success: true,
    };
  } catch (error) {
    console.log('FOLLOW USER ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const unfollowUser = async (
  currentUserId,
  targetUserId
) => {
  try {
    await updateDoc(
      doc(db, 'users', currentUserId),
      {
        following: arrayRemove(targetUserId),
      }
    );

    await updateDoc(
      doc(db, 'users', targetUserId),
      {
        followers: arrayRemove(currentUserId),
        followersCount: increment(-1),
      }
    );

    return {
      success: true,
    };
  } catch (error) {
    console.log(
      'UNFOLLOW USER ERROR:',
      error
    );

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   SEARCH USERS
========================================================= */

export const searchUsers = async (
  searchText
) => {
  try {
    const q = query(
      collection(db, 'users'),
      limit(100)
    );

    const snapshot = await getDocs(q);

    const users = snapshot.docs.map(
      docItem => ({
        id: docItem.id,
        ...docItem.data(),
      })
    );

    return users.filter(user =>
      user.fullName
        ?.toLowerCase()
        .includes(searchText.toLowerCase())
    );
  } catch (error) {
    console.log(
      'SEARCH USERS ERROR:',
      error
    );

    return [];
  }
};

/* =========================================================
   EXPORT
========================================================= */

export default {
  createUserDocument,
  getUserDocument,
  updateUserDocument,

  createPost,
  getPosts,
  deletePost,

  createChat,
  sendMessage,
  getMessages,
  listenToMessages,

  createCall,
  getCalls,

  createNotification,
  markNotificationRead,

  followUser,
  unfollowUser,

  searchUsers,
};
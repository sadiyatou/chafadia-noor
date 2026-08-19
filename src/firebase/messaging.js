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
  arrayUnion,
  arrayRemove,
  increment,
  deleteField,
  writeBatch,
} from 'firebase/firestore';

import { db } from './firebaseConfig';

/* =========================================================
   CREATE OR GET PRIVATE CHAT
========================================================= */

export const createOrGetPrivateChat = async ({
  currentUserId,
  receiverId,
}) => {
  try {
    const chatsRef = collection(db, 'chats');

    const q = query(
      chatsRef,
      where('members', 'array-contains', currentUserId)
    );

    const snapshot = await getDocs(q);

    const existingChat = snapshot.docs.find(item => {
      const data = item.data();

      return (
        data.type === 'private' &&
        data.members?.includes(receiverId)
      );
    });

    if (existingChat) {
      return {
        success: true,
        chatId: existingChat.id,
        exists: true,
      };
    }

    const chatData = {
      type: 'private',
      members: [currentUserId, receiverId],
      admins: [],
      name: '',
      photoURL: '',
      lastMessage: '',
      lastMessageType: '',
      lastMessageTime: serverTimestamp(),
      unreadCounts: {
        [currentUserId]: 0,
        [receiverId]: 0,
      },
      mutedBy: [],
      archivedBy: [],
      pinnedBy: [],
      blockedBy: [],
      typing: {},
      createdBy: currentUserId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const chatRef = await addDoc(chatsRef, chatData);

    return {
      success: true,
      chatId: chatRef.id,
      exists: false,
    };
  } catch (error) {
    console.log('CREATE PRIVATE CHAT ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   CREATE GROUP CHAT
========================================================= */

export const createGroupChat = async ({
  currentUserId,
  name,
  members = [],
  photoURL = '',
}) => {
  try {
    const finalMembers = Array.from(
      new Set([currentUserId, ...members])
    );

    const unreadCounts = {};

    finalMembers.forEach(id => {
      unreadCounts[id] = 0;
    });

    const chatData = {
      type: 'group',
      name,
      photoURL,
      members: finalMembers,
      admins: [currentUserId],
      lastMessage: 'Group created',
      lastMessageType: 'system',
      lastMessageTime: serverTimestamp(),
      unreadCounts,
      mutedBy: [],
      archivedBy: [],
      pinnedBy: [],
      blockedBy: [],
      typing: {},
      createdBy: currentUserId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const chatRef = await addDoc(collection(db, 'chats'), chatData);

    await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
      chatId: chatRef.id,
      senderId: currentUserId,
      type: 'system',
      text: `${name} group was created`,
      mediaUrl: '',
      fileName: '',
      readBy: [currentUserId],
      deliveredTo: [currentUserId],
      deletedFor: [],
      reactions: {},
      pinned: false,
      edited: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      chatId: chatRef.id,
      data: chatData,
    };
  } catch (error) {
    console.log('CREATE GROUP CHAT ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   SEND MESSAGE
========================================================= */

export const sendMessage = async ({
  chatId,
  senderId,
  senderName = '',
  senderPhoto = '',
  type = 'text',
  text = '',
  mediaUrl = '',
  fileName = '',
  replyTo = null,
  members = [],
}) => {
  try {
    const messageData = {
      chatId,
      senderId,
      senderName,
      senderPhoto,
      type,
      text,
      mediaUrl,
      fileName,
      replyTo,
      readBy: [senderId],
      deliveredTo: [senderId],
      deletedFor: [],
      reactions: {},
      pinned: false,
      edited: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const messageRef = await addDoc(
      collection(db, 'chats', chatId, 'messages'),
      messageData
    );

    const preview =
      type === 'text'
        ? text
        : type === 'image'
        ? '📷 Image'
        : type === 'video'
        ? '🎥 Video'
        : type === 'audio'
        ? '🎤 Voice note'
        : type === 'file'
        ? '📎 File'
        : 'Message';

    const unreadUpdates = {};

    members.forEach(id => {
      if (id !== senderId) {
        unreadUpdates[`unreadCounts.${id}`] = increment(1);
      }
    });

    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: preview,
      lastMessageType: type,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...unreadUpdates,
    });

    return {
      success: true,
      messageId: messageRef.id,
      data: messageData,
    };
  } catch (error) {
    console.log('SEND MESSAGE ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   LISTEN TO USER CHATS
========================================================= */

export const listenToUserChats = (userId, callback) => {
  const q = query(
    collection(db, 'chats'),
    where('members', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  return onSnapshot(q, snapshot => {
    const chats = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    }));

    callback(chats);
  });
};

/* =========================================================
   LISTEN TO MESSAGES
========================================================= */

export const listenToMessages = (chatId, callback) => {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    }));

    callback(messages);
  });
};

/* =========================================================
   GET CHAT
========================================================= */

export const getChatById = async chatId => {
  try {
    const snapshot = await getDoc(doc(db, 'chats', chatId));

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.log('GET CHAT ERROR:', error);
    return null;
  }
};

/* =========================================================
   MARK MESSAGES AS READ
========================================================= */

export const markChatAsRead = async ({ chatId, userId }) => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const snapshot = await getDocs(query(messagesRef, orderBy('createdAt', 'desc'), limit(200)));

    const batch = writeBatch(db);
    for (const item of snapshot.docs) {
      const data = item.data();
      if (!data.readBy?.includes(userId)) {
        batch.update(item.ref, { readBy: arrayUnion(userId) });
      }
    }
    batch.update(doc(db, 'chats', chatId), {
      [`unreadCounts.${userId}`]: 0,
    });
    await batch.commit();

    return {
      success: true,
    };
  } catch (error) {
    console.log('MARK READ ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   EDIT MESSAGE
========================================================= */

export const editMessage = async ({
  chatId,
  messageId,
  text,
}) => {
  try {
    await updateDoc(
      doc(db, 'chats', chatId, 'messages', messageId),
      {
        text,
        edited: true,
        updatedAt: serverTimestamp(),
      }
    );

    return {
      success: true,
    };
  } catch (error) {
    console.log('EDIT MESSAGE ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   DELETE MESSAGE
========================================================= */

export const deleteMessage = async ({ chatId, messageId }) => {
  try {
    await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));

    return {
      success: true,
    };
  } catch (error) {
    console.log('DELETE MESSAGE ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   DELETE MESSAGE FOR ME
========================================================= */

export const deleteMessageForMe = async ({
  chatId,
  messageId,
  userId,
}) => {
  try {
    await updateDoc(
      doc(db, 'chats', chatId, 'messages', messageId),
      {
        deletedFor: arrayUnion(userId),
      }
    );

    return {
      success: true,
    };
  } catch (error) {
    console.log('DELETE MESSAGE FOR ME ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   REACT TO MESSAGE
========================================================= */

export const reactToMessage = async ({
  chatId,
  messageId,
  userId,
  emoji,
}) => {
  try {
    await updateDoc(
      doc(db, 'chats', chatId, 'messages', messageId),
      {
        [`reactions.${userId}`]: emoji,
        updatedAt: serverTimestamp(),
      }
    );

    return {
      success: true,
    };
  } catch (error) {
    console.log('REACT MESSAGE ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   REMOVE REACTION
========================================================= */

export const removeReaction = async ({
  chatId,
  messageId,
  userId,
}) => {
  try {
    await updateDoc(
      doc(db, 'chats', chatId, 'messages', messageId),
      {
        [`reactions.${userId}`]: deleteField(),
        updatedAt: serverTimestamp(),
      }
    );

    return {
      success: true,
    };
  } catch (error) {
    console.log('REMOVE REACTION ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   PIN MESSAGE
========================================================= */

export const togglePinMessage = async ({
  chatId,
  messageId,
  pinned,
}) => {
  try {
    await updateDoc(
      doc(db, 'chats', chatId, 'messages', messageId),
      {
        pinned,
        updatedAt: serverTimestamp(),
      }
    );

    return {
      success: true,
    };
  } catch (error) {
    console.log('PIN MESSAGE ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   TYPING STATUS
========================================================= */

export const setTypingStatus = async ({
  chatId,
  userId,
  typing,
}) => {
  try {
    await updateDoc(doc(db, 'chats', chatId), {
      [`typing.${userId}`]: typing,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('TYPING STATUS ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const listenToTypingStatus = (chatId, callback) => {
  return onSnapshot(doc(db, 'chats', chatId), snapshot => {
    if (!snapshot.exists()) {
      callback({});
      return;
    }

    callback(snapshot.data()?.typing || {});
  });
};

/* =========================================================
   CHAT SETTINGS
========================================================= */

const toggleChatArrayField = async ({ chatId, field, userId }) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snapshot = await getDoc(chatRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        message: 'Chat not found.',
      };
    }

    const data = snapshot.data();
    const list = data[field] || [];

    await updateDoc(chatRef, {
      [field]: list.includes(userId)
        ? arrayRemove(userId)
        : arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('CHAT SETTING ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const toggleMuteChat = (chatId, userId) =>
  toggleChatArrayField({ chatId, field: 'mutedBy', userId });

export const toggleArchiveChat = (chatId, userId) =>
  toggleChatArrayField({ chatId, field: 'archivedBy', userId });

export const togglePinChat = (chatId, userId) =>
  toggleChatArrayField({ chatId, field: 'pinnedBy', userId });

export const toggleBlockChat = (chatId, userId) =>
  toggleChatArrayField({ chatId, field: 'blockedBy', userId });

/* =========================================================
   GROUP MANAGEMENT
========================================================= */

export const addGroupMember = async ({ chatId, userId }) => {
  try {
    await updateDoc(doc(db, 'chats', chatId), {
      members: arrayUnion(userId),
      [`unreadCounts.${userId}`]: 0,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('ADD GROUP MEMBER ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const removeGroupMember = async ({ chatId, userId }) => {
  try {
    await updateDoc(doc(db, 'chats', chatId), {
      members: arrayRemove(userId),
      admins: arrayRemove(userId),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('REMOVE GROUP MEMBER ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const makeGroupAdmin = async ({ chatId, userId }) => {
  try {
    await updateDoc(doc(db, 'chats', chatId), {
      admins: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('MAKE ADMIN ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const removeGroupAdmin = async ({ chatId, userId }) => {
  try {
    await updateDoc(doc(db, 'chats', chatId), {
      admins: arrayRemove(userId),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('REMOVE ADMIN ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   CLEAR / DELETE CHAT
========================================================= */

export const clearChat = async chatId => {
  try {
    const q = query(collection(db, 'chats', chatId, 'messages'));
    const snapshot = await getDocs(q);

    for (const item of snapshot.docs) {
      await deleteDoc(item.ref);
    }

    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: '',
      lastMessageType: '',
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('CLEAR CHAT ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const deleteChat = async chatId => {
  try {
    await clearChat(chatId);
    await deleteDoc(doc(db, 'chats', chatId));

    return {
      success: true,
    };
  } catch (error) {
    console.log('DELETE CHAT ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   EXPORT DEFAULT
========================================================= */

export default {
  createOrGetPrivateChat,
  createGroupChat,

  sendMessage,
  listenToUserChats,
  listenToMessages,
  getChatById,

  markChatAsRead,

  editMessage,
  deleteMessage,
  deleteMessageForMe,

  reactToMessage,
  removeReaction,
  togglePinMessage,

  setTypingStatus,
  listenToTypingStatus,

  toggleMuteChat,
  toggleArchiveChat,
  togglePinChat,
  toggleBlockChat,

  addGroupMember,
  removeGroupMember,
  makeGroupAdmin,
  removeGroupAdmin,

  clearChat,
  deleteChat,
};
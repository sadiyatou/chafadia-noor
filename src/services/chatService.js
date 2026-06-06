// src/services/chatService.js

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

/* =========================================================
   CREATE PRIVATE CHAT
========================================================= */

export const createPrivateChat = async ({
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
        data.members.includes(receiverId)
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
      createdBy: currentUserId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const chatRef = await addDoc(collection(db, 'chats'), chatData);

    return {
      success: true,
      chatId: chatRef.id,
      exists: false,
    };
  } catch (error) {
    console.log('CREATE PRIVATE CHAT ERROR:', error);

    return {
      success: false,
      error: error.message,
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

    const chatData = {
      type: 'group',
      name,
      photoURL,
      members: finalMembers,
      admins: [currentUserId],
      lastMessage: '',
      lastMessageType: '',
      lastMessageTime: serverTimestamp(),
      unreadCounts: finalMembers.reduce((acc, id) => {
        acc[id] = 0;
        return acc;
      }, {}),
      mutedBy: [],
      archivedBy: [],
      pinnedBy: [],
      blockedBy: [],
      createdBy: currentUserId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const chatRef = await addDoc(collection(db, 'chats'), chatData);

    return {
      success: true,
      chatId: chatRef.id,
      data: chatData,
    };
  } catch (error) {
    console.log('CREATE GROUP CHAT ERROR:', error);

    return {
      success: false,
      error: error.message,
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
   GET CHAT BY ID
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
   LISTEN TO MESSAGES
========================================================= */

export const listenToMessages = (chatId, callback) => {
  const q = query(
    collection(db, 'messages'),
    where('chatId', '==', chatId),
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
      edited: false,
      deletedFor: [],
      pinned: false,
      reactions: [],
      readBy: [senderId],
      deliveredTo: [senderId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const messageRef = await addDoc(
      collection(db, 'messages'),
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
        : '📎 File';

    const unreadCounts = {};

    members.forEach(id => {
      unreadCounts[`unreadCounts.${id}`] =
        id === senderId ? 0 : 1;
    });

    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: preview,
      lastMessageType: type,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...unreadCounts,
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
      error: error.message,
    };
  }
};

/* =========================================================
   EDIT MESSAGE
========================================================= */

export const editMessage = async (messageId, newText) => {
  try {
    await updateDoc(doc(db, 'messages', messageId), {
      text: newText,
      edited: true,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.log('EDIT MESSAGE ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   DELETE MESSAGE
========================================================= */

export const deleteMessage = async messageId => {
  try {
    await deleteDoc(doc(db, 'messages', messageId));

    return { success: true };
  } catch (error) {
    console.log('DELETE MESSAGE ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   DELETE MESSAGE FOR ME
========================================================= */

export const deleteMessageForMe = async (messageId, userId) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    const snapshot = await getDoc(messageRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        error: 'Message not found',
      };
    }

    const data = snapshot.data();

    const deletedFor = data.deletedFor || [];

    if (!deletedFor.includes(userId)) {
      deletedFor.push(userId);
    }

    await updateDoc(messageRef, {
      deletedFor,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.log('DELETE FOR ME ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   PIN MESSAGE
========================================================= */

export const pinMessage = async messageId => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    const snapshot = await getDoc(messageRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        error: 'Message not found',
      };
    }

    const data = snapshot.data();

    await updateDoc(messageRef, {
      pinned: !data.pinned,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.log('PIN MESSAGE ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   REACT TO MESSAGE
========================================================= */

export const reactToMessage = async ({
  messageId,
  userId,
  emoji,
}) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    const snapshot = await getDoc(messageRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        error: 'Message not found',
      };
    }

    const data = snapshot.data();
    const reactions = data.reactions || [];

    const existing = reactions.find(item => item.userId === userId);

    let updatedReactions = [];

    if (existing) {
      updatedReactions = reactions.map(item =>
        item.userId === userId
          ? {
              ...item,
              emoji,
            }
          : item
      );
    } else {
      updatedReactions = [
        ...reactions,
        {
          userId,
          emoji,
        },
      ];
    }

    await updateDoc(messageRef, {
      reactions: updatedReactions,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      reactions: updatedReactions,
    };
  } catch (error) {
    console.log('REACTION ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   MARK MESSAGE AS READ
========================================================= */

export const markMessagesAsRead = async ({
  chatId,
  userId,
}) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId)
    );

    const snapshot = await getDocs(q);

    for (const item of snapshot.docs) {
      const data = item.data();
      const readBy = data.readBy || [];

      if (!readBy.includes(userId)) {
        await updateDoc(item.ref, {
          readBy: [...readBy, userId],
        });
      }
    }

    await updateDoc(doc(db, 'chats', chatId), {
      [`unreadCounts.${userId}`]: 0,
    });

    return { success: true };
  } catch (error) {
    console.log('MARK READ ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   CLEAR CHAT
========================================================= */

export const clearChat = async chatId => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId)
    );

    const snapshot = await getDocs(q);

    for (const item of snapshot.docs) {
      await deleteDoc(item.ref);
    }

    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: '',
      lastMessageType: '',
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.log('CLEAR CHAT ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   ARCHIVE CHAT
========================================================= */

export const archiveChat = async (chatId, userId) => {
  return updateChatArrayField(chatId, 'archivedBy', userId);
};

/* =========================================================
   MUTE CHAT
========================================================= */

export const muteChat = async (chatId, userId) => {
  return updateChatArrayField(chatId, 'mutedBy', userId);
};

/* =========================================================
   PIN CHAT
========================================================= */

export const pinChat = async (chatId, userId) => {
  return updateChatArrayField(chatId, 'pinnedBy', userId);
};

/* =========================================================
   BLOCK CHAT
========================================================= */

export const blockChat = async (chatId, userId) => {
  return updateChatArrayField(chatId, 'blockedBy', userId);
};

/* =========================================================
   UPDATE CHAT ARRAY FIELD
========================================================= */

const updateChatArrayField = async (chatId, field, userId) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snapshot = await getDoc(chatRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        error: 'Chat not found',
      };
    }

    const data = snapshot.data();
    const currentArray = data[field] || [];

    const updatedArray = currentArray.includes(userId)
      ? currentArray.filter(id => id !== userId)
      : [...currentArray, userId];

    await updateDoc(chatRef, {
      [field]: updatedArray,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      [field]: updatedArray,
    };
  } catch (error) {
    console.log('UPDATE CHAT FIELD ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   ADD GROUP MEMBER
========================================================= */

export const addGroupMember = async (chatId, userId) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snapshot = await getDoc(chatRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        error: 'Chat not found',
      };
    }

    const data = snapshot.data();

    const members = data.members || [];

    if (members.includes(userId)) {
      return {
        success: true,
        members,
      };
    }

    const updatedMembers = [...members, userId];

    await updateDoc(chatRef, {
      members: updatedMembers,
      [`unreadCounts.${userId}`]: 0,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      members: updatedMembers,
    };
  } catch (error) {
    console.log('ADD GROUP MEMBER ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   REMOVE GROUP MEMBER
========================================================= */

export const removeGroupMember = async (chatId, userId) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snapshot = await getDoc(chatRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        error: 'Chat not found',
      };
    }

    const data = snapshot.data();

    const updatedMembers = (data.members || []).filter(
      id => id !== userId
    );

    await updateDoc(chatRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      members: updatedMembers,
    };
  } catch (error) {
    console.log('REMOVE GROUP MEMBER ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   MAKE GROUP ADMIN
========================================================= */

export const makeGroupAdmin = async (chatId, userId) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snapshot = await getDoc(chatRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        error: 'Chat not found',
      };
    }

    const data = snapshot.data();
    const admins = data.admins || [];

    if (admins.includes(userId)) {
      return {
        success: true,
        admins,
      };
    }

    const updatedAdmins = [...admins, userId];

    await updateDoc(chatRef, {
      admins: updatedAdmins,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      admins: updatedAdmins,
    };
  } catch (error) {
    console.log('MAKE ADMIN ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   REMOVE GROUP ADMIN
========================================================= */

export const removeGroupAdmin = async (chatId, userId) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snapshot = await getDoc(chatRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        error: 'Chat not found',
      };
    }

    const data = snapshot.data();

    const updatedAdmins = (data.admins || []).filter(
      id => id !== userId
    );

    await updateDoc(chatRef, {
      admins: updatedAdmins,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      admins: updatedAdmins,
    };
  } catch (error) {
    console.log('REMOVE ADMIN ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   DELETE CHAT
========================================================= */

export const deleteChat = async chatId => {
  try {
    await clearChat(chatId);

    await deleteDoc(doc(db, 'chats', chatId));

    return { success: true };
  } catch (error) {
    console.log('DELETE CHAT ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  createPrivateChat,
  createGroupChat,
  listenToUserChats,
  getChatById,
  listenToMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  deleteMessageForMe,
  pinMessage,
  reactToMessage,
  markMessagesAsRead,
  clearChat,
  archiveChat,
  muteChat,
  pinChat,
  blockChat,
  addGroupMember,
  removeGroupMember,
  makeGroupAdmin,
  removeGroupAdmin,
  deleteChat,
};
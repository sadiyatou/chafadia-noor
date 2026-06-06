// src/hooks/useMessages.js

import { useCallback, useEffect, useState } from 'react';

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

import { db } from '../firebase/firebaseConfig';

import useAuth from './UseAuth';

export default function useMessages(chatId) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [typingUsers, setTypingUsers] =
    useState([]);

  const [replyMessage, setReplyMessage] =
    useState(null);

  const [selectedMessages, setSelectedMessages] =
    useState([]);

  const [editingMessage, setEditingMessage] =
    useState(null);

  // LOAD MESSAGES REALTIME
  useEffect(() => {
    if (!chatId) return;

    setLoading(true);

    const messagesRef = collection(
      db,
      'messages'
    );

    const q = query(
      messagesRef,

      where('chatId', '==', chatId),

      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const loadedMessages =
          snapshot.docs.map(docItem => ({
            id: docItem.id,

            ...docItem.data(),
          }));

        setMessages(loadedMessages);

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  // SEND TEXT MESSAGE
  const sendMessage = useCallback(
    async text => {
      if (!text?.trim()) return;

      try {
        setSending(true);

        await addDoc(
          collection(db, 'messages'),

          {
            chatId,

            senderId: user?.uid,

            senderName:
              user?.displayName || '',

            senderPhoto:
              user?.photoURL || '',

            text,

            type: 'text',

            replyTo: replyMessage || null,

            edited: false,

            pinned: false,

            reactions: [],

            createdAt:
              serverTimestamp(),
          }
        );

        setReplyMessage(null);
      } catch (error) {
        console.log(
          'SEND MESSAGE ERROR:',
          error
        );
      } finally {
        setSending(false);
      }
    },
    [chatId, user, replyMessage]
  );

  // SEND IMAGE
  const sendImage = async imageUrl => {
    try {
      await addDoc(
        collection(db, 'messages'),

        {
          chatId,

          senderId: user?.uid,

          type: 'image',

          mediaUrl: imageUrl,

          reactions: [],

          createdAt:
            serverTimestamp(),
        }
      );
    } catch (error) {
      console.log(
        'SEND IMAGE ERROR:',
        error
      );
    }
  };

  // SEND VIDEO
  const sendVideo = async videoUrl => {
    try {
      await addDoc(
        collection(db, 'messages'),

        {
          chatId,

          senderId: user?.uid,

          type: 'video',

          mediaUrl: videoUrl,

          reactions: [],

          createdAt:
            serverTimestamp(),
        }
      );
    } catch (error) {
      console.log(
        'SEND VIDEO ERROR:',
        error
      );
    }
  };

  // SEND VOICE NOTE
  const sendVoiceNote = async audioUrl => {
    try {
      await addDoc(
        collection(db, 'messages'),

        {
          chatId,

          senderId: user?.uid,

          type: 'audio',

          mediaUrl: audioUrl,

          reactions: [],

          createdAt:
            serverTimestamp(),
        }
      );
    } catch (error) {
      console.log(
        'VOICE NOTE ERROR:',
        error
      );
    }
  };

  // SEND FILE
  const sendFile = async (
    fileUrl,
    fileName
  ) => {
    try {
      await addDoc(
        collection(db, 'messages'),

        {
          chatId,

          senderId: user?.uid,

          type: 'file',

          mediaUrl: fileUrl,

          fileName,

          reactions: [],

          createdAt:
            serverTimestamp(),
        }
      );
    } catch (error) {
      console.log(
        'SEND FILE ERROR:',
        error
      );
    }
  };

  // EDIT MESSAGE
  const editMessage = async (
    messageId,
    newText
  ) => {
    try {
      const messageRef = doc(
        db,
        'messages',
        messageId
      );

      await updateDoc(messageRef, {
        text: newText,

        edited: true,
      });

      setEditingMessage(null);
    } catch (error) {
      console.log(
        'EDIT MESSAGE ERROR:',
        error
      );
    }
  };

  // DELETE MESSAGE
  const deleteMessage = async messageId => {
    try {
      await deleteDoc(
        doc(db, 'messages', messageId)
      );
    } catch (error) {
      console.log(
        'DELETE MESSAGE ERROR:',
        error
      );
    }
  };

  // DELETE MULTIPLE
  const deleteSelectedMessages =
    async () => {
      try {
        for (const id of selectedMessages) {
          await deleteDoc(
            doc(db, 'messages', id)
          );
        }

        setSelectedMessages([]);
      } catch (error) {
        console.log(
          'DELETE MULTIPLE ERROR:',
          error
        );
      }
    };

  // PIN MESSAGE
  const pinMessage = async messageId => {
    try {
      await updateDoc(
        doc(db, 'messages', messageId),

        {
          pinned: true,
        }
      );
    } catch (error) {
      console.log(
        'PIN MESSAGE ERROR:',
        error
      );
    }
  };

  // UNPIN MESSAGE
  const unpinMessage = async messageId => {
    try {
      await updateDoc(
        doc(db, 'messages', messageId),

        {
          pinned: false,
        }
      );
    } catch (error) {
      console.log(
        'UNPIN MESSAGE ERROR:',
        error
      );
    }
  };

  // REACT TO MESSAGE
  const reactToMessage = async (
    messageId,
    emoji
  ) => {
    try {
      const message = messages.find(
        item => item.id === messageId
      );

      if (!message) return;

      const reactions =
        message.reactions || [];

      const alreadyReacted =
        reactions.find(
          item =>
            item.userId === user?.uid
        );

      let updatedReactions = [];

      if (alreadyReacted) {
        updatedReactions = reactions.map(
          item =>
            item.userId === user?.uid
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
            userId: user?.uid,

            emoji,
          },
        ];
      }

      await updateDoc(
        doc(db, 'messages', messageId),

        {
          reactions: updatedReactions,
        }
      );
    } catch (error) {
      console.log(
        'REACTION ERROR:',
        error
      );
    }
  };

  // START REPLY
  const startReply = message => {
    setReplyMessage(message);
  };

  // CANCEL REPLY
  const cancelReply = () => {
    setReplyMessage(null);
  };

  // SELECT MESSAGE
  const toggleSelectMessage =
    messageId => {
      setSelectedMessages(prev => {
        if (prev.includes(messageId)) {
          return prev.filter(
            item => item !== messageId
          );
        }

        return [...prev, messageId];
      });
    };

  // CLEAR CHAT
  const clearChat = async () => {
    try {
      const messagesRef = collection(
        db,
        'messages'
      );

      const q = query(
        messagesRef,

        where('chatId', '==', chatId)
      );

      const snapshot = await getDocs(q);

      for (const document of snapshot.docs) {
        await deleteDoc(document.ref);
      }
    } catch (error) {
      console.log(
        'CLEAR CHAT ERROR:',
        error
      );
    }
  };

  // START TYPING
  const startTyping = async () => {
    try {
      const typingRef = doc(
        db,
        'typing',
        `${chatId}_${user?.uid}`
      );

      await updateDoc(typingRef, {
        userId: user?.uid,

        name:
          user?.displayName || '',

        typing: true,
      });
    } catch (error) {
      console.log(
        'START TYPING ERROR:',
        error
      );
    }
  };

  // STOP TYPING
  const stopTyping = async () => {
    try {
      const typingRef = doc(
        db,
        'typing',
        `${chatId}_${user?.uid}`
      );

      await updateDoc(typingRef, {
        typing: false,
      });
    } catch (error) {
      console.log(
        'STOP TYPING ERROR:',
        error
      );
    }
  };

  return {
    messages,

    loading,

    sending,

    typingUsers,

    replyMessage,

    selectedMessages,

    editingMessage,

    sendMessage,

    sendImage,

    sendVideo,

    sendVoiceNote,

    sendFile,

    editMessage,

    deleteMessage,

    deleteSelectedMessages,

    pinMessage,

    unpinMessage,

    reactToMessage,

    startReply,

    cancelReply,

    toggleSelectMessage,

    clearChat,

    startTyping,

    stopTyping,

    setEditingMessage,
  };
}
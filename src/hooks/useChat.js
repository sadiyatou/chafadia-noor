// src/hooks/useChat.js

import { useEffect, useState, useCallback } from 'react';

import chatApi from '../api/chatApi';

export default function useChat() {
  const [chats, setChats] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [calls, setCalls] = useState([]);
  const [channels, setChannels] = useState([]);

  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);

  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const loadChatData = useCallback(async () => {
    setLoading(true);

    try {
      const loadedChats = await chatApi.getChats();
      const loadedStatuses = await chatApi.getStatuses();
      const loadedCalls = await chatApi.getCalls();
      const loadedChannels = await chatApi.getChannels();

      setChats(loadedChats);
      setStatuses(loadedStatuses);
      setCalls(loadedCalls);
      setChannels(loadedChannels);
    } catch (error) {
      console.log('LOAD CHAT DATA ERROR:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChatData();
  }, [loadChatData]);

  const syncSelectedChat = updatedChats => {
    if (!selectedChat?.id) return;

    const freshChat = updatedChats.find(
      chat => chat.id === selectedChat.id
    );

    if (freshChat) {
      setSelectedChat(freshChat);
    }
  };

  const openChat = async chat => {
    const response = await chatApi.markChatAsRead(chat.id);

    if (response.success) {
      setChats(response.chats);
      setSelectedChat(response.chat || chat);
    } else {
      setSelectedChat(chat);
    }

    setSelectionMode(false);
    setSelectedMessageIds([]);
    setEditingMessage(null);
    setMessageText('');
  };

  const createChat = async ({ name, phone, avatar = '' }) => {
    const response = await chatApi.createChat({
      name,
      phone,
      avatar,
    });

    if (response.success) {
      await loadChatData();
    }

    return response;
  };

  const createGroup = async ({
    name,
    members = [],
    profileName = 'Me',
  }) => {
    const response = await chatApi.createGroup({
      name,
      members,
      profileName,
    });

    if (response.success) {
      await loadChatData();
    }

    return response;
  };

  const sendTextMessage = async () => {
    if (!selectedChat || !messageText.trim()) return;

    let response;

    if (editingMessage) {
      response = await chatApi.editMessage({
        chatId: selectedChat.id,
        messageId: editingMessage.id,
        text: messageText,
      });

      setEditingMessage(null);
    } else {
      response = await chatApi.sendTextMessage({
        chatId: selectedChat.id,
        text: messageText,
      });
    }

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
      setMessageText('');
    }

    return response;
  };

  const sendMediaMessage = async media => {
    if (!selectedChat || !media) return;

    const response = await chatApi.sendMediaMessage({
      chatId: selectedChat.id,
      media,
    });

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
    }

    return response;
  };

  const editMessage = message => {
    if (!message || message.sender !== 'me' || message.type !== 'text') {
      return {
        success: false,
        message: 'You can only edit your own text messages.',
      };
    }

    setEditingMessage(message);
    setMessageText(message.text || '');

    return {
      success: true,
    };
  };

  const deleteMessage = async messageId => {
    if (!selectedChat) return;

    const response = await chatApi.deleteMessage({
      chatId: selectedChat.id,
      messageId,
    });

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
    }

    return response;
  };

  const deleteSelectedMessages = async () => {
    if (!selectedChat || selectedMessageIds.length === 0) return;

    const response = await chatApi.deleteSelectedMessages({
      chatId: selectedChat.id,
      messageIds: selectedMessageIds,
    });

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
      setSelectedMessageIds([]);
      setSelectionMode(false);
    }

    return response;
  };

  const toggleSelectMessage = messageId => {
    setSelectedMessageIds(prev => {
      const exists = prev.includes(messageId);

      const next = exists
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId];

      setSelectionMode(next.length > 0);

      return next;
    });
  };

  const clearChatMessages = async () => {
    if (!selectedChat) return;

    const response = await chatApi.clearChatMessages(selectedChat.id);

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
    }

    return response;
  };

  const togglePinChat = async chatId => {
    const response = await chatApi.togglePinChat(chatId);

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
    }

    return response;
  };

  const toggleArchiveChat = async chatId => {
    const response = await chatApi.toggleArchiveChat(chatId);

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
    }

    return response;
  };

  const toggleMuteChat = async chatId => {
    const response = await chatApi.toggleMuteChat(chatId);

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
    }

    return response;
  };

  const toggleBlockChat = async chatId => {
    const response = await chatApi.toggleBlockChat(chatId);

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
    }

    return response;
  };

  const toggleDisappearingMessages = async chatId => {
    const response = await chatApi.toggleDisappearingMessages(chatId);

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
    }

    return response;
  };

  const togglePinMessage = async messageId => {
    if (!selectedChat) return;

    const response = await chatApi.togglePinMessage({
      chatId: selectedChat.id,
      messageId,
    });

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
    }

    return response;
  };

  const toggleLikeMessage = async messageId => {
    if (!selectedChat) return;

    const response = await chatApi.toggleLikeMessage({
      chatId: selectedChat.id,
      messageId,
    });

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
    }

    return response;
  };

  const deleteChat = async chatId => {
    const response = await chatApi.deleteChat(chatId);

    if (response.success) {
      setChats(response.chats);

      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
      }
    }

    return response;
  };

  const addMembersToGroup = async members => {
    if (!selectedChat) return;

    const response = await chatApi.addMembersToGroup({
      chatId: selectedChat.id,
      members,
    });

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
    }

    return response;
  };

  const removeMemberFromGroup = async memberName => {
    if (!selectedChat) return;

    const response = await chatApi.removeMemberFromGroup({
      chatId: selectedChat.id,
      memberName,
    });

    if (response.success) {
      setChats(response.chats);
      syncSelectedChat(response.chats);
    }

    return response;
  };

  const createStatus = async ({ text = '', media }) => {
    const response = await chatApi.createStatus({
      text,
      media,
    });

    if (response.success) {
      const loadedStatuses = await chatApi.getStatuses();
      setStatuses(loadedStatuses);
    }

    return response;
  };

  const viewStatus = async statusId => {
    const response = await chatApi.viewStatus(statusId);

    if (response.success) {
      setStatuses(response.statuses);
    }

    return response;
  };

  const likeStatus = async statusId => {
    const response = await chatApi.likeStatus(statusId);

    if (response.success) {
      setStatuses(response.statuses);
    }

    return response;
  };

  const commentOnStatus = async ({ statusId, author, text }) => {
    const response = await chatApi.commentOnStatus({
      statusId,
      author,
      text,
    });

    if (response.success) {
      const loadedStatuses = await chatApi.getStatuses();
      setStatuses(loadedStatuses);
    }

    return response;
  };

  const createCall = async ({
    name,
    type = 'voice',
    direction = 'outgoing',
    participants = [],
  }) => {
    const response = await chatApi.createCall({
      name,
      type,
      direction,
      participants,
    });

    if (response.success) {
      const loadedCalls = await chatApi.getCalls();
      setCalls(loadedCalls);
    }

    return response;
  };

  const scheduleCall = async ({
    name,
    type = 'voice',
    scheduledFor,
    participants = [],
  }) => {
    const response = await chatApi.scheduleCall({
      name,
      type,
      scheduledFor,
      participants,
    });

    if (response.success) {
      const loadedCalls = await chatApi.getCalls();
      setCalls(loadedCalls);
    }

    return response;
  };

  const createChannel = async ({ name, description = '' }) => {
    const response = await chatApi.createChannel({
      name,
      description,
    });

    if (response.success) {
      const loadedChannels = await chatApi.getChannels();
      setChannels(loadedChannels);
    }

    return response;
  };

  const toggleFollowChannel = async channelId => {
    const response = await chatApi.toggleFollowChannel(channelId);

    if (response.success) {
      setChannels(response.channels);
    }

    return response;
  };

  const createChannelPost = async ({
    channelId,
    text,
    media,
  }) => {
    const response = await chatApi.createChannelPost({
      channelId,
      text,
      media,
    });

    if (response.success) {
      setChannels(response.channels);
      setSelectedChannel(response.channel);
    }

    return response;
  };

  const likeChannelPost = async ({ channelId, postId }) => {
    const response = await chatApi.likeChannelPost({
      channelId,
      postId,
    });

    if (response.success) {
      setChannels(response.channels);
      setSelectedChannel(response.channel);
    }

    return response;
  };

  const commentOnChannelPost = async ({
    channelId,
    postId,
    author,
    text,
  }) => {
    const response = await chatApi.commentOnChannelPost({
      channelId,
      postId,
      author,
      text,
    });

    if (response.success) {
      const loadedChannels = await chatApi.getChannels();
      setChannels(loadedChannels);

      const freshChannel = loadedChannels.find(
        channel => channel.id === channelId
      );

      if (freshChannel) {
        setSelectedChannel(freshChannel);
      }
    }

    return response;
  };

  const updateChannelSettings = async ({ channelId, updates }) => {
    const response = await chatApi.updateChannelSettings({
      channelId,
      updates,
    });

    if (response.success) {
      setChannels(response.channels);
      setSelectedChannel(response.channel);
    }

    return response;
  };

  return {
    chats,
    statuses,
    calls,
    channels,

    selectedChat,
    selectedChannel,

    loading,
    messageText,
    editingMessage,
    selectedMessageIds,
    selectionMode,

    setChats,
    setStatuses,
    setCalls,
    setChannels,
    setSelectedChat,
    setSelectedChannel,
    setMessageText,
    setEditingMessage,
    setSelectedMessageIds,
    setSelectionMode,

    loadChatData,
    openChat,

    createChat,
    createGroup,
    deleteChat,

    sendTextMessage,
    sendMediaMessage,
    editMessage,
    deleteMessage,
    deleteSelectedMessages,
    updateMessage: chatApi.updateMessage,

    toggleSelectMessage,
    clearChatMessages,

    togglePinChat,
    toggleArchiveChat,
    toggleMuteChat,
    toggleBlockChat,
    toggleDisappearingMessages,

    togglePinMessage,
    toggleLikeMessage,

    addMembersToGroup,
    removeMemberFromGroup,

    createStatus,
    viewStatus,
    likeStatus,
    commentOnStatus,

    createCall,
    scheduleCall,

    createChannel,
    toggleFollowChannel,
    createChannelPost,
    likeChannelPost,
    commentOnChannelPost,
    updateChannelSettings,
  };
}
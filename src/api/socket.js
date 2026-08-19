import { io } from 'socket.io-client';
import { Platform } from 'react-native';
import { getToken } from './client';

// Same rule as src/api/client.js: EXPO_PUBLIC_SOCKET_URL (falls back to
// EXPO_PUBLIC_API_URL) must be a server address reachable from a real device.
const DEV_FALLBACK = Platform.select({
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

const BASE_URL = process.env.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_API_URL || DEV_FALLBACK;

let socket = null;

export const connectSocket = async () => {
  const token = await getToken();
  if (!token) return null;

  if (socket?.connected) return socket;

  socket = io(BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  socket.on('connect', () => console.log('Socket connected'));
  socket.on('disconnect', () => console.log('Socket disconnected'));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

// ── Chat events ──

export const joinChat = (chatId) => socket?.emit('chat:join', chatId);
export const leaveChat = (chatId) => socket?.emit('chat:leave', chatId);
export const emitTyping = (chatId, typing) => socket?.emit('chat:typing', { chatId, typing });
export const emitMarkRead = (chatId) => socket?.emit('chat:markRead', { chatId });

export const onNewMessage = (callback) => socket?.on('chat:message', callback);
export const offNewMessage = (callback) => socket?.off('chat:message', callback);

export const onMessageEdited = (callback) => socket?.on('chat:messageEdited', callback);
export const offMessageEdited = (callback) => socket?.off('chat:messageEdited', callback);

export const onMessageDeleted = (callback) => socket?.on('chat:messageDeleted', callback);
export const offMessageDeleted = (callback) => socket?.off('chat:messageDeleted', callback);

export const onTyping = (callback) => socket?.on('chat:typing', callback);
export const offTyping = (callback) => socket?.off('chat:typing', callback);

export const onChatRead = (callback) => socket?.on('chat:read', callback);
export const offChatRead = (callback) => socket?.off('chat:read', callback);

export const onReaction = (callback) => socket?.on('chat:reaction', callback);
export const offReaction = (callback) => socket?.off('chat:reaction', callback);

// ── Call events ──

export const onIncomingCall = (callback) => socket?.on('call:incoming', callback);
export const offIncomingCall = (callback) => socket?.off('call:incoming', callback);

// Server emits 'call:accepted' (see server/config/socket.js), not 'call:answered'.
export const onCallAnswered = (callback) => socket?.on('call:accepted', callback);
export const offCallAnswered = (callback) => socket?.off('call:accepted', callback);

export const onCallSdpOffer = (callback) => socket?.on('call:sdp-offer', callback);
export const offCallSdpOffer = (callback) => socket?.off('call:sdp-offer', callback);

export const onCallSdpAnswer = (callback) => socket?.on('call:sdp-answer', callback);
export const offCallSdpAnswer = (callback) => socket?.off('call:sdp-answer', callback);

export const onCallIceCandidate = (callback) => socket?.on('call:ice-candidate', callback);
export const offCallIceCandidate = (callback) => socket?.off('call:ice-candidate', callback);

export const emitCallInitiate = (data) => socket?.emit('call:initiate', data);
export const emitCallAccept = (data) => socket?.emit('call:accept', data);
export const emitCallReject = (data) => socket?.emit('call:reject', data);
export const emitCallEnd = (data) => socket?.emit('call:end', data);
export const emitSdpOffer = (data) => socket?.emit('call:sdp-offer', data);
export const emitSdpAnswer = (data) => socket?.emit('call:sdp-answer', data);
export const emitIceCandidate = (data) => socket?.emit('call:ice-candidate', data);

export const onCallRejected = (callback) => socket?.on('call:rejected', callback);
export const offCallRejected = (callback) => socket?.off('call:rejected', callback);

export const onCallEnded = (callback) => socket?.on('call:ended', callback);
export const offCallEnded = (callback) => socket?.off('call:ended', callback);

// ── Notification events ──

export const onNotification = (callback) => socket?.on('notification', callback);
export const offNotification = (callback) => socket?.off('notification', callback);

// ── User presence ──

export const onUserOnline = (callback) => socket?.on('user:online', callback);
export const offUserOnline = (callback) => socket?.off('user:online', callback);

export const onUserOffline = (callback) => socket?.on('user:offline', callback);
export const offUserOffline = (callback) => socket?.off('user:offline', callback);

// ── Stream events ──

export const joinStreamRoom = (streamId) => socket?.emit('stream:join', streamId);
export const leaveStreamRoom = (streamId) => socket?.emit('stream:leave', streamId);

export const onStreamStarted = (callback) => socket?.on('stream:started', callback);
export const offStreamStarted = (callback) => socket?.off('stream:started', callback);

export const onStreamEnded = (callback) => socket?.on('stream:ended', callback);
export const offStreamEnded = (callback) => socket?.off('stream:ended', callback);

export const onStreamComment = (callback) => socket?.on('stream:comment', callback);
export const offStreamComment = (callback) => socket?.off('stream:comment', callback);

export default {
  connectSocket, disconnectSocket, getSocket,
  joinChat, leaveChat, emitTyping, emitMarkRead,
  onNewMessage, offNewMessage, onMessageEdited, offMessageEdited,
  onMessageDeleted, offMessageDeleted, onTyping, offTyping,
  onChatRead, offChatRead, onReaction, offReaction,
  onIncomingCall, offIncomingCall, onCallAnswered, offCallAnswered,
  onCallRejected, offCallRejected, onCallEnded, offCallEnded,
  onNotification, offNotification,
  onUserOnline, offUserOnline, onUserOffline, offUserOffline,
  joinStreamRoom, leaveStreamRoom,
  onStreamStarted, offStreamStarted, onStreamEnded, offStreamEnded,
  onStreamComment, offStreamComment,
};

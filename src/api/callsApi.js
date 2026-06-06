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

/* =========================
   CALLS
========================= */

export const createCall = async ({
  callerId,
  callerName,
  callerPhoto = '',
  receiverId,
  receiverName,
  type = 'voice',
}) => {
  try {
    const data = {
      callerId,
      callerName,
      callerPhoto,
      receiverId,
      receiverName,
      type,
      status: 'ringing',
      participants: [callerId, receiverId],
      mutedUsers: [],
      videoEnabled: type === 'video',
      speakerEnabled: true,
      recording: false,
      createdAt: serverTimestamp(),
      startedAt: null,
      endedAt: null,
      duration: 0,
    };

    const ref = await addDoc(collection(db, 'calls'), data);

    return { success: true, callId: ref.id, data };
  } catch (error) {
    console.log('CREATE CALL ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const acceptCall = async callId => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'accepted',
      startedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.log('ACCEPT CALL ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const declineCall = async callId => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'declined',
      endedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.log('DECLINE CALL ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const cancelCall = async callId => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'cancelled',
      endedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.log('CANCEL CALL ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const endCall = async (callId, duration = 0) => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'ended',
      duration,
      endedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.log('END CALL ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const getCall = async callId => {
  try {
    const snapshot = await getDoc(doc(db, 'calls', callId));

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.log('GET CALL ERROR:', error);
    return null;
  }
};

export const listenToCall = (callId, callback) => {
  return onSnapshot(doc(db, 'calls', callId), snapshot => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback({
      id: snapshot.id,
      ...snapshot.data(),
    });
  });
};

export const listenToIncomingCalls = (userId, callback) => {
  const q = query(
    collection(db, 'calls'),
    where('receiverId', '==', userId),
    where('status', '==', 'ringing')
  );

  return onSnapshot(q, snapshot => {
    const calls = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    }));

    callback(calls);
  });
};

export const getUserCallHistory = async userId => {
  try {
    const q = query(
      collection(db, 'calls'),
      where('participants', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    }));
  } catch (error) {
    console.log('CALL HISTORY ERROR:', error);
    return [];
  }
};

export const deleteCall = async callId => {
  try {
    await deleteDoc(doc(db, 'calls', callId));
    return { success: true };
  } catch (error) {
    console.log('DELETE CALL ERROR:', error);
    return { success: false, error: error.message };
  }
};

/* =========================
   CALL CONTROLS
========================= */

export const toggleMute = async (callId, mutedUsers = []) => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      mutedUsers,
    });

    return { success: true };
  } catch (error) {
    console.log('MUTE ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const toggleVideo = async (callId, enabled) => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      videoEnabled: enabled,
    });

    return { success: true };
  } catch (error) {
    console.log('VIDEO ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const toggleSpeaker = async (callId, enabled) => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      speakerEnabled: enabled,
    });

    return { success: true };
  } catch (error) {
    console.log('SPEAKER ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const toggleRecording = async (callId, recording) => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      recording,
    });

    return { success: true };
  } catch (error) {
    console.log('RECORDING ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const addParticipant = async (callId, userId) => {
  try {
    const callRef = doc(db, 'calls', callId);
    const snapshot = await getDoc(callRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Call not found' };
    }

    const data = snapshot.data();
    const participants = data.participants || [];

    const updatedParticipants = participants.includes(userId)
      ? participants
      : [...participants, userId];

    await updateDoc(callRef, {
      participants: updatedParticipants,
    });

    return {
      success: true,
      participants: updatedParticipants,
    };
  } catch (error) {
    console.log('ADD PARTICIPANT ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const removeParticipant = async (callId, userId) => {
  try {
    const callRef = doc(db, 'calls', callId);
    const snapshot = await getDoc(callRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Call not found' };
    }

    const data = snapshot.data();

    const updatedParticipants = (data.participants || []).filter(
      id => id !== userId
    );

    await updateDoc(callRef, {
      participants: updatedParticipants,
    });

    return {
      success: true,
      participants: updatedParticipants,
    };
  } catch (error) {
    console.log('REMOVE PARTICIPANT ERROR:', error);
    return { success: false, error: error.message };
  }
};

/* =========================
   SCHEDULED CALLS
========================= */

export const scheduleCall = async ({
  hostId,
  hostName,
  hostPhoto = '',
  title,
  description = '',
  type = 'voice',
  participantIds = [],
  scheduledAt,
}) => {
  try {
    const finalParticipants = Array.from(
      new Set([hostId, ...participantIds])
    );

    const data = {
      hostId,
      hostName,
      hostPhoto,
      title,
      description,
      type,
      participantIds: finalParticipants,
      scheduledAt,
      status: 'scheduled',
      reminderSent: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, 'scheduledCalls'), data);

    return {
      success: true,
      scheduledCallId: ref.id,
      data,
    };
  } catch (error) {
    console.log('SCHEDULE CALL ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const updateScheduledCall = async (scheduledCallId, updates) => {
  try {
    await updateDoc(doc(db, 'scheduledCalls', scheduledCallId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.log('UPDATE SCHEDULED CALL ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const cancelScheduledCall = async scheduledCallId => {
  try {
    await updateDoc(doc(db, 'scheduledCalls', scheduledCallId), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.log('CANCEL SCHEDULED CALL ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const completeScheduledCall = async scheduledCallId => {
  try {
    await updateDoc(doc(db, 'scheduledCalls', scheduledCallId), {
      status: 'completed',
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.log('COMPLETE SCHEDULED CALL ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const listenToScheduledCalls = (userId, callback) => {
  const q = query(
    collection(db, 'scheduledCalls'),
    where('participantIds', 'array-contains', userId),
    orderBy('scheduledAt', 'asc')
  );

  return onSnapshot(q, snapshot => {
    const calls = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    }));

    callback(calls);
  });
};

/* =========================
   LIVE STREAMS
========================= */

export const createLiveStream = async ({
  hostId,
  hostName,
  hostPhoto = '',
  title,
  description = '',
  category = 'Islamic Reminder',
  thumbnailUrl = '',
}) => {
  try {
    const data = {
      hostId,
      hostName,
      hostPhoto,
      title,
      description,
      category,
      thumbnailUrl,
      status: 'live',
      viewers: [],
      viewerCount: 0,
      likes: [],
      commentsCount: 0,
      startedAt: serverTimestamp(),
      endedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, 'liveStreams'), data);

    return {
      success: true,
      streamId: ref.id,
      data,
    };
  } catch (error) {
    console.log('CREATE LIVE STREAM ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const endLiveStream = async streamId => {
  try {
    await updateDoc(doc(db, 'liveStreams', streamId), {
      status: 'ended',
      endedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.log('END LIVE STREAM ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const joinLiveStream = async (streamId, userId) => {
  try {
    const streamRef = doc(db, 'liveStreams', streamId);
    const snapshot = await getDoc(streamRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Live stream not found' };
    }

    const data = snapshot.data();
    const viewers = data.viewers || [];

    const updatedViewers = viewers.includes(userId)
      ? viewers
      : [...viewers, userId];

    await updateDoc(streamRef, {
      viewers: updatedViewers,
      viewerCount: updatedViewers.length,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      viewers: updatedViewers,
    };
  } catch (error) {
    console.log('JOIN LIVE STREAM ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const leaveLiveStream = async (streamId, userId) => {
  try {
    const streamRef = doc(db, 'liveStreams', streamId);
    const snapshot = await getDoc(streamRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Live stream not found' };
    }

    const data = snapshot.data();

    const updatedViewers = (data.viewers || []).filter(id => id !== userId);

    await updateDoc(streamRef, {
      viewers: updatedViewers,
      viewerCount: updatedViewers.length,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      viewers: updatedViewers,
    };
  } catch (error) {
    console.log('LEAVE LIVE STREAM ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const likeLiveStream = async (streamId, userId) => {
  try {
    const streamRef = doc(db, 'liveStreams', streamId);
    const snapshot = await getDoc(streamRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Live stream not found' };
    }

    const data = snapshot.data();
    const likes = data.likes || [];

    const updatedLikes = likes.includes(userId)
      ? likes.filter(id => id !== userId)
      : [...likes, userId];

    await updateDoc(streamRef, {
      likes: updatedLikes,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      likes: updatedLikes,
    };
  } catch (error) {
    console.log('LIKE LIVE STREAM ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const listenToLiveStreams = callback => {
  const q = query(
    collection(db, 'liveStreams'),
    where('status', '==', 'live'),
    orderBy('startedAt', 'desc')
  );

  return onSnapshot(q, snapshot => {
    const streams = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    }));

    callback(streams);
  });
};

export const listenToSingleLiveStream = (streamId, callback) => {
  return onSnapshot(doc(db, 'liveStreams', streamId), snapshot => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback({
      id: snapshot.id,
      ...snapshot.data(),
    });
  });
};

/* =========================
   LIVE STREAM COMMENTS
========================= */

export const addLiveStreamComment = async ({
  streamId,
  userId,
  userName,
  userPhoto = '',
  text,
}) => {
  try {
    const data = {
      streamId,
      userId,
      userName,
      userPhoto,
      text,
      likes: [],
      createdAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, 'liveStreamComments'), data);

    const streamRef = doc(db, 'liveStreams', streamId);
    const snapshot = await getDoc(streamRef);

    if (snapshot.exists()) {
      const stream = snapshot.data();

      await updateDoc(streamRef, {
        commentsCount: (stream.commentsCount || 0) + 1,
      });
    }

    return {
      success: true,
      commentId: ref.id,
      data,
    };
  } catch (error) {
    console.log('ADD STREAM COMMENT ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const listenToLiveStreamComments = (streamId, callback) => {
  const q = query(
    collection(db, 'liveStreamComments'),
    where('streamId', '==', streamId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, snapshot => {
    const comments = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    }));

    callback(comments);
  });
};

export const deleteLiveStreamComment = async (commentId, streamId) => {
  try {
    await deleteDoc(doc(db, 'liveStreamComments', commentId));

    const streamRef = doc(db, 'liveStreams', streamId);
    const snapshot = await getDoc(streamRef);

    if (snapshot.exists()) {
      const stream = snapshot.data();

      await updateDoc(streamRef, {
        commentsCount: Math.max((stream.commentsCount || 1) - 1, 0),
      });
    }

    return { success: true };
  } catch (error) {
    console.log('DELETE STREAM COMMENT ERROR:', error);
    return { success: false, error: error.message };
  }
};

/* =========================
   CALL INVITES
========================= */

export const sendCallInvite = async ({
  callId,
  senderId,
  receiverId,
  type = 'voice',
  message = '',
}) => {
  try {
    const data = {
      callId,
      senderId,
      receiverId,
      type,
      message,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, 'callInvites'), data);

    return {
      success: true,
      inviteId: ref.id,
      data,
    };
  } catch (error) {
    console.log('SEND CALL INVITE ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const respondToCallInvite = async (inviteId, status) => {
  try {
    await updateDoc(doc(db, 'callInvites', inviteId), {
      status,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.log('RESPOND CALL INVITE ERROR:', error);
    return { success: false, error: error.message };
  }
};

export const listenToCallInvites = (userId, callback) => {
  const q = query(
    collection(db, 'callInvites'),
    where('receiverId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, snapshot => {
    const invites = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    }));

    callback(invites);
  });
};

export default {
  createCall,
  acceptCall,
  declineCall,
  cancelCall,
  endCall,
  getCall,
  listenToCall,
  listenToIncomingCalls,
  getUserCallHistory,
  deleteCall,

  toggleMute,
  toggleVideo,
  toggleSpeaker,
  toggleRecording,
  addParticipant,
  removeParticipant,

  scheduleCall,
  updateScheduledCall,
  cancelScheduledCall,
  completeScheduledCall,
  listenToScheduledCalls,

  createLiveStream,
  endLiveStream,
  joinLiveStream,
  leaveLiveStream,
  likeLiveStream,
  listenToLiveStreams,
  listenToSingleLiveStream,

  addLiveStreamComment,
  listenToLiveStreamComments,
  deleteLiveStreamComment,

  sendCallInvite,
  respondToCallInvite,
  listenToCallInvites,
};
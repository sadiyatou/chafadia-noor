import { useState, useEffect, useCallback } from 'react';

import callService from '../services/callService';

export default function useCall(currentUserId = null) {
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [callHistory, setCallHistory] = useState([]);

  const [scheduledCalls, setScheduledCalls] = useState([]);
  const [callInvites, setCallInvites] = useState([]);

  const [liveStreams, setLiveStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [streamComments, setStreamComments] = useState([]);

  const [loading, setLoading] = useState(false);

  /* =====================================
      CALL HISTORY
  ===================================== */

  const loadCallHistory = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const data =
        await callService.getUserCallHistory(
          currentUserId
        );

      setCallHistory(data || []);
    } catch (error) {
      console.log(
        'LOAD CALL HISTORY ERROR:',
        error
      );
    }
  }, [currentUserId]);

  /* =====================================
      CREATE CALL
  ===================================== */

  const startVoiceCall = async ({
    receiverId,
    receiverName,
    callerId,
    callerName,
    callerPhoto = '',
  }) => {
    setLoading(true);

    try {
      const response =
        await callService.createCall({
          callerId,
          callerName,
          callerPhoto,
          receiverId,
          receiverName,
          type: 'voice',
        });

      if (response.success) {
        setActiveCall({
          callId: response.callId,
          ...response.data,
        });
      }

      return response;
    } finally {
      setLoading(false);
    }
  };

  const startVideoCall = async ({
    receiverId,
    receiverName,
    callerId,
    callerName,
    callerPhoto = '',
  }) => {
    setLoading(true);

    try {
      const response =
        await callService.createCall({
          callerId,
          callerName,
          callerPhoto,
          receiverId,
          receiverName,
          type: 'video',
        });

      if (response.success) {
        setActiveCall({
          callId: response.callId,
          ...response.data,
        });
      }

      return response;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
      ACCEPT / DECLINE
  ===================================== */

  const acceptCall = async callId => {
    const response =
      await callService.acceptCall(callId);

    return response;
  };

  const declineCall = async callId => {
    const response =
      await callService.declineCall(callId);

    return response;
  };

  const cancelCall = async callId => {
    const response =
      await callService.cancelCall(callId);

    return response;
  };

  const endCall = async (
    callId,
    duration = 0
  ) => {
    const response =
      await callService.endCall(
        callId,
        duration
      );

    setActiveCall(null);

    await loadCallHistory();

    return response;
  };

  /* =====================================
      CALL CONTROLS
  ===================================== */

  const toggleMute = async (
    callId,
    mutedUsers
  ) => {
    return callService.toggleMute(
      callId,
      mutedUsers
    );
  };

  const toggleVideo = async (
    callId,
    enabled
  ) => {
    return callService.toggleVideo(
      callId,
      enabled
    );
  };

  const toggleSpeaker = async (
    callId,
    enabled
  ) => {
    return callService.toggleSpeaker(
      callId,
      enabled
    );
  };

  const toggleRecording = async (
    callId,
    recording
  ) => {
    return callService.toggleRecording(
      callId,
      recording
    );
  };

  /* =====================================
      PARTICIPANTS
  ===================================== */

  const addParticipant = async (
    callId,
    userId
  ) => {
    return callService.addParticipant(
      callId,
      userId
    );
  };

  const removeParticipant = async (
    callId,
    userId
  ) => {
    return callService.removeParticipant(
      callId,
      userId
    );
  };

  /* =====================================
      SCHEDULED CALLS
  ===================================== */

  const scheduleCall = async data => {
    return callService.scheduleCall(data);
  };

  const updateScheduledCall = async (
    scheduledCallId,
    updates
  ) => {
    return callService.updateScheduledCall(
      scheduledCallId,
      updates
    );
  };

  const cancelScheduledCall = async id => {
    return callService.cancelScheduledCall(id);
  };

  const completeScheduledCall =
    async id => {
      return callService.completeScheduledCall(
        id
      );
    };

  /* =====================================
      LIVE STREAMS
  ===================================== */

  const createLiveStream =
    async streamData => {
      return callService.createLiveStream(
        streamData
      );
    };

  const endLiveStream = async streamId => {
    return callService.endLiveStream(
      streamId
    );
  };

  const joinLiveStream = async (
    streamId,
    userId
  ) => {
    return callService.joinLiveStream(
      streamId,
      userId
    );
  };

  const leaveLiveStream = async (
    streamId,
    userId
  ) => {
    return callService.leaveLiveStream(
      streamId,
      userId
    );
  };

  const likeLiveStream = async (
    streamId,
    userId
  ) => {
    return callService.likeLiveStream(
      streamId,
      userId
    );
  };

  /* =====================================
      STREAM COMMENTS
  ===================================== */

  const addStreamComment = async data => {
    return callService.addLiveStreamComment(
      data
    );
  };

  /* =====================================
      INVITES
  ===================================== */

  const sendInvite = async data => {
    return callService.sendCallInvite(data);
  };

  const respondToInvite = async (
    inviteId,
    status
  ) => {
    return callService.respondToCallInvite(
      inviteId,
      status
    );
  };

  /* =====================================
      REALTIME LISTENERS
  ===================================== */

  useEffect(() => {
    if (!currentUserId) return;

    loadCallHistory();

    const unsubscribeIncoming =
      callService.listenToIncomingCalls(
        currentUserId,
        calls => {
          setIncomingCalls(calls || []);
        }
      );

    const unsubscribeScheduled =
      callService.listenToScheduledCalls(
        currentUserId,
        calls => {
          setScheduledCalls(calls || []);
        }
      );

    const unsubscribeInvites =
      callService.listenToCallInvites(
        currentUserId,
        invites => {
          setCallInvites(invites || []);
        }
      );

    const unsubscribeStreams =
      callService.listenToLiveStreams(
        streams => {
          setLiveStreams(streams || []);
        }
      );

    return () => {
      unsubscribeIncoming?.();
      unsubscribeScheduled?.();
      unsubscribeInvites?.();
      unsubscribeStreams?.();
    };
  }, [currentUserId, loadCallHistory]);

  /* =====================================
      STREAM COMMENTS LISTENER
  ===================================== */

  const watchStreamComments =
    streamId => {
      return callService.listenToLiveStreamComments(
        streamId,
        comments => {
          setStreamComments(
            comments || []
          );
        }
      );
    };

  const watchSingleStream =
    streamId => {
      return callService.listenToSingleLiveStream(
        streamId,
        stream => {
          setSelectedStream(stream);
        }
      );
    };

  return {
    loading,

    activeCall,
    incomingCalls,
    callHistory,

    scheduledCalls,
    callInvites,

    liveStreams,
    selectedStream,
    streamComments,

    setActiveCall,
    setSelectedStream,

    startVoiceCall,
    startVideoCall,

    acceptCall,
    declineCall,
    cancelCall,
    endCall,

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

    createLiveStream,
    endLiveStream,
    joinLiveStream,
    leaveLiveStream,
    likeLiveStream,

    addStreamComment,

    sendInvite,
    respondToInvite,

    watchStreamComments,
    watchSingleStream,

    loadCallHistory,
  };
}
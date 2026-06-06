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
   CREATE CALL
========================================================= */

export const createCall = async ({
  callerId,
  callerName,
  callerPhoto = '',
  receiverId,
  receiverName,
  type = 'voice', // voice | video
}) => {
  try {
    const callData = {
      callerId,
      callerName,
      callerPhoto,

      receiverId,
      receiverName,

      type,

      status: 'ringing',

      participants: [callerId, receiverId],

      createdAt: serverTimestamp(),

      startedAt: null,

      endedAt: null,

      duration: 0,

      mutedUsers: [],

      videoEnabled: type === 'video',

      speakerEnabled: true,

      recording: false,
    };

    const callRef = await addDoc(
      collection(db, 'calls'),
      callData
    );

    return {
      success: true,
      callId: callRef.id,
      data: callData,
    };
  } catch (error) {
    console.log('CREATE CALL ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   ACCEPT CALL
========================================================= */

export const acceptCall = async callId => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'accepted',
      startedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('ACCEPT CALL ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   DECLINE CALL
========================================================= */

export const declineCall = async callId => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'declined',
      endedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('DECLINE CALL ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   END CALL
========================================================= */

export const endCall = async (
  callId,
  duration = 0
) => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'ended',
      duration,
      endedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('END CALL ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   CANCEL CALL
========================================================= */

export const cancelCall = async callId => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'cancelled',
      endedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('CANCEL CALL ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   TOGGLE MUTE
========================================================= */

export const toggleMute = async (
  callId,
  mutedUsers = []
) => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      mutedUsers,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('MUTE ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   TOGGLE VIDEO
========================================================= */

export const toggleVideo = async (
  callId,
  enabled
) => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      videoEnabled: enabled,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('VIDEO ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   TOGGLE SPEAKER
========================================================= */

export const toggleSpeaker = async (
  callId,
  enabled
) => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      speakerEnabled: enabled,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('SPEAKER ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   START RECORDING
========================================================= */

export const toggleRecording = async (
  callId,
  recording
) => {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      recording,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('RECORD ERROR:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   ADD PARTICIPANT
========================================================= */

export const addParticipant = async (
  callId,
  userId
) => {
  try {
    const callRef = doc(db, 'calls', callId);

    const snapshot = await getDoc(callRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        error: 'Call not found',
      };
    }

    const data = snapshot.data();

    const updatedParticipants = [
      ...(data.participants || []),
      userId,
    ];

    await updateDoc(callRef, {
      participants: updatedParticipants,
    });

    return {
      success: true,
      participants: updatedParticipants,
    };
  } catch (error) {
    console.log(
      'ADD PARTICIPANT ERROR:',
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

/* =========================================================
   REMOVE PARTICIPANT
========================================================= */

export const removeParticipant =
  async (callId, userId) => {
    try {
      const callRef = doc(
        db,
        'calls',
        callId
      );

      const snapshot =
        await getDoc(callRef);

      if (!snapshot.exists()) {
        return {
          success: false,
          error: 'Call not found',
        };
      }

      const data = snapshot.data();

      const updatedParticipants =
        (data.participants || []).filter(
          item => item !== userId
        );

      await updateDoc(callRef, {
        participants:
          updatedParticipants,
      });

      return {
        success: true,
        participants:
          updatedParticipants,
      };
    } catch (error) {
      console.log(
        'REMOVE PARTICIPANT ERROR:',
        error
      );

      return {
        success: false,
        error: error.message,
      };
    }
  };

/* =========================================================
   GET CALL
========================================================= */

export const getCall = async callId => {
  try {
    const snapshot = await getDoc(
      doc(db, 'calls', callId)
    );

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.log(
      'GET CALL ERROR:',
      error
    );

    return null;
  }
};

/* =========================================================
   LISTEN TO CALL
========================================================= */

export const listenToCall = (
  callId,
  callback
) => {
  return onSnapshot(
    doc(db, 'calls', callId),
    snapshot => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback({
        id: snapshot.id,
        ...snapshot.data(),
      });
    }
  );
};

/* =========================================================
   GET USER CALL HISTORY
========================================================= */

export const getUserCallHistory =
  async userId => {
    try {
      const q = query(
        collection(db, 'calls'),
        where(
          'participants',
          'array-contains',
          userId
        ),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }));
    } catch (error) {
      console.log(
        'CALL HISTORY ERROR:',
        error
      );

      return [];
    }
  };

/* =========================================================
   DELETE CALL
========================================================= */

export const deleteCall =
  async callId => {
    try {
      await deleteDoc(
        doc(db, 'calls', callId)
      );

      return {
        success: true,
      };
    } catch (error) {
      console.log(
        'DELETE CALL ERROR:',
        error
      );

      return {
        success: false,
        error: error.message,
      };
    }
  };

/* =========================================================
   EXPORT
========================================================= */

export default {
  createCall,
  acceptCall,
  declineCall,
  endCall,
  cancelCall,

  toggleMute,
  toggleVideo,
  toggleSpeaker,
  toggleRecording,

  addParticipant,
  removeParticipant,

  getCall,
  listenToCall,

  getUserCallHistory,

  deleteCall,
};
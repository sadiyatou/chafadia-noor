import {
  doc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';

import { db } from './firebaseConfig';

/* =========================================================
   LISTEN TO DOCUMENT
========================================================= */

export const listenToDocument = ({
  collectionName,
  documentId,
  callback,
}) => {
  if (!collectionName || !documentId || !callback) {
    return () => {};
  }

  return onSnapshot(
    doc(db, collectionName, documentId),
    snapshot => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback({
        id: snapshot.id,
        ...snapshot.data(),
      });
    },
    error => {
      console.log('LISTEN DOCUMENT ERROR:', error);
      callback(null);
    }
  );
};

/* =========================================================
   LISTEN TO COLLECTION
========================================================= */

export const listenToCollection = ({
  collectionName,
  callback,
  orderField = 'createdAt',
  orderDirection = 'desc',
  limitCount = 50,
}) => {
  if (!collectionName || !callback) {
    return () => {};
  }

  const q = query(
    collection(db, collectionName),
    orderBy(orderField, orderDirection),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    snapshot => {
      const data = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }));

      callback(data);
    },
    error => {
      console.log('LISTEN COLLECTION ERROR:', error);
      callback([]);
    }
  );
};

/* =========================================================
   LISTEN WITH WHERE FILTER
========================================================= */

export const listenWhere = ({
  collectionName,
  field,
  operator = '==',
  value,
  callback,
  orderField = 'createdAt',
  orderDirection = 'desc',
  limitCount = 50,
}) => {
  if (!collectionName || !field || value === undefined || !callback) {
    return () => {};
  }

  const q = query(
    collection(db, collectionName),
    where(field, operator, value),
    orderBy(orderField, orderDirection),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    snapshot => {
      const data = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }));

      callback(data);
    },
    error => {
      console.log('LISTEN WHERE ERROR:', error);
      callback([]);
    }
  );
};

/* =========================================================
   LISTEN TO USER CHATS
========================================================= */

export const listenToUserChats = (userId, callback) => {
  if (!userId || !callback) {
    return () => {};
  }

  const q = query(
    collection(db, 'chats'),
    where('members', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  return onSnapshot(
    q,
    snapshot => {
      const chats = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }));

      callback(chats);
    },
    error => {
      console.log('LISTEN USER CHATS ERROR:', error);
      callback([]);
    }
  );
};

/* =========================================================
   LISTEN TO CHAT MESSAGES
========================================================= */

export const listenToChatMessages = (chatId, callback) => {
  if (!chatId || !callback) {
    return () => {};
  }

  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    q,
    snapshot => {
      const messages = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }));

      callback(messages);
    },
    error => {
      console.log('LISTEN CHAT MESSAGES ERROR:', error);
      callback([]);
    }
  );
};

/* =========================================================
   LISTEN TO TYPING STATUS
========================================================= */

export const listenToTypingStatus = (chatId, callback) => {
  if (!chatId || !callback) {
    return () => {};
  }

  return onSnapshot(
    doc(db, 'chats', chatId),
    snapshot => {
      if (!snapshot.exists()) {
        callback({});
        return;
      }

      callback(snapshot.data()?.typing || {});
    },
    error => {
      console.log('LISTEN TYPING ERROR:', error);
      callback({});
    }
  );
};

/* =========================================================
   LISTEN TO USER NOTIFICATIONS
========================================================= */

export const listenToUserNotifications = (userId, callback) => {
  if (!userId || !callback) {
    return () => {};
  }

  const q = query(
    collection(db, 'notifications'),
    where('receiverId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    snapshot => {
      const notifications = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }));

      callback(notifications);
    },
    error => {
      console.log('LISTEN NOTIFICATIONS ERROR:', error);
      callback([]);
    }
  );
};

/* =========================================================
   LISTEN TO INCOMING CALLS
========================================================= */

export const listenToIncomingCalls = (userId, callback) => {
  if (!userId || !callback) {
    return () => {};
  }

  const q = query(
    collection(db, 'calls'),
    where('receiverId', '==', userId),
    where('status', '==', 'ringing')
  );

  return onSnapshot(
    q,
    snapshot => {
      const calls = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }));

      callback(calls);
    },
    error => {
      console.log('LISTEN INCOMING CALLS ERROR:', error);
      callback([]);
    }
  );
};

/* =========================================================
   LISTEN TO SINGLE CALL
========================================================= */

export const listenToCall = (callId, callback) => {
  if (!callId || !callback) {
    return () => {};
  }

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
    },
    error => {
      console.log('LISTEN CALL ERROR:', error);
      callback(null);
    }
  );
};

/* =========================================================
   LISTEN TO SCHEDULED CALLS
========================================================= */

export const listenToScheduledCalls = (userId, callback) => {
  if (!userId || !callback) {
    return () => {};
  }

  const q = query(
    collection(db, 'scheduledCalls'),
    where('participantIds', 'array-contains', userId),
    orderBy('scheduledAt', 'asc')
  );

  return onSnapshot(
    q,
    snapshot => {
      const calls = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }));

      callback(calls);
    },
    error => {
      console.log('LISTEN SCHEDULED CALLS ERROR:', error);
      callback([]);
    }
  );
};

/* =========================================================
   LISTEN TO LIVE STREAMS
========================================================= */

export const listenToLiveStreams = callback => {
  if (!callback) {
    return () => {};
  }

  const q = query(
    collection(db, 'liveStreams'),
    where('status', '==', 'live'),
    orderBy('startedAt', 'desc')
  );

  return onSnapshot(
    q,
    snapshot => {
      const streams = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }));

      callback(streams);
    },
    error => {
      console.log('LISTEN LIVE STREAMS ERROR:', error);
      callback([]);
    }
  );
};

/* =========================================================
   LISTEN TO LIVE STREAM COMMENTS
========================================================= */

export const listenToLiveStreamComments = (streamId, callback) => {
  if (!streamId || !callback) {
    return () => {};
  }

  const q = query(
    collection(db, 'liveStreamComments'),
    where('streamId', '==', streamId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    q,
    snapshot => {
      const comments = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }));

      callback(comments);
    },
    error => {
      console.log('LISTEN STREAM COMMENTS ERROR:', error);
      callback([]);
    }
  );
};

/* =========================================================
   LISTEN TO COMMUNITY POSTS
========================================================= */

export const listenToCommunityPosts = callback => {
  if (!callback) {
    return () => {};
  }

  const q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    snapshot => {
      const posts = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }));

      callback(posts);
    },
    error => {
      console.log('LISTEN COMMUNITY POSTS ERROR:', error);
      callback([]);
    }
  );
};

/* =========================================================
   LISTEN TO USER PROFILE
========================================================= */

export const listenToUserProfile = (userId, callback) => {
  if (!userId || !callback) {
    return () => {};
  }

  return listenToDocument({
    collectionName: 'users',
    documentId: userId,
    callback,
  });
};

/* =========================================================
   EXPORT DEFAULT
========================================================= */

export default {
  listenToDocument,
  listenToCollection,
  listenWhere,

  listenToUserChats,
  listenToChatMessages,
  listenToTypingStatus,

  listenToUserNotifications,

  listenToIncomingCalls,
  listenToCall,
  listenToScheduledCalls,

  listenToLiveStreams,
  listenToLiveStreamComments,

  listenToCommunityPosts,
  listenToUserProfile,
};
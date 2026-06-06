import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from './firebaseConfig';

/* =========================================================
   REGISTER USER
========================================================= */

export const registerUser = async ({
  fullName,
  email,
  password,
  phone = '',
}) => {
  try {
    const userCredential =
      await createUserWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: fullName,
    });

    const profile = {
      uid: user.uid,
      fullName,
      email: user.email,
      phone,
      photoURL: '',
      bio: 'السلام عليكم ورحمة الله وبركاته',
      role: 'user',

      followers: [],
      following: [],
      friends: [],

      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
      totalLikes: 0,

      verified: false,
      isOnline: true,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), profile);

    return {
      success: true,
      user,
      profile,
    };
  } catch (error) {
    console.log('REGISTER USER ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   LOGIN USER
========================================================= */

export const loginUser = async ({ email, password }) => {
  try {
    const userCredential =
      await signInWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;

    await updateDoc(doc(db, 'users', user.uid), {
      isOnline: true,
      lastSeen: serverTimestamp(),
    });

    const profile = await getUserProfile(user.uid);

    return {
      success: true,
      user,
      profile,
    };
  } catch (error) {
    console.log('LOGIN USER ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   LOGOUT USER
========================================================= */

export const logoutUser = async () => {
  try {
    const user = auth.currentUser;

    if (user?.uid) {
      await updateDoc(doc(db, 'users', user.uid), {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    }

    await signOut(auth);

    return {
      success: true,
    };
  } catch (error) {
    console.log('LOGOUT USER ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPassword = async email => {
  try {
    await sendPasswordResetEmail(auth, email);

    return {
      success: true,
      message: 'Password reset email sent successfully.',
    };
  } catch (error) {
    console.log('RESET PASSWORD ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   GET USER PROFILE
========================================================= */

export const getUserProfile = async uid => {
  try {
    if (!uid) return null;

    const ref = doc(db, 'users', uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.log('GET USER PROFILE ERROR:', error);
    return null;
  }
};

/* =========================================================
   UPDATE USER PROFILE
========================================================= */

export const updateUserProfile = async (uid, data) => {
  try {
    if (!uid) {
      return {
        success: false,
        message: 'User ID is required.',
      };
    }

    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });

    const currentUser = auth.currentUser;

    if (currentUser && currentUser.uid === uid) {
      await updateProfile(currentUser, {
        displayName:
          data.fullName || currentUser.displayName || '',
        photoURL:
          data.photoURL || currentUser.photoURL || '',
      });
    }

    const profile = await getUserProfile(uid);

    return {
      success: true,
      profile,
    };
  } catch (error) {
    console.log('UPDATE USER PROFILE ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   ONLINE STATUS
========================================================= */

export const setUserOnlineStatus = async (uid, isOnline) => {
  try {
    if (!uid) return;

    await updateDoc(doc(db, 'users', uid), {
      isOnline,
      lastSeen: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('ONLINE STATUS ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   AUTH LISTENER
========================================================= */

export const listenToAuthChanges = callback => {
  return onAuthStateChanged(auth, async user => {
    if (user) {
      const profile = await getUserProfile(user.uid);

      callback({
        user,
        profile,
      });
    } else {
      callback({
        user: null,
        profile: null,
      });
    }
  });
};

/* =========================================================
   CREATE PROFILE IF MISSING
========================================================= */

export const createUserProfileIfMissing = async user => {
  try {
    if (!user?.uid) return null;

    const existing = await getUserProfile(user.uid);

    if (existing) return existing;

    const profile = {
      uid: user.uid,
      fullName: user.displayName || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      photoURL: user.photoURL || '',
      bio: 'السلام عليكم ورحمة الله وبركاته',
      role: 'user',

      followers: [],
      following: [],
      friends: [],

      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
      totalLikes: 0,

      verified: false,
      isOnline: true,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), profile);

    return profile;
  } catch (error) {
    console.log('CREATE PROFILE IF MISSING ERROR:', error);
    return null;
  }
};

/* =========================================================
   EXPORT DEFAULT
========================================================= */

export default {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  setUserOnlineStatus,
  listenToAuthChanges,
  createUserProfileIfMissing,
};
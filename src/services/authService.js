
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

import { auth, db } from '../firebase/firebaseConfig';

export const registerUser = async ({
  fullName,
  email,
  password,
  phone = '',
}) => {
  const userCredential =
    await createUserWithEmailAndPassword(auth, email, password);

  const user = userCredential.user;

  await updateProfile(user, {
    displayName: fullName,
  });

  const userData = {
    uid: user.uid,
    fullName,
    email: user.email,
    phone,
    photoURL: '',
    bio: 'السلام عليكم ورحمة الله وبركاته',
    role: 'user',
    followers: 0,
    following: 0,
    friends: 0,
    totalLikes: 0,
    verified: false,
    isOnline: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', user.uid), userData);

  return {
    user,
    profile: userData,
  };
};

export const loginUser = async ({ email, password }) => {
  const userCredential =
    await signInWithEmailAndPassword(auth, email, password);

  const user = userCredential.user;

  await updateDoc(doc(db, 'users', user.uid), {
    isOnline: true,
    lastSeen: serverTimestamp(),
  });

  const profile = await getUserProfile(user.uid);

  return {
    user,
    profile,
  };
};

export const logoutUser = async () => {
  const user = auth.currentUser;

  if (user?.uid) {
    await updateDoc(doc(db, 'users', user.uid), {
      isOnline: false,
      lastSeen: serverTimestamp(),
    });
  }

  await signOut(auth);
};

export const resetUserPassword = async email => {
  await sendPasswordResetEmail(auth, email);
};

export const getUserProfile = async uid => {
  if (!uid) return null;

  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

export const updateUserProfile = async (uid, data) => {
  if (!uid) return;

  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });

  const currentUser = auth.currentUser;

  if (currentUser && currentUser.uid === uid) {
    await updateProfile(currentUser, {
      displayName: data.fullName || currentUser.displayName || '',
      photoURL: data.photoURL || currentUser.photoURL || '',
    });
  }

  return await getUserProfile(uid);
};

export const setUserOnlineStatus = async (uid, isOnline) => {
  if (!uid) return;

  await updateDoc(doc(db, 'users', uid), {
    isOnline,
    lastSeen: serverTimestamp(),
  });
};

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

export const createUserProfileIfMissing = async user => {
  if (!user?.uid) return null;

  const existingProfile = await getUserProfile(user.uid);

  if (existingProfile) return existingProfile;

  const userData = {
    uid: user.uid,
    fullName: user.displayName || '',
    email: user.email || '',
    phone: user.phoneNumber || '',
    photoURL: user.photoURL || '',
    bio: 'السلام عليكم ورحمة الله وبركاته',
    role: 'user',
    followers: 0,
    following: 0,
    friends: 0,
    totalLikes: 0,
    verified: false,
    isOnline: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', user.uid), userData);

  return userData;
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  resetUserPassword,
  getUserProfile,
  updateUserProfile,
  setUserOnlineStatus,
  listenToAuthChanges,
  createUserProfileIfMissing,
};
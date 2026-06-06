import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../firebase/firebaseConfig';

type UserProfile = {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  bio?: string;
  role: 'user' | 'admin' | 'moderator';
  followers: number;
  following: number;
  friends: number;
  totalLikes: number;
  verified: boolean;
  isOnline: boolean;
  createdAt?: any;
  updatedAt?: any;
  lastSeen?: any;
};

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
};

export const AuthContext =
  createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [userProfile, setUserProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);

  const createUserProfile = async (
    firebaseUser: User,
    fullName = '',
    phone = ''
  ) => {
    const userRef = doc(db, 'users', firebaseUser.uid);

    const profileData: UserProfile = {
      uid: firebaseUser.uid,
      fullName:
        fullName || firebaseUser.displayName || '',
      email: firebaseUser.email || '',
      phone,
      photoURL: firebaseUser.photoURL || '',
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

    await setDoc(userRef, profileData);

    setUserProfile(profileData);
  };

  const fetchUserProfile = async (
    firebaseUser: User
  ) => {
    const userRef = doc(db, 'users', firebaseUser.uid);

    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as UserProfile;

      setUserProfile(data);

      await updateDoc(userRef, {
        isOnline: true,
        lastSeen: serverTimestamp(),
      });
    } else {
      await createUserProfile(firebaseUser);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    phone = ''
  ) => {
    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    await updateProfile(credential.user, {
      displayName: fullName,
    });

    await createUserProfile(
      credential.user,
      fullName,
      phone
    );
  };

  const login = async (
    email: string,
    password: string
  ) => {
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
  };

  const logout = async () => {
    if (user?.uid) {
      await updateDoc(doc(db, 'users', user.uid), {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    }

    await signOut(auth);

    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (
    data: Partial<UserProfile>
  ) => {
    if (!user?.uid) return;

    const userRef = doc(db, 'users', user.uid);

    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    setUserProfile(prev =>
      prev ? { ...prev, ...data } : prev
    );

    if (data.fullName || data.photoURL) {
      await updateProfile(user, {
        displayName:
          data.fullName || user.displayName || '',
        photoURL: data.photoURL || user.photoURL || '',
      });
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async firebaseUser => {
        try {
          setLoading(true);

          if (firebaseUser) {
            setUser(firebaseUser);
            await fetchUserProfile(firebaseUser);
          } else {
            setUser(null);
            setUserProfile(null);
          }
        } finally {
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        register,
        logout,
        resetPassword,
        updateUserProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuthContext must be used inside AuthProvider'
    );
  }

  return context;
}
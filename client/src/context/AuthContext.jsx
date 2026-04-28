/**
 * Authentication Context
 * Google Service: Firebase Auth (Google Sign-In + Email/Password)
 * Manages global auth state across the app
 */
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

/** Hook to access auth context */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  /** Save/update user profile in Firestore */
  const saveUserToFirestore = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || 'Voter',
          email: user.email,
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
          totalChats: 0,
          quizScore: 0,
          badge: null,
        });
      } else {
        await setDoc(userRef, { lastActive: serverTimestamp() }, { merge: true });
        setUserProfile(snap.data());
      }
    } catch (err) {
      console.warn('[Auth] Firestore save failed:', err.message);
    }
  };

  /** Google Sign-In */
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(result.user);
      toast.success(`Welcome, ${result.user.displayName?.split(' ')[0]}! 🗳️`);
      return result.user;
    } catch (err) {
      console.error('[Auth] Google sign-in error:', err);
      toast.error(`Sign-in failed: ${err.message || 'Unknown error'}`);
      throw err;
    }
  };

  /** Email/Password Sign-In */
  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back! 🗳️');
      return result.user;
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' ? 'Invalid email or password' : 'Sign-in failed';
      toast.error(msg);
      throw err;
    }
  };

  /** Email/Password Registration */
  const registerWithEmail = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await saveUserToFirestore({ ...result.user, displayName });
      toast.success(`Account created! Welcome, ${displayName}! 🎉`);
      return result.user;
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? 'Email already registered' : 'Registration failed';
      toast.error(msg);
      throw err;
    }
  };

  /** Sign Out */
  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    toast.success('Signed out successfully');
  };

  /** Get Firebase ID token for API calls */
  const getIdToken = async () => {
    if (!currentUser) return null;
    return currentUser.getIdToken();
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) await saveUserToFirestore(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    logout,
    getIdToken,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

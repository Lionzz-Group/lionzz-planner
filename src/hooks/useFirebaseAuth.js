import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  setPersistence, 
  browserLocalPersistence,
  signInWithPopup,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signOut
} from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import { firebaseConfig } from '../services/firebaseConfig';

export function useFirebaseAuth() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);
      
      setDb(firestoreDb);
      setAuth(firebaseAuth);

      setPersistence(firebaseAuth, browserLocalPersistence)
        .then(() => {
          const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
            if (currentUser) {
              setUserId(currentUser.uid);
              setUser(currentUser);
            } else {
              setUserId(null);
              setUser(null);
            }
            setIsAuthReady(true);
          });
          return unsubscribe;
        })
        .catch((error) => {
          console.error("Error setting persistence:", error);
          setIsAuthReady(true);
        });

    } catch (e) {
      console.error("Error initializing Firebase:", e);
      setIsAuthReady(true);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signInWithGitHub = async () => {
    if (!auth) return;
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
      throw error;
    }
  };

  const signInWithDiscord = async () => {
    if (!auth) return;
    const provider = new OAuthProvider('discord.com');
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Discord:", error);
      throw error;
    }
  };

  const signInAnonymouslyUser = async () => {
    if (!auth) return;
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error signing in anonymously:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return { 
    db, 
    auth, 
    userId, 
    user,
    isAuthReady, 
    signInWithGoogle,
    signInWithGitHub,
    signInWithDiscord,
    signInAnonymously: signInAnonymouslyUser,
    logout
  };
}
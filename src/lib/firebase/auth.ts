import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile } from './firestore';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  // Create profile if first-time login
  await createUserProfile(result.user);
  return result.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  await createUserProfile(result.user);
  return result.user;
};

export const signOut = () => firebaseSignOut(auth);

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

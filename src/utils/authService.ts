import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { app } from '@/lib/firebase';

const auth = getAuth(app);

export const signInUser = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw new Error('Invalid credentials. Please try again.');
  }
};

export const signUpUser = async (email: string, password: string) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    const error = err as AuthError;
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('This email address is already in use.');
      case 'auth/weak-password':
        throw new Error('Password must be at least 6 characters long.');
      default:
        throw new Error('Could not create account. Please try again.');
    }
  }
};

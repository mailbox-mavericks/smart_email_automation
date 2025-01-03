import { auth } from '../config/auth_config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// const provider = new GoogleAuthProvider();
// export const signInWithGoogle = async () => {
//   try {
//     const result = await signInWithPopup(auth, provider);
//     return result.user;
//   } catch (error) {
//     console.error('Error signing in:', error);
//     throw error;
//   }
// };

export const handleSignUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User signed up:', userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up:', error.code, error.message);
    throw new Error('Failed to sign up. Please try again.');
  }
};

export const handleSignIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in:', userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error.code, error.message);
    throw new Error('Invalid credentials. Please try again.');
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};
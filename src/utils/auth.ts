import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    console.error('Google sign in error:', error);
    return {
      success: false,
      error: 'Failed to sign in with Google'
    };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    console.error('Email sign in error:', error);
    return {
      success: false,
      error: 'Invalid email or password'
    };
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: 'Failed to create account'
    };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: 'Failed to sign out'
    };
  }
};

export const verifyPassword = async (password: string): Promise<boolean> => {
  const hashedInput = await generateHash(password);
  const correctHash = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
  return hashedInput === correctHash;
};

async function generateHash(input: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface AuthResponse {
  success: boolean;
  user?: any;
  error?: string;
}

export function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function encryptData(data: string): string {
  return btoa(data);
}

export function decryptData(encrypted: string): string {
  return atob(encrypted);
}
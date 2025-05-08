import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { auth, googleProvider, db } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
} from "firebase/firestore";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    console.error("Google sign in error:", error);
    return {
      success: false,
      error: "Failed to sign in with Google",
    };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    // Step 1: Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Step 2: Query user data from Firestore 'users' table
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return { userAuth: user, userData };
    } else {
      throw new Error("User record not found in database.");
    }
  } catch (error) {
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  userType: "isDriver" | "isCustomer",
  phone: string
) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Format phone number for storage (strip non-digits)
    const formattedPhone = phone.replace(/\D/g, "");

    // Create a referral code using a combination of name and random digits
    const referralCode = generateReferralCode(name);

    // Add to Firestore users table
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email,
      name,
      phone: formattedPhone,
      createdAt: new Date().toISOString(),
      membershipLevel: "Basic",
      points: 100, // Starting points
      skyBucks: 0,
      isVerified: false, // Will be set to true after ID verification
      [userType]: true, // Set the user type flag
      deliveryAddresses: [],
      paymentMethods: [],
      events: ["e1"],
      referralCode,
      purchaseCount: 0,
      availableDiscounts: {
        firstPurchase: 20,
        secondPurchase: 10,
        thirdPurchase: 5,
      },
    });

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error: "Failed to create account",
    };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    return {
      success: false,
      error: "Failed to sign out",
    };
  }
};

export const verifyPassword = async (password: string): Promise<boolean> => {
  const hashedInput = await generateHash(password);
  const correctHash =
    "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
  return hashedInput === correctHash;
};

async function generateHash(input: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateReferralCode(name: string): string {
  // Take first 3 characters of name (or less if name is shorter)
  const namePrefix = name.slice(0, 3).toUpperCase();

  // Generate 4 random digits
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `${namePrefix}${randomPart}`;
}

export interface AuthResponse {
  success: boolean;
  user?: any;
  error?: string;
}

export function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function encryptData(data: string): string {
  return btoa(data);
}

export function decryptData(encrypted: string): string {
  return atob(encrypted);
}

// New utility function for validating US phone number
export function isValidUSPhoneNumber(phone: string): boolean {
  // Strip all non-numeric characters
  const phoneDigits = phone.replace(/\D/g, "");

  // Check if it's exactly 10 digits (US phone number without country code)
  return phoneDigits.length === 10;
}

// New utility function for validating email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// New utility function for validating password strength
export function isStrongPassword(password: string): boolean {
  // At least 6 characters
  return password.length >= 6;
}
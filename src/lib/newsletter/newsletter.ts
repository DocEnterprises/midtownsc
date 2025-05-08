// firebase/newsletter.ts

import { db } from '../firebase'; 
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

/**
 * Adds email to the newsletter collection
 */
export const subscribeToNewsletter = async (email: string) => {
  try {
    const q = query(collection(db, 'newsletter'), where('email', '==', email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return { success: false, message: 'Email already subscribed' };
    }

    await addDoc(collection(db, 'newsletter'), {
      email,
      subscribedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (err: any) {
    console.error('Newsletter error:', err);
    return { success: false, message: err.message || 'Something went wrong' };
  }
};

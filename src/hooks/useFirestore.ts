import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';

export const useFirestore = () => {
  const { user, setUser } = useStore();

  useEffect(() => {
    if (!user?.id) return;

    // Real-time listener for user data
    const unsubUser = onSnapshot(doc(db, 'users', user.id), (doc) => {
      if (doc.exists()) {
        setUser({ id: doc.id, ...doc.data() });
      }
    });

    // Real-time listener for orders
    const ordersQuery = query(
      collection(db, 'users', user.id, 'orders')
    );
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUser(prev => prev ? { ...prev, orders } : null);
    });

    // Real-time listener for rewards
    const rewardsQuery = query(
      collection(db, 'users', user.id, 'rewards')
    );
    const unsubRewards = onSnapshot(rewardsQuery, (snapshot) => {
      const rewards = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUser(prev => prev ? { ...prev, rewards } : null);
    });

    return () => {
      unsubUser();
      unsubOrders();
      unsubRewards();
    };
  }, [user?.id]);

  const updateUserData = async (data: Partial<typeof user>) => {
    if (!user?.id) return;
    
    try {
      await updateDoc(doc(db, 'users', user.id), data);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  return { updateUserData };
};

export default useFirestore;
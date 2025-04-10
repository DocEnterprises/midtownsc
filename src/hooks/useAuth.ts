import { useState } from 'react';
import { useStore } from '../store/useStore';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication
      if (email === 'admin@skyclub.com' && password === 'admin123') {
        setUser({
          id: 'admin-id',
          email: 'admin@skyclub.com',
          name: 'Admin',
          isVerified: true,
          membershipLevel: 'first class',
          isAdmin: true,
          points: 1000,
          skyBucks: 100,
          deliveryAddresses: [],
          paymentMethods: [],
          events: ['e1'],
          referralCode: 'ADMIN001',
          purchaseCount: 0,
          orders: [],
          availableDiscounts: {
            firstPurchase: 20,
            secondPurchase: 10,
            thirdPurchase: 5
          }
        });
        return { success: true };
      }

      if (email === 'customer@skyclub.com' && password === 'customer123') {
        setUser({
          id: 'customer-id',
          email: 'customer@skyclub.com',
          name: 'Test Customer',
          isVerified: true,
          membershipLevel: 'economy',
          points: 100,
          skyBucks: 25,
          deliveryAddresses: [],
          paymentMethods: [],
          events: ['e1'],
          referralCode: 'CUST001',
          purchaseCount: 2,
          orders: [],
          availableDiscounts: {
            firstPurchase: 0,
            secondPurchase: 0,
            thirdPurchase: 5,
            referralDiscount: 10
          }
        });
        return { success: true };
      }

      if (email === 'driver@skyclub.com' && password === 'driver123') {
        setUser({
          id: 'driver-id',
          email: 'driver@skyclub.com',
          name: 'Test Driver',
          isVerified: true,
          membershipLevel: 'economy',
          isDriver: true,
          points: 0,
          skyBucks: 0,
          deliveryAddresses: [],
          paymentMethods: [],
          events: [],
          referralCode: 'DRIVER001',
          purchaseCount: 0,
          orders: [],
          availableDiscounts: {}
        });
        return { success: true };
      }

      throw new Error('Invalid email or password');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock sign up
      setUser({
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        isVerified: false,
        membershipLevel: 'economy',
        points: 0,
        skyBucks: 0,
        deliveryAddresses: [],
        paymentMethods: [],
        events: [],
        referralCode: `REF${Date.now().toString(36).toUpperCase()}`,
        purchaseCount: 0,
        orders: [],
        availableDiscounts: {
          firstPurchase: 20,
          secondPurchase: 10,
          thirdPurchase: 5
        }
      });
      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Mock Google sign in
      setUser({
        id: `google-${Date.now()}`,
        email: 'google.user@gmail.com',
        name: 'Google User',
        isVerified: true,
        membershipLevel: 'economy',
        points: 0,
        skyBucks: 0,
        deliveryAddresses: [],
        paymentMethods: [],
        events: [],
        referralCode: `GOOGLE${Date.now().toString(36).toUpperCase()}`,
        purchaseCount: 0,
        orders: [],
        availableDiscounts: {
          firstPurchase: 20,
          secondPurchase: 10,
          thirdPurchase: 5
        }
      });
      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout
  };
};

export default useAuth;
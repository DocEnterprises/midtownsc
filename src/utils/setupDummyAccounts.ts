import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const dummyAccounts = [
  {
    email: 'admin@skyclub.com',
    password: 'admin123',
    data: {
      name: 'Admin',
      isVerified: true,
      membershipLevel: 'first class',
      isAdmin: true,
      points: 1000,
      skyBucks: 100,
      deliveryAddresses: [
        {
          id: 'addr-admin-1',
          address: '123 Chelsea, New York, NY 10011',
          isDefault: true
        }
      ],
      paymentMethods: [
        {
          id: 'pm-admin-1',
          last4: '4242',
          type: 'Visa',
          isDefault: true
        }
      ],
      events: ['e1'],
      referralCode: 'ADMIN001',
      purchaseCount: 0,
      orders: [],
      rewards: [],
      availableDiscounts: {
        firstPurchase: 20,
        secondPurchase: 10,
        thirdPurchase: 5
      }
    }
  },
  {
    email: 'customer@skyclub.com',
    password: 'customer123',
    data: {
      name: 'Test Customer',
      isVerified: true,
      membershipLevel: 'economy',
      points: 100,
      skyBucks: 25,
      deliveryAddresses: [
        {
          id: 'addr1',
          address: '123 Test St, New York, NY 10001',
          isDefault: true
        }
      ],
      paymentMethods: [
        {
          id: 'pm1',
          last4: '4242',
          type: 'Visa',
          isDefault: true
        }
      ],
      events: ['e1'],
      referralCode: 'CUST001',
      purchaseCount: 2,
      orders: [],
      rewards: [],
      availableDiscounts: {
        firstPurchase: 0,
        secondPurchase: 0,
        thirdPurchase: 5,
        referralDiscount: 10
      }
    }
  },
  {
    email: 'driver@skyclub.com',
    password: 'driver123',
    data: {
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
      rewards: [],
      availableDiscounts: {}
    }
  }
];

export const setupDummyAccounts = async () => {
  try {
    for (const account of dummyAccounts) {
      try {
        // Check if user already exists in Firestore
        const userQuery = await getDoc(doc(db, 'users', account.email));
        if (userQuery.exists()) {
          console.log(`Account ${account.email} already exists`);
          continue;
        }

        // Create auth account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          account.email,
          account.password
        );

        // Set up user data in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          id: userCredential.user.uid,
          email: account.email,
          ...account.data
        });

        console.log(`Created account for ${account.email}`);
      } catch (error: any) {
        // Skip if account already exists
        if (error.code === 'auth/email-already-in-use') {
          console.log(`Account ${account.email} already exists`);
          continue;
        }
        throw error;
      }
    }
    console.log('Demo accounts setup complete');
  } catch (error) {
    console.error('Error setting up demo accounts:', error);
    throw error;
  }
};
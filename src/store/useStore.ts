import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  membershipLevel: 'economy' | 'premium economy' | 'business' | 'first class';
  points: number;
  skyBucks: number;
  deliveryAddresses: Array<{
    id: string;
    address: string;
    isDefault: boolean;
  }>;
  paymentMethods: Array<{
    id: string;
    last4: string;
    type: string;
    isDefault: boolean;
  }>;
  orders: Array<{
    id: string;
    status: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    deliveryAddress: string;
    trackingInfo?: {
      location: {
        lat: number;
        lng: number;
      };
      estimatedDelivery: string;
    };
  }>;
  events: string[];
  profileImage?: string;
  customReferralKeyword?: string;
  referralCode: string;
  referredBy?: string;
  purchaseCount: number;
  availableDiscounts: {
    firstPurchase: number;
    secondPurchase: number;
    thirdPurchase: number;
    referralDiscount?: number;
  };
}

interface StoreState {
  user: UserProfile | null;
  cart: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  darkMode: boolean;
  isPasswordVerified: boolean;
  isAgeVerified: boolean;
  isAuthModalOpen: boolean;
  isCartOpen: boolean;
  isMenuOpen: boolean;
  isPromoModalOpen: boolean;
  promoEmail: string;

  setUser: (user: UserProfile | null) => void;
  setDarkMode: (darkMode: boolean) => void;
  openAuthModal: (mode: 'signin' | 'signup', callback?: () => void) => void;
  closeAuthModal: () => void;
  toggleCart: () => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  setPromoModalOpen: (isOpen: boolean) => void;
  setPromoEmail: (email: string) => void;
  
  addToCart: (item: Omit<StoreState['cart'][0], 'quantity'>) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  
  addSkyBucks: (amount: number) => void;
  removeSkyBucks: (amount: number) => void;
  
  removeOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
}

// Mock data for demo accounts
const demoAccounts = {
  admin: {
    id: 'admin-id',
    email: 'admin@skyclub.com',
    name: 'Admin',
    isVerified: true,
    membershipLevel: 'first class' as const,
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
  },
  customer: {
    id: 'customer-id',
    email: 'customer@skyclub.com',
    name: 'Test Customer',
    isVerified: true,
    membershipLevel: 'economy' as const,
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
  },
  driver: {
    id: 'driver-id',
    email: 'driver@skyclub.com',
    name: 'Test Driver',
    isVerified: true,
    membershipLevel: 'economy' as const,
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
  }
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      cart: [],
      darkMode: false,
      isPasswordVerified: false,
      isAgeVerified: false,
      isAuthModalOpen: false,
      isCartOpen: false,
      isMenuOpen: false,
      isPromoModalOpen: false,
      promoEmail: '',

      setUser: (user) => set({ user }),
      setDarkMode: (darkMode) => set({ darkMode }),
      
      openAuthModal: (mode, callback) => {
        if (callback) {
          localStorage.setItem('authCallback', callback.toString());
        }
        set({ isAuthModalOpen: true });
      },
      
      closeAuthModal: () => set({ isAuthModalOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
      closeMenu: () => set({ isMenuOpen: false }),
      setPromoModalOpen: (isOpen) => set({ isPromoModalOpen: isOpen }),
      setPromoEmail: (email) => set({ promoEmail: email }),

      addToCart: (item) => set((state) => {
        const existingItem = state.cart.find((i) => i.id === item.id);
        if (existingItem) {
          return {
            cart: state.cart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { cart: [...state.cart, { ...item, quantity: 1 }] };
      }),

      updateCartItemQuantity: (id, quantity) =>
        set((state) => ({
          cart:
            quantity === 0
              ? state.cart.filter((item) => item.id !== id)
              : state.cart.map((item) =>
                  item.id === id ? { ...item, quantity } : item
                ),
        })),

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ cart: [] }),

      addSkyBucks: (amount) => set((state) => ({
        user: state.user ? {
          ...state.user,
          skyBucks: (state.user.skyBucks || 0) + amount
        } : null
      })),

      removeSkyBucks: (amount) => set((state) => ({
        user: state.user ? {
          ...state.user,
          skyBucks: Math.max(0, (state.user.skyBucks || 0) - amount)
        } : null
      })),

      removeOrder: (orderId) => set((state) => ({
        user: state.user ? {
          ...state.user,
          orders: state.user.orders.filter(order => order.id !== orderId)
        } : null
      })),

      updateOrderStatus: (orderId, status) => set((state) => ({
        user: state.user ? {
          ...state.user,
          orders: state.user.orders.map(order =>
            order.id === orderId ? { ...order, status } : order
          )
        } : null
      }))
    }),
    {
      name: 'skyclub-storage',
      partialize: (state) => ({
        cart: state.cart,
        darkMode: state.darkMode,
        user: state.user
      }),
    }
  )
);
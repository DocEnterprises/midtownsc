import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AdminStats {
  totalProducts: number;
  activePromotions: number;
  dailyOrders: number;
  dailyRevenue: number;
  productsTrend: number;
  promotionsTrend: number;
  ordersTrend: number;
  revenueTrend: number;
}

interface Notification {
  id: string;
  type: 'order' | 'inventory' | 'promotion';
  message: string;
  timestamp: number;
  read: boolean;
}

interface AdminStore {
  stats: AdminStats;
  notifications: {
    items: Notification[];
    unread: number;
  };
  updateStats: (stats: Partial<AdminStats>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      stats: {
        totalProducts: 0,
        activePromotions: 0,
        dailyOrders: 0,
        dailyRevenue: 0,
        productsTrend: 0,
        promotionsTrend: 0,
        ordersTrend: 0,
        revenueTrend: 0
      },
      notifications: {
        items: [],
        unread: 0
      },
      updateStats: (newStats) =>
        set((state) => ({
          stats: { ...state.stats, ...newStats }
        })),
      addNotification: (notification) =>
        set((state) => ({
          notifications: {
            items: [
              {
                id: Date.now().toString(),
                timestamp: Date.now(),
                read: false,
                ...notification
              },
              ...state.notifications.items
            ],
            unread: state.notifications.unread + 1
          }
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: {
            items: state.notifications.items.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unread: Math.max(0, state.notifications.unread - 1)
          }
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: {
            items: state.notifications.items.map((n) => ({ ...n, read: true })),
            unread: 0
          }
        }))
    }),
    {
      name: 'admin-store'
    }
  )
);

// Set up real-time listeners for admin data
export const initializeAdminListeners = (userId: string) => {
  // Products listener
  const productsQuery = query(collection(db, 'products'));
  const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
    useAdminStore.getState().updateStats({
      totalProducts: snapshot.size
    });
  });

  // Orders listener
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const ordersQuery = query(
    collection(db, 'orders'),
    where('createdAt', '>=', today)
  );
  
  const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
    let revenue = 0;
    snapshot.forEach((doc) => {
      revenue += doc.data().total || 0;
    });

    useAdminStore.getState().updateStats({
      dailyOrders: snapshot.size,
      dailyRevenue: revenue
    });
  });

  // Promotions listener
  const promotionsQuery = query(
    collection(db, 'promotions'),
    where('active', '==', true)
  );
  
  const unsubPromotions = onSnapshot(promotionsQuery, (snapshot) => {
    useAdminStore.getState().updateStats({
      activePromotions: snapshot.size
    });
  });

  return () => {
    unsubProducts();
    unsubOrders();
    unsubPromotions();
  };
};

export default useAdminStore;
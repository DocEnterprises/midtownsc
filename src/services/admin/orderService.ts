import { Order } from '../../components/admin/types';

// Mock data store
let orders: Order[] = [];

export const orderService = {
  getOrders: async (): Promise<Order[]> => {
    return orders;
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<Order> => {
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Order not found');
    
    orders[index] = { ...orders[index], status };
    return orders[index];
  },

  deleteOrder: async (orderId: string): Promise<void> => {
    orders = orders.filter(o => o.id !== orderId);
  }
};
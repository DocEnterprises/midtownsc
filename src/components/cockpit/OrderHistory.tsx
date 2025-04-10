import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  status: 'pending' | 'processing' | 'delivering' | 'completed';
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryAddress: string;
  trackingInfo?: {
    status: string;
    location: {
      lat: number;
      lng: number;
    };
    estimatedDelivery: string;
  };
}

interface Props {
  orders: Order[];
  onOrderRemoved: (orderId: string) => void;
}

const OrderHistory: React.FC<Props> = ({ orders, onOrderRemoved }) => {
  const { user } = useStore();

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-400" />;
      case 'delivering':
        return <Package className="w-5 h-5 text-purple-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
  };

  const handleRemoveOrder = async (orderId: string) => {
    if (!user) return;
    
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', user.id, 'orders', orderId));
      onOrderRemoved(orderId); // Update local state immediately
      toast.success('Order removed successfully');
    } catch (error) {
      console.error('Error removing order:', error);
      toast.error('Failed to remove order');
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/5 p-4 rounded-lg relative"
            layout
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">#{order.id}</span>
                <button
                  onClick={() => handleRemoveOrder(order.id)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                  title="Remove order"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-2 border-t border-white/10">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-bold">${order.total.toFixed(2)}</span>
              </div>
              {order.trackingInfo && (
                <p className="text-sm text-gray-400 mt-2">
                  Estimated delivery: {order.trackingInfo.estimatedDelivery}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default OrderHistory;
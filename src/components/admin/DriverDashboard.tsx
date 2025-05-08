import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Phone } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface Order {
  id: string;
  status: string;
  customerName: string;
  customerAddress: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  total: number;
  createdAt: Date;
}

const DriverDashboard: React.FC = () => {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const { user } = useStore();

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_CHAT_WS_URL);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'driver_connect',
        driverId: user?.id
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_orders') {
        setAvailableOrders(data.orders);
      } else if (data.type === 'active_orders_update') {
        setActiveOrders(data.orders);
      }
    };

    return () => ws.close();
  }, [user?.id]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/driver/accept-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          driverId: user?.id
        })
      });

      if (!response.ok) throw new Error('Failed to accept order');

      // WebSocket will handle the update
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await fetch('/api/driver/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          status,
          driverId: user?.id
        })
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Driver Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Orders */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Available Orders</h2>
          <div className="space-y-4">
            {availableOrders.map(order => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 p-4 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Order #{order.id}</span>
                  <span className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span>{order.customerAddress}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {order.items.map(item => (
                      <div key={item.name}>
                        {item.quantity}x {item.name}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptOrder(order.id)}
                  className="w-full button-primary"
                >
                  Accept Order
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Active Deliveries</h2>
          <div className="space-y-4">
            {activeOrders.map(order => (
              <motion.div
                key={order.id}
                className="bg-white/5 p-4 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Order #{order.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-400' :
                    order.status === 'out_for_delivery' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-purple-400" />
                      <span>{order.customerName}</span>
                    </div>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="p-2 hover:bg-white/10 rounded-full"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span>{order.customerAddress}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'preparing')}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                    disabled={order.status !== 'accepted'}
                  >
                    Start Preparing
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                    disabled={order.status !== 'preparing'}
                  >
                    Start Delivery
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'delivered')}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                    disabled={order.status !== 'out_for_delivery'}
                  >
                    Complete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
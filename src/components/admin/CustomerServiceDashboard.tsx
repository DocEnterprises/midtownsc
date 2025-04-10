import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, Phone, User, Package } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface Order {
  id: string;
  status: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  total: number;
  createdAt: Date;
}

interface Notification {
  id: string;
  type: 'new_order' | 'support_request' | 'delivery_issue';
  message: string;
  createdAt: Date;
  read: boolean;
}

const CustomerServiceDashboard: React.FC = () => {
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeChats, setActiveChats] = useState<string[]>([]);
  const { user } = useStore();

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_CHAT_WS_URL);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'cs_connect',
        csId: user?.id
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_order':
          setNewOrders(prev => [...prev, data.order]);
          setNotifications(prev => [{
            id: `not-${Date.now()}`,
            type: 'new_order',
            message: `New order #${data.order.id} received`,
            createdAt: new Date(),
            read: false
          }, ...prev]);
          break;
          
        case 'support_request':
          setActiveChats(prev => [...prev, data.customerId]);
          setNotifications(prev => [{
            id: `not-${Date.now()}`,
            type: 'support_request',
            message: `New support request from ${data.customerName}`,
            createdAt: new Date(),
            read: false
          }, ...prev]);
          break;
      }
    };

    return () => ws.close();
  }, [user?.id]);

  const handleAssignDriver = async (orderId: string) => {
    try {
      const response = await fetch('/api/cs/assign-driver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) throw new Error('Failed to assign driver');

      setNewOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error assigning driver:', error);
    }
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(not =>
        not.id === notificationId ? { ...not, read: true } : not
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Customer Service Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Orders */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">New Orders</h2>
          <div className="space-y-4">
            {newOrders.map(order => (
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
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-purple-400" />
                    <span>{order.customerName}</span>
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
                  onClick={() => handleAssignDriver(order.id)}
                  className="w-full button-primary"
                >
                  Assign Driver
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active Support Chats */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Active Support Chats</h2>
          <div className="space-y-4">
            {activeChats.map(chatId => (
              <div
                key={chatId}
                className="bg-white/5 p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="font-medium">Customer #{chatId}</p>
                    <p className="text-sm text-gray-400">Active conversation</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full">
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          <div className="space-y-4">
            {notifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={!notification.read ? { opacity: 0, y: 20 } : undefined}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg flex items-center space-x-3 ${
                  notification.read ? 'bg-white/5' : 'bg-purple-500/20'
                }`}
                onClick={() => markNotificationRead(notification.id)}
              >
                {notification.type === 'new_order' ? (
                  <Package className="w-5 h-5 text-purple-400" />
                ) : notification.type === 'support_request' ? (
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                ) : (
                  <Bell className="w-5 h-5 text-yellow-400" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceDashboard;
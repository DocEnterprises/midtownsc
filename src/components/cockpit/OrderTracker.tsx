import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Truck, Clock, MapPin } from 'lucide-react';
import { useStore } from '../../store/useStore';
import DeliveryMap from './DeliveryMap';

interface OrderStatus {
  id: string;
  status: 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered';
  driverId?: string;
  driverName?: string;
  estimatedDelivery?: string;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  lastUpdate: Date;
}

const steps = [
  { id: 'pending', label: 'Order Received', icon: Clock },
  { id: 'accepted', label: 'Driver Assigned', icon: CheckCircle },
  { id: 'preparing', label: 'Preparing Order', icon: Package },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle }
];

const OrderTracker: React.FC<{ orderId: string }> = ({ orderId }) => {
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [progress, setProgress] = useState(0);
  const { user } = useStore();

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket(import.meta.env.VITE_CHAT_WS_URL);
    
    ws.onopen = () => {
      // Subscribe to order updates
      ws.send(JSON.stringify({
        type: 'subscribe_order',
        orderId,
        userId: user?.id
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'order_update') {
        setOrderStatus(data.status);
        
        // Calculate progress percentage
        const currentStepIndex = steps.findIndex(step => step.id === data.status.status);
        setProgress((currentStepIndex / (steps.length - 1)) * 100);
      }
    };

    return () => {
      ws.close();
    };
  }, [orderId, user?.id]);

  if (!orderStatus) return null;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute h-full bg-gradient-to-r from-purple-500 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Status Steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = steps.findIndex(s => s.id === orderStatus.status) >= index;
          const isCurrent = step.id === orderStatus.status;

          return (
            <div
              key={step.id}
              className={`flex items-center space-x-3 ${
                isActive ? 'text-white' : 'text-gray-400'
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  isActive ? 'bg-purple-500' : 'bg-white/10'
                } ${isCurrent ? 'animate-pulse' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{step.label}</p>
                {isCurrent && orderStatus.estimatedDelivery && (
                  <p className="text-sm text-gray-400">
                    Est. {orderStatus.estimatedDelivery}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Info */}
      {orderStatus.driverId && (
        <div className="glass p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="font-medium">{orderStatus.driverName}</p>
              <p className="text-sm text-gray-400">Your Delivery Partner</p>
            </div>
          </div>
        </div>
      )}

      {/* Map View */}
      {orderStatus.currentLocation && (
        <div className="h-[300px] rounded-lg overflow-hidden">
          <DeliveryMap
            driverLocation={orderStatus.currentLocation}
            orderId={orderId}
          />
        </div>
      )}
    </div>
  );
};

export default OrderTracker;
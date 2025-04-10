import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Truck, Clock } from 'lucide-react';

interface DeliveryStatus {
  status: 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered';
  driverLocation?: {
    lat: number;
    lng: number;
  };
  estimatedDeliveryTime?: string;
}

interface Props {
  orderId: string;
}

const steps = [
  { id: 'pending', label: 'Order Confirmed', icon: CheckCircle },
  { id: 'accepted', label: 'Driver Assigned', icon: Package },
  { id: 'preparing', label: 'Preparing Order', icon: Package },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const DeliveryProgress: React.FC<Props> = ({ orderId }) => {
  const [status, setStatus] = useState<DeliveryStatus>({ status: 'pending' });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_CHAT_WS_URL);
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.orderId === orderId) {
        setStatus(data.status);
        
        const currentStepIndex = steps.findIndex(step => step.id === data.status);
        setProgress((currentStepIndex / (steps.length - 1)) * 100);
      }
    };

    return () => socket.close();
  }, [orderId]);

  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-xl font-bold mb-6">Delivery Status</h3>
      
      {/* Progress Bar */}
      <div className="relative h-2 bg-white/10 rounded-full mb-8">
        <motion.div
          className="absolute h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isActive = steps.findIndex(s => s.id === status.status) >= 
                          steps.findIndex(s => s.id === step.id);
          const Icon = step.icon;
          
          return (
            <div
              key={step.id}
              className={`flex items-center space-x-3 ${
                isActive ? 'text-white' : 'text-gray-400'
              }`}
            >
              <div className={`p-2 rounded-full ${
                isActive ? 'bg-purple-500' : 'bg-white/10'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span>{step.label}</span>
              {step.id === status.status && status.estimatedDeliveryTime && (
                <span className="text-sm text-gray-400">
                  ({status.estimatedDeliveryTime})
                </span>
              )}
            </div>
          );
        })}
      </div>

      {status.status === 'out_for_delivery' && status.driverLocation && (
        <div className="mt-6">
          <p className="text-sm text-gray-400">
            Driver is {calculateDistance(status.driverLocation)} minutes away
          </p>
        </div>
      )}
    </div>
  );
};

const calculateDistance = (driverLocation: { lat: number; lng: number }) => {
  // In a real app, calculate actual distance/time using driver's location
  return '15-20';
};

export default DeliveryProgress;
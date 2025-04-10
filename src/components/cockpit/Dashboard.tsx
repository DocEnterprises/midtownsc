import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Settings, MapPin, CreditCard, Plus, CheckCircle, Coins } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import DeliveryMap from './DeliveryMap';
import OrderHistory from './OrderHistory';
import PaymentMethods from './PaymentMethods';
import LoyaltyStatus from './LoyaltyStatus';
import EventsList from './EventsList';
import ReferralCard from './ReferralCard';
import SlotMachine from '../games/SlotMachine/SlotMachine';
import AdminPanel from '../admin/AdminPanel';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [showSlots, setShowSlots] = useState(true); // Add state for slots visibility

  // Persist slots visibility in localStorage
  useEffect(() => {
    const savedShowSlots = localStorage.getItem('showSlots');
    if (savedShowSlots !== null) {
      setShowSlots(JSON.parse(savedShowSlots));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('showSlots', JSON.stringify(showSlots));
  }, [showSlots]);

  if (!user) {
    navigate('/');
    return null;
  }

  const activeOrders = user.orders?.filter(o => o.status !== 'completed') || [];
  const deliveringOrders = user.orders?.filter(o => o.status === 'delivering') || [];
  const paymentMethods = user.paymentMethods || [];
  const deliveryAddresses = user.deliveryAddresses || [];

  const handleAddPayment = () => {
    navigate('/settings');
  };

  const handleAddAddress = () => {
    navigate('/settings');
  };

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold">Welcome To The Cockpit, Captain!</h1>
              {user.isVerified && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" title="ID Verified" />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2 text-sm">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="font-medium">{user.skyBucks || 0} SkyBucks</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Award className="w-4 h-4 text-purple-400" />
                <span className="font-medium">{user.points || 0} Points</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSlots(!showSlots)}
              className="button-primary"
            >
              {showSlots ? 'Hide Slots' : 'Show Slots'}
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/10">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1 flex items-center">
                  {user.name || 'Member'}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Award className="w-4 h-4" />
                  <span>{user.membershipLevel} Member</span>
                </div>
              </div>
            </div>
            <LoyaltyStatus points={user.points || 0} level={user.membershipLevel} />
          </motion.div>

          {/* Active Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-2xl lg:col-span-2"
          >
            <h2 className="text-xl font-bold mb-4">Active Orders</h2>
            {activeOrders.length > 0 ? (
              <OrderHistory orders={activeOrders} onOrderRemoved={() => {}} />
            ) : (
              <p className="text-gray-400">No active orders</p>
            )}
          </motion.div>

          {/* Slot Machine */}
          {user.isVerified && showSlots && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <SlotMachine />
            </motion.div>
          )}

          {/* Rest of the dashboard components */}
          <ReferralCard />

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Payment Methods</h2>
              <button
                onClick={handleAddPayment}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <PaymentMethods methods={paymentMethods} onAdd={handleAddPayment} />
          </motion.div>

          {/* Delivery Addresses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Delivery Addresses</h2>
              <button
                onClick={handleAddAddress}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {deliveryAddresses.length > 0 ? (
                deliveryAddresses.map(address => (
                  <div key={address.id} className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-medium">{address.address}</p>
                      {address.isDefault && (
                        <span className="text-xs text-purple-400">Default</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No addresses saved</p>
              )}
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-6 rounded-2xl"
          >
            <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
            <EventsList userEvents={user.events || []} />
          </motion.div>

          {/* Delivery Map */}
          {deliveringOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass p-6 rounded-2xl lg:col-span-3"
            >
              <h2 className="text-xl font-bold mb-4">Active Deliveries</h2>
              <div className="h-[400px] rounded-lg overflow-hidden">
                <DeliveryMap orders={deliveringOrders} />
              </div>
            </motion.div>
          )}

          {/* Admin Panel */}
          {user.email === 'admin@skyclub.com' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-3"
            >
              <AdminPanel />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
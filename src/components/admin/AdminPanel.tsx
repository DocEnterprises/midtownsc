import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Tag, Bell, Users, Settings, Search, BarChart, Gift } from 'lucide-react';
import { useStore } from '../../store/useStore';
import ProductManager from './ProductManager';
import PromotionsManager from './PromotionsManager';
import OrdersManager from './OrdersManager';
import AnalyticsPanel from './AnalyticsPanel';
import MediaManager from './MediaManager';
import { useAdminStore } from '../../hooks/useAdminStore';
import { storage, ref } from '../../lib/firebase';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('products');
  const { user } = useStore();
  const { stats, notifications } = useAdminStore();

  useEffect(() => {
    // Initialize Firebase Storage settings
    const storageRef = ref(storage);
    // This ensures storage is properly initialized before use
  }, []);

  if (!user?.isAdmin) return null;

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'promotions', label: 'Promotions', icon: Gift },
    { id: 'orders', label: 'Orders', icon: BarChart },
    { id: 'media', label: 'Media', icon: Tag },
    { id: 'analytics', label: 'Analytics', icon: Users }
  ];

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <div className="sticky top-0 glass backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-white/10 rounded-full relative">
              <Bell className="w-5 h-5" />
              {notifications.unread > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {notifications.unread}
                </span>
              )}
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            trend={stats.productsTrend}
          />
          <QuickStatCard
            title="Active Promotions"
            value={stats.activePromotions}
            icon={Gift}
            trend={stats.promotionsTrend}
          />
          <QuickStatCard
            title="Orders (24h)"
            value={stats.dailyOrders}
            icon={BarChart}
            trend={stats.ordersTrend}
          />
          <QuickStatCard
            title="Revenue (24h)"
            value={`$${stats.dailyRevenue.toLocaleString()}`}
            icon={Users}
            trend={stats.revenueTrend}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4">
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "bg-purple-500 text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass rounded-2xl p-6">
          {activeTab === "products" && <ProductManager />}
          {activeTab === "media" && <MediaManager />}
          {activeTab === "promotions" && <PromotionsManager />}
          {activeTab === "orders" && <OrdersManager />}
          {activeTab === "analytics" && <AnalyticsPanel />}
        </div>
      </div>
    </div>
  );
};

interface QuickStatCardProps {
  title: string;
  value: string | number;
  icon: React.FC<{ className?: string }>;
  trend: number;
}

const QuickStatCard: React.FC<QuickStatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass p-6 rounded-xl"
  >
    <div className="flex items-center justify-between mb-4">
      <Icon className="w-6 h-6 text-purple-400" />
      <span className={`text-sm ${
        trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
      }`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
    </div>
    <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </motion.div>
);

export default AdminPanel;
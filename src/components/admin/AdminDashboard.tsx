import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Tag, Bell, Users, Settings, Search,
  BarChart, Gift, Clock, Calendar, Plus
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import ProductManager from './ProductManager';
import SubscriptionManager from './SubscriptionManager';
import PromotionsManager from './PromotionsManager';
import QuickActions from './QuickActions';
import AdminSearch from './AdminSearch';
import useAdminStore from '../../hooks/useAdminStore';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('products');
  const { user } = useStore();
  const { 
    stats, 
    notifications,
    markNotificationRead 
  } = useAdminStore();

  if (!user?.isAdmin) return null;

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'subscriptions', label: 'Subscriptions', icon: Clock },
    { id: 'promotions', label: 'Promotions', icon: Gift }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 glass backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <AdminSearch />
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
            title="Active Subscriptions"
            value={stats.activeSubscriptions}
            icon={Users}
            trend={stats.subscriptionsTrend}
          />
          <QuickStatCard
            title="Active Promotions"
            value={stats.activePromotions}
            icon={Tag}
            trend={stats.promotionsTrend}
          />
          <QuickStatCard
            title="Revenue (24h)"
            value={`$${stats.dailyRevenue.toLocaleString()}`}
            icon={BarChart}
            trend={stats.revenueTrend}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container mx-auto px-4 py-6">
        <QuickActions />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full flex items-center space-x-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass rounded-2xl p-6">
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'subscriptions' && <SubscriptionManager />}
          {activeTab === 'promotions' && <PromotionsManager />}
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

export default AdminDashboard;
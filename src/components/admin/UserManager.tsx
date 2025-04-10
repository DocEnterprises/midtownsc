import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Ban, CheckCircle, Search } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface UserFilter {
  status: 'all' | 'verified' | 'unverified' | 'banned';
  role: 'all' | 'admin' | 'user';
  search: string;
}

const UserManager = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<UserFilter>({
    status: 'all',
    role: 'all',
    search: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isVerified: true,
        verificationDate: new Date().toISOString()
      });
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isVerified: true } : user
      ));
      
      toast.success('User verified successfully');
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error('Failed to verify user');
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;

    try {
      await updateDoc(doc(db, 'users', userId), {
        isBanned: true,
        banDate: new Date().toISOString()
      });
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isBanned: true } : user
      ));
      
      toast.success('User banned successfully');
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isBanned: false,
        banDate: null
      });
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isBanned: false } : user
      ));
      
      toast.success('User unbanned successfully');
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Failed to unban user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(filter.search.toLowerCase()) ||
      user.name.toLowerCase().includes(filter.search.toLowerCase());

    const matchesStatus = 
      filter.status === 'all' ||
      (filter.status === 'verified' && user.isVerified) ||
      (filter.status === 'unverified' && !user.isVerified) ||
      (filter.status === 'banned' && user.isBanned);

    const matchesRole = 
      filter.role === 'all' ||
      (filter.role === 'admin' && user.isAdmin) ||
      (filter.role === 'user' && !user.isAdmin);

    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500 w-full"
            />
          </div>

          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as UserFilter['status'] }))}
            className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="banned">Banned</option>
          </select>

          <select
            value={filter.role}
            onChange={(e) => setFilter(prev => ({ ...prev, role: e.target.value as UserFilter['role'] }))}
            className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-4 rounded-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold">{user.name}</h3>
                    {user.isVerified && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    {user.isAdmin && (
                      <Shield className="w-4 h-4 text-purple-400" />
                    )}
                    {user.isBanned && (
                      <Ban className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!user.isVerified && (
                    <button
                      onClick={() => handleVerifyUser(user.id)}
                      className="p-2 hover:bg-white/10 rounded-full text-green-400"
                      title="Verify User"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  {!user.isAdmin && (
                    user.isBanned ? (
                      <button
                        onClick={() => handleUnbanUser(user.id)}
                        className="p-2 hover:bg-white/10 rounded-full text-green-400"
                        title="Unban User"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBanUser(user.id)}
                        className="p-2 hover:bg-white/10 rounded-full text-red-400"
                        title="Ban User"
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Member Level</p>
                    <p className="font-medium capitalize">{user.membershipLevel}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Points</p>
                    <p className="font-medium">{user.points}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Orders</p>
                    <p className="font-medium">{user.orders?.length || 0}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400">
          No users found matching your filters
        </div>
      )}
    </div>
  );
};

export default UserManager;
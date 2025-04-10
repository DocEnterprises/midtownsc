import React from 'react';
import { User, Shield } from 'lucide-react';

interface Props {
  onSelectUser: (userId: string) => void;
}

const ChatUserList: React.FC<Props> = ({ onSelectUser }) => {
  // In a real app, this would come from your backend
  const availableUsers = [
    { id: 'support-1', name: 'Customer Support', role: 'support' },
    { id: 'driver-1', name: 'Delivery Driver', role: 'driver' },
    { id: 'admin-1', name: 'Admin', role: 'admin' }
  ];

  return (
    <div className="p-4 space-y-2">
      {availableUsers.map(user => (
        <button
          key={user.id}
          onClick={() => onSelectUser(user.id)}
          className="w-full p-4 glass rounded-lg flex items-center space-x-3 hover:bg-white/5 transition"
        >
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <User className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-400 capitalize">{user.role}</div>
          </div>
          <Shield className="w-4 h-4 text-green-400" title="End-to-end encrypted" />
        </button>
      ))}
    </div>
  );
};

export default ChatUserList;
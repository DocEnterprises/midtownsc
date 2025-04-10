import React from 'react';
import { format } from 'date-fns';
import { Shield } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  encrypted: boolean;
}

interface Props {
  message: Message;
  isOwnMessage: boolean;
}

const ChatMessage: React.FC<Props> = ({ message, isOwnMessage }) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isOwnMessage ? 'bg-purple-500' : 'bg-white/10'
        }`}
      >
        <p>{message.content}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-gray-300">
            {format(message.timestamp, 'HH:mm')}
          </span>
          {message.encrypted && (
            <Shield className="w-3 h-3 text-green-400" title="End-to-end encrypted" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
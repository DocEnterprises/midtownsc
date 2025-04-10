import React, { createContext, useContext, useEffect, useState } from 'react';
import { chatService, ChatMessage } from '../../lib/chat/ChatService';
import { useStore } from '../../store/useStore';

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string, sessionId: string) => Promise<void>;
  status: string;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<string>('disconnected');
  const { user } = useStore();

  useEffect(() => {
    if (!user) return;

    const userType = user.email === 'admin@skyclub.com' ? 'admin' : 'visitor';
    chatService.connect(user.id, userType);
    chatService.requestNotificationPermission();

    const messageUnsubscribe = chatService.onMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    const statusUnsubscribe = chatService.onStatusChange(setStatus);

    return () => {
      messageUnsubscribe();
      statusUnsubscribe();
      chatService.disconnect();
    };
  }, [user]);

  const value = {
    messages,
    sendMessage: chatService.sendMessage,
    status
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
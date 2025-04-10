import { io, Socket } from 'socket.io-client';
import { MessageEncryption } from '../crypto/MessageEncryption';

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'system';
  encrypted?: boolean;
  read?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  userType: 'visitor' | 'support' | 'admin';
  messages: ChatMessage[];
  active: boolean;
  lastActivity: number;
}

class ChatService {
  private socket: Socket | null = null;
  private sessionKey: string | null = null;
  private messageHandlers: Set<(message: ChatMessage) => void> = new Set();
  private statusHandlers: Set<(status: string) => void> = new Set();

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  connect(userId: string, userType: 'visitor' | 'support' | 'admin') {
    if (this.socket) return;

    this.socket = io('wss://chat.skyclub.com', {
      auth: {
        userId,
        userType
      },
      transports: ['websocket']
    });

    this.sessionKey = crypto.randomUUID();

    this.socket.on('connect', () => {
      this.notifyStatusChange('connected');
    });

    this.socket.on('disconnect', () => {
      this.notifyStatusChange('disconnected');
    });

    this.socket.on('message', async (encryptedMessage: string, key: string) => {
      try {
        const decrypted = await MessageEncryption.decrypt(encryptedMessage, key);
        const message = JSON.parse(decrypted) as ChatMessage;
        this.notifyMessageReceived(message);
      } catch (error) {
        console.error('Failed to decrypt message:', error);
      }
    });

    this.socket.on('typing', (userId: string) => {
      this.notifyStatusChange(`${userId} is typing...`);
    });

    // Handle push notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      this.socket.on('notification', ({ title, body }) => {
        new Notification(title, { body });
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async sendMessage(content: string, sessionId: string) {
    if (!this.socket || !this.sessionKey) return;

    try {
      const message = {
        id: crypto.randomUUID(),
        content,
        timestamp: Date.now(),
        sessionId,
        type: 'text' as const
      };

      const { encrypted, key } = await MessageEncryption.encrypt(
        JSON.stringify(message),
        this.sessionKey
      );

      this.socket.emit('message', encrypted, key, sessionId);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  onMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatusChange(handler: (status: string) => void) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  private notifyMessageReceived(message: ChatMessage) {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyStatusChange(status: string) {
    this.statusHandlers.forEach(handler => handler(status));
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }
}

export const chatService = new ChatService();
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  X,
  Phone,
  Video,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import { MessageEncryption } from "../../lib/crypto/MessageEncryption";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: "text" | "system";
  encrypted?: boolean;
}

const SecureChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionKey] = useState(() => uuidv4());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      addSystemMessage("Secure chat initialized with end-to-end encryption");
    }
  }, [isOpen]);

  const addSystemMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${uuidv4()}`,
        senderId: "system",
        content,
        timestamp: Date.now(),
        type: "system",
      },
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    try {
      const { encrypted, key } = await MessageEncryption.encrypt(
        message,
        sessionKey
      );
      const decrypted = await MessageEncryption.decrypt(encrypted, key);

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${uuidv4()}`,
          senderId: user.id,
          content: decrypted,
          timestamp: Date.now(),
          type: "text",
          encrypted: true,
        },
      ]);

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      addSystemMessage("Error sending message. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  const chatWidth = isMobile ? "w-full" : "w-96";
  const chatHeight = isMobile
    ? "h-[100dvh]"
    : isMinimized
    ? "h-14"
    : "h-[400px]";
  const chatPosition = isMobile ? "inset-0" : "bottom-6 right-6";

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-purple-500 text-white shadow-lg hover:bg-purple-600 transition-colors z-40"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${chatPosition} ${chatWidth} glass rounded-2xl shadow-xl overflow-hidden z-50 ${chatHeight}`}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="font-medium">Support Chat</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-white/10 rounded-full">
                  <Phone className="w-4 h-4" />
                </button>
                {!isMobile && (
                  <>
                    {!isMinimized ? (
                      <button
                        className="p-2 hover:bg-white/10 rounded-full"
                        onClick={() => setIsMinimized(true)}
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        className="p-2 hover:bg-white/10 rounded-full"
                        onClick={() => setIsMinimized(false)}
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
                <button
                  className="p-2 hover:bg-white/10 rounded-full"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-8rem)]">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderId === user.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.type === "system"
                            ? "bg-gray-500/20 text-gray-300 text-sm text-center w-full"
                            : msg.senderId === user.id
                            ? "bg-purple-500"
                            : "bg-white/10"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div className="flex items-center justify-end space-x-2 mt-1">
                          <span className="text-xs text-gray-300">
                            {format(msg.timestamp, "HH:mm")}
                          </span>
                          {msg.encrypted && (
                            <span className="text-xs text-green-400">•</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={1}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!message.trim()}
                      className="p-2 rounded-full bg-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SecureChat;

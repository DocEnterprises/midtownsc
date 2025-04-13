import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MessageSquare, MinusCircle, X } from "lucide-react";
import { useChat } from "./ChatProvider";
import { useStore } from "../../store/useStore";

const AdminChat = () => {
  const [activeChats, setActiveChats] = useState<string[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const { messages, sendMessage, status } = useChat();
  const { user } = useStore();

  if (!user || user.email !== "admin@skyclub.com") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`z-20 fixed bottom-6 right-24 glass rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
          isMinimized ? "w-64 h-14" : "w-96 h-[400px]"
        }`}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <h2 className="font-medium">Active Chats</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === "connected" ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <span className="text-sm">{activeChats.length} active</span>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded-full"
              >
                {isMinimized ? (
                  <MessageSquare className="w-4 h-4" />
                ) : (
                  <MinusCircle className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <div className="h-[calc(100%-4rem)] flex">
            {/* Chat list */}
            <div className="w-1/3 border-r border-white/10 overflow-y-auto">
              {activeChats.map((chatId) => (
                <button
                  key={chatId}
                  onClick={() => setSelectedChat(chatId)}
                  className={`w-full p-4 text-left hover:bg-white/5 ${
                    selectedChat === chatId ? "bg-white/10" : ""
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Chat {chatId}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Chat window */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  <div className="flex-1 overflow-y-auto p-4">
                    {messages
                      .filter((m) => m.sessionId === selectedChat)
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`mb-2 ${
                            message.senderId === user.id
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          <div
                            className={`inline-block p-2 rounded-lg ${
                              message.senderId === user.id
                                ? "bg-purple-500"
                                : "bg-white/10"
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                  </div>
                  <ChatInput
                    onSend={(content) => sendMessage(content, selectedChat)}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Select a chat to start messaging
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const ChatInput: React.FC<{
  onSend: (content: string) => void;
}> = ({ onSend }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500"
        placeholder="Type a message..."
      />
    </form>
  );
};

export default AdminChat;

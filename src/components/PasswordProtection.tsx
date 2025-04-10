import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield } from 'lucide-react';

interface Props {
  onVerify: () => void;
}

const PasswordProtection: React.FC<Props> = ({ onVerify }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    // Simple direct comparison for the demo
    if (password === 'iykyk') {
      onVerify();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
    
    setIsVerifying(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass p-8 rounded-2xl max-w-md w-full text-center"
      >
        <Lock className="w-16 h-16 mx-auto mb-6 text-purple-500" />
        <h2 className="text-2xl font-bold mb-4">Private Access Only</h2>
        <p className="mb-8 text-gray-300">
          Please enter the password to access Skyclub Members.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 rounded-lg border ${
                error ? 'border-red-500' : 'border-white/20'
              } focus:outline-none focus:border-purple-500 transition-colors`}
              placeholder="Enter password"
              autoFocus
              disabled={isVerifying}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute text-sm text-red-500 mt-1"
              >
                Incorrect password
              </motion.p>
            )}
          </div>
          <button
            type="submit"
            className="button-primary w-full"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Verifying...
              </div>
            ) : (
              'Enter'
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center text-sm text-gray-400">
          <Shield className="w-4 h-4 mr-2" />
          <span>Secure, encrypted connection</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PasswordProtection;
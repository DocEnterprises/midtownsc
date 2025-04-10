import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Chrome } from 'lucide-react';
import { useStore } from '../../store/useStore';
import useAuth from '../../hooks/useAuth';
import IDVerification from './IDVerification';
import { setupDummyAccounts } from '../../utils/setupDummyAccounts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'signin' | 'signup' | 'verify';
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose, initialView = 'signin' }) => {
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Ensure demo accounts exist
      await setupDummyAccounts();

      if (view === 'signin') {
        await signIn(email, password);
        onClose();
      } else if (view === 'signup') {
        await signUp(email, password);
        setView('verify');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Sign In failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass p-6 rounded-2xl max-w-md w-full relative"
          >
            {!isLoading && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {view === 'signin' ? (
              <div>
                <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
                  <button 
                    type="submit" 
                    className="w-full button-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg flex items-center justify-center space-x-2 hover:bg-white/5 transition"
                    disabled={isLoading}
                  >
                    <Chrome className="w-5 h-5" />
                    <span>Sign in with Google</span>
                  </button>
                </form>
                <p className="mt-4 text-center text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setView('signup')}
                    className="text-purple-400 hover:text-purple-300"
                    disabled={isLoading}
                  >
                    Sign Up
                  </button>
                </p>

                {/* Demo Account Info */}
                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                  <p className="text-sm font-medium mb-2">Demo Accounts:</p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>Admin: admin@skyclub.com / admin123</p>
                    <p>Customer: customer@skyclub.com / customer123</p>
                    <p>Driver: driver@skyclub.com / driver123</p>
                  </div>
                </div>
              </div>
            ) : view === 'signup' ? (
              <div>
                <h2 className="text-2xl font-bold mb-6">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
                  <button 
                    type="submit" 
                    className="w-full button-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Continue to Verification'}
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full px-4 py-2 border border-white/20 rounded-lg flex items-center justify-center space-x-2 hover:bg-white/5 transition"
                    disabled={isLoading}
                  >
                    <Chrome className="w-5 h-5" />
                    <span>Sign up with Google</span>
                  </button>
                </form>
                <p className="mt-4 text-center text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => setView('signin')}
                    className="text-purple-400 hover:text-purple-300"
                    disabled={isLoading}
                  >
                    Sign In
                  </button>
                </p>
              </div>
            ) : (
              <IDVerification onVerified={onClose} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
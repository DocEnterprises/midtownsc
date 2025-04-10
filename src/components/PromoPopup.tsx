import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Percent, Mail } from 'lucide-react';
import { useStore } from '../store/useStore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const PromoPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { openAuthModal } = useStore();

  useEffect(() => {
    // Show popup after 30 seconds if user hasn't seen it before
    const timer = setTimeout(() => {
      const hasSeenPromo = localStorage.getItem('hasSeenPromo');
      if (!hasSeenPromo) {
        setIsVisible(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Save promo signup to Firestore
      await setDoc(doc(db, 'promoSignups', email), {
        email,
        timestamp: new Date().toISOString()
      });

      localStorage.setItem('hasSeenPromo', 'true');
      localStorage.setItem('promoEmail', email);
      setIsSubmitted(true);
      
      setTimeout(() => {
        setIsVisible(false);
        openAuthModal('signup');
      }, 2000);
    } catch (error) {
      console.error('Error saving promo signup:', error);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitted) setIsVisible(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass p-8 rounded-2xl max-w-md w-full relative overflow-hidden"
          >
            {!isSubmitted && (
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="text-center">
              <Gift className="w-16 h-16 mx-auto mb-6 text-purple-400" />
              
              {isSubmitted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
                  <p className="text-gray-300">
                    Your exclusive discounts are being prepared. Creating your account...
                  </p>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4">Welcome to Skyclub!</h2>
                  <p className="text-gray-300 mb-6">
                    Enter your email to unlock exclusive discounts
                  </p>

                  <div className="glass p-6 rounded-lg mb-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Percent className="w-6 h-6 text-purple-400" />
                        </div>
                        <p className="font-bold text-xl">20%</p>
                        <p className="text-sm text-gray-400">First Order</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Percent className="w-6 h-6 text-blue-400" />
                        </div>
                        <p className="font-bold text-xl">10%</p>
                        <p className="text-sm text-gray-400">Second Order</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Percent className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="font-bold text-xl">5%</p>
                        <p className="text-sm text-gray-400">Third Order</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500 focus:ring focus:ring-purple-500/20"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="button-primary w-full py-3"
                    >
                      Claim Your Discount
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromoPopup;
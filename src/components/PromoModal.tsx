import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Mail } from 'lucide-react';
import { useStore } from '../store/useStore';

const PromoModal = () => {
  const { isPromoModalOpen, setPromoModalOpen, promoEmail, setPromoEmail } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setPromoModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isPromoModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPromoModalOpen(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass p-8 rounded-2xl max-w-md w-full relative"
          >
            <button
              onClick={() => setPromoModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <Gift className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Exclusive Member Discounts</h2>
              <p className="text-gray-300">Join now and unlock amazing discounts!</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="glass p-4 rounded-lg">
                <h3 className="font-bold text-purple-400">First Purchase</h3>
                <p className="text-2xl font-bold">20% OFF</p>
              </div>
              
              <div className="glass p-4 rounded-lg">
                <h3 className="font-bold text-blue-400">Second Purchase</h3>
                <p className="text-2xl font-bold">10% OFF</p>
              </div>
              
              <div className="glass p-4 rounded-lg">
                <h3 className="font-bold text-green-400">Third Purchase</h3>
                <p className="text-2xl font-bold">5% OFF</p>
              </div>

              <div className="glass p-4 rounded-lg">
                <h3 className="font-bold text-yellow-400">Referral Bonus</h3>
                <p className="text-lg">Both you and your friend get 10% off!</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={promoEmail}
                  onChange={(e) => setPromoEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Subscribing...
                  </div>
                ) : (
                  'Get My Discount'
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromoModal;
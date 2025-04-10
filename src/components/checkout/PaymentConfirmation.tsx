import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { triggerPurchaseConfetti } from '../../utils/confetti';

const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const { clearCart } = useStore();

  useEffect(() => {
    triggerPurchaseConfetti();
    clearCart();

    const timer = setTimeout(() => {
      navigate('/cockpit');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass p-8 rounded-2xl max-w-md w-full text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
        <p className="text-gray-300 mb-6">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        <p className="text-sm text-gray-400">
          Redirecting to your cockpit...
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentConfirmation;
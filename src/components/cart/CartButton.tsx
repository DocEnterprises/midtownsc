import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const CartButton = () => {
  const { cart, toggleCart } = useStore();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button
      onClick={toggleCart}
      className="p-2 rounded-full hover:bg-white/10 relative"
    >
      <ShoppingBag className="w-5 h-5" />
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
          >
            {itemCount}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default CartButton;
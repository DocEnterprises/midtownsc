import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Coins } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SKYBUCKS_PACKAGES = [
  { amount: 5, price: 2.50 },
  { amount: 10, price: 5.00 },
  { amount: 15, price: 7.50 },
  { amount: 20, price: 10.00 },
  { amount: 50, price: 25.00 },
  { amount: 100, price: 50.00 },
  { amount: 420, price: 210.00 }
];

const BuyCreditsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const { user, addToCart } = useStore();

  const handleAddToCart = () => {
    if (!selectedAmount) {
      toast.error('Please select an amount');
      return;
    }

    const package_ = SKYBUCKS_PACKAGES.find(p => p.amount === selectedAmount);
    if (!package_) return;

    addToCart({
      id: `skybucks-${selectedAmount}`,
      name: `${selectedAmount} SkyBucks`,
      price: package_.price,
      image: '/assets/symbols/gold-coin.svg'
    });

    toast.success(`${selectedAmount} SkyBucks added to cart`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[100]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg glass rounded-2xl p-6 m-4 max-h-[90vh] overflow-y-auto z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Buy SkyBucks</h2>
              <p className="text-gray-400">Select an amount to purchase</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {SKYBUCKS_PACKAGES.map(({ amount, price }) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`p-4 rounded-lg flex flex-col items-center justify-center transition-colors ${
                    selectedAmount === amount
                      ? 'bg-purple-500'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <Coins className="w-5 h-5 mr-1 text-yellow-400" />
                    <span className="font-bold">{amount}</span>
                  </div>
                  <span className="text-sm text-gray-400">${price.toFixed(2)}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedAmount}
              className="w-full button-primary sticky bottom-0"
            >
              Add to Cart
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BuyCreditsModal;
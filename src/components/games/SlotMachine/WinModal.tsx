import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from 'lucide-react';
import { Prize } from './types';
import { triggerConfetti } from '../../../utils/confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prize: Prize | null;
}

const WinModal: React.FC<Props> = ({ isOpen, onClose, prize }) => {
  React.useEffect(() => {
    if (isOpen && prize) {
      triggerConfetti();
    }
  }, [isOpen, prize]);

  if (!prize) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass p-8 rounded-2xl max-w-md w-full text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <Gift className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
            <p className="text-xl mb-6">
              You won: <span className="text-purple-400">{prize.reward}</span>
            </p>
            <div className="flex justify-center space-x-4 mb-6">
              {prize.symbols.map((symbol, index) => (
                <img
                  key={index}
                  src={symbol.image}
                  alt={symbol.name}
                  className="w-12 h-12 object-contain"
                />
              ))}
            </div>
            <button onClick={onClose} className="button-primary">
              Claim Prize
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WinModal;
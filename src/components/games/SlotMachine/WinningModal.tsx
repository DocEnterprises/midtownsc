import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { PRIZES } from './constants';
import { triggerConfetti } from '../../../utils/confetti';
import useClickOutside from '../../../hooks/useClickOutside';

interface Props {
  prize: typeof PRIZES[0] | null;
  onClose: () => void;
}

const WinningModal: React.FC<Props> = ({ prize, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose);

  React.useEffect(() => {
    if (prize) {
      triggerConfetti();
    }
  }, [prize]);

  return (
    <AnimatePresence>
      {prize && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 bg-black/90 backdrop-blur-sm">
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass p-6 rounded-2xl max-w-md w-full text-center relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-xl mb-4">You won: {prize.reward}</p>
            <p className="text-sm text-gray-400">
              Your prize has been added to your rewards.
              You can redeem it during checkout.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WinningModal;
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  symbol: {
    id: string;
    name: string;
    image: string;
  };
  isSpinning: boolean;
  delay: number;
}

const SlotReel: React.FC<Props> = ({ symbol, isSpinning, delay }) => {
  return (
    <div className="relative w-20 h-20 bg-gradient-to-b from-yellow-500/10 to-yellow-500/5 rounded-lg overflow-hidden shadow-lg border border-yellow-500/20">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={isSpinning ? {
          y: [-400, 400],
          transition: {
            duration: 0.5,
            repeat: 4,
            ease: "linear",
            delay
          }
        } : {}}
      >
        <img
          src={symbol.image}
          alt={symbol.name}
          className="w-16 h-16 object-contain filter drop-shadow-lg"
        />
      </motion.div>
      
      {/* Reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
      
      {/* Spinning overlay */}
      {isSpinning && (
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-transparent to-yellow-500/10 animate-pulse" />
      )}
    </div>
  );
};

export default SlotReel;
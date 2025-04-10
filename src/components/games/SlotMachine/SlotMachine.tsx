import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, AlertCircle } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import BuyCreditsModal from './BuyCreditsModal';
import SlotReel from './SlotReel';
import WinningModal from './WinningModal';
import { SYMBOLS, PRIZES } from './constants';

const SlotMachine: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<number[]>(Array(6).fill(0));
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [winningPrize, setWinningPrize] = useState<typeof PRIZES[0] | null>(null);
  const { user, setUser } = useStore();

  // Persist reels state in localStorage
  useEffect(() => {
    const savedReels = localStorage.getItem('slotReels');
    if (savedReels) {
      setReels(JSON.parse(savedReels));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('slotReels', JSON.stringify(reels));
  }, [reels]);

  const handleSpin = () => {
    if (!user || user.skyBucks < 1) {
      setShowBuyCredits(true);
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setUser({ ...user, skyBucks: user.skyBucks - 1 });

    // Generate random result based on prize odds
    const random = Math.random();
    let cumulativeOdds = 0;
    let selectedPrize = null;

    for (const prize of PRIZES) {
      cumulativeOdds += prize.odds;
      if (random <= cumulativeOdds) {
        selectedPrize = prize;
        break;
      }
    }

    // Generate reel positions
    const newReels = selectedPrize
      ? selectedPrize.symbols.map(() => SYMBOLS.indexOf(selectedPrize.symbols[0]))
      : Array(6).fill(0).map(() => Math.floor(Math.random() * SYMBOLS.length));

    setReels(newReels);

    setTimeout(() => {
      setIsSpinning(false);
      if (selectedPrize) {
        setWinningPrize(selectedPrize);
        setUser(prev => ({
          ...prev!,
          rewards: [...(prev?.rewards || []), selectedPrize]
        }));
      }
    }, 3000);
  };

  return (
    <div className="glass p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">SkyHigh Slots</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">{user?.skyBucks || 0} SkyBucks</span>
          </div>
          <button
            onClick={() => setShowBuyCredits(true)}
            className="button-primary"
          >
            Buy SkyBucks
          </button>
        </div>
      </div>

      <div className="relative bg-black/30 p-6 rounded-xl border border-yellow-500/20 shadow-inner">
        {/* Casino-style light decorations */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-yellow-500/20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `twinkle ${1 + Math.random() * 2}s infinite`
              }}
            />
          ))}
        </div>

        {/* Slot machine display */}
        <div className="relative z-10">
          <div className="flex justify-center space-x-2 mb-6 bg-black/50 p-4 rounded-lg shadow-inner">
            {reels.map((position, index) => (
              <SlotReel
                key={index}
                symbol={SYMBOLS[position]}
                isSpinning={isSpinning}
                delay={index * 0.2}
              />
            ))}
          </div>

          {(!user?.skyBucks || user.skyBucks < 1) && (
            <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>Insufficient SkyBucks balance</span>
            </div>
          )}

          <button
            onClick={handleSpin}
            disabled={isSpinning || !user || user.skyBucks < 1}
            className={`button-primary w-full ${
              isSpinning ? 'animate-pulse' : ''
            }`}
          >
            {isSpinning ? 'Spinning...' : 'Spin (1 SkyBuck)'}
          </button>
        </div>
      </div>

      <BuyCreditsModal
        isOpen={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
      />

      <WinningModal
        prize={winningPrize}
        onClose={() => setWinningPrize(null)}
      />
    </div>
  );
};

export default SlotMachine;
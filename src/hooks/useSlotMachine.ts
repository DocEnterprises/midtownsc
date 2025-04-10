import { useState, useCallback } from 'react';
import { Symbol, Prize, SpinResult } from '../components/games/SlotMachine/types';
import { SYMBOLS, PRIZES } from '../components/games/SlotMachine/constants';
import { useStore } from '../store/useStore';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useSlotMachine = () => {
  const [reels, setReels] = useState<Symbol[]>([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<Prize | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const { user, setUser } = useStore();

  const skyBucksBalance = user?.skyBucks || 0;

  const generateSpinResult = useCallback((): SpinResult => {
    // Check for wins based on odds
    const randomNum = Math.random();
    let currentProbability = 0;
    
    for (const prize of PRIZES) {
      currentProbability += prize.odds;
      if (randomNum <= currentProbability) {
        return {
          symbols: prize.symbols,
          prize
        };
      }
    }

    // No win - generate random symbols
    return {
      symbols: Array(3).fill(null).map(() => 
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ),
      prize: null
    };
  }, []);

  const updateSkyBucks = async (amount: number) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        skyBucks: increment(amount)
      });

      setUser(prev => prev ? {
        ...prev,
        skyBucks: (prev.skyBucks || 0) + amount
      } : null);
    } catch (error) {
      console.error('Error updating SkyBucks:', error);
    }
  };

  const spin = async () => {
    if (isSpinning || !user || skyBucksBalance < 1) return;

    setIsSpinning(true);
    await updateSkyBucks(-1); // Deduct 1 SkyBuck

    // Simulate spinning animation
    setTimeout(() => {
      const result = generateSpinResult();
      setReels(result.symbols);
      
      if (result.prize) {
        setLastWin(result.prize);
        setShowWinModal(true);
      }
      
      setIsSpinning(false);
    }, 2000);
  };

  return {
    reels,
    isSpinning,
    lastWin,
    skyBucksBalance,
    showWinModal,
    setShowWinModal,
    spin,
    updateSkyBucks
  };
};

export default useSlotMachine;
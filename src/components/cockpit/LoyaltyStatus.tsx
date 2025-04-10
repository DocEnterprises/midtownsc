import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

interface Props {
  points: number;
  level: 'economy' | 'premium economy' | 'business' | 'first class';
}

const LEVEL_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 10000
};

const LEVEL_COLORS = {
  bronze: 'from-orange-700 to-orange-500',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-600 to-yellow-400',
  platinum: 'from-purple-600 to-purple-400'
};

const LoyaltyStatus: React.FC<Props> = ({ points, level }) => {
  const nextLevel = Object.entries(LEVEL_THRESHOLDS).find(
    ([key, threshold]) => points < threshold
  )?.[0];

  const progress = nextLevel
    ? (points - LEVEL_THRESHOLDS[level]) /
      (LEVEL_THRESHOLDS[nextLevel as keyof typeof LEVEL_THRESHOLDS] -
        LEVEL_THRESHOLDS[level])
    : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Award className={`w-5 h-5 text-${level}`} />
          <span className="font-medium capitalize">{level}</span>
        </div>
        <span>{points} points</span>
      </div>

      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          className={`absolute h-full bg-gradient-to-r ${LEVEL_COLORS[level]}`}
        />
      </div>

      {nextLevel && (
        <p className="text-sm text-gray-400">
          {LEVEL_THRESHOLDS[nextLevel as keyof typeof LEVEL_THRESHOLDS] - points}{' '}
          points until {nextLevel}
        </p>
      )}
    </div>
  );
};

export default LoyaltyStatus;
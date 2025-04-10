import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface Props {
  onVerify: (verified: boolean) => void;
}

const AgeVerification: React.FC<Props> = ({ onVerify }) => {
  const [showMedical, setShowMedical] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass p-8 rounded-2xl max-w-md w-full text-center"
      >
        <Shield className="w-16 h-16 mx-auto mb-6 text-purple-500" />
        <h2 className="text-2xl font-bold mb-4 text-white">Age Verification Required</h2>
        <p className="mb-8 text-gray-300">
          You must be 21 years or older to enter Skyclub Members.
        </p>

        {!showMedical ? (
          <div className="space-y-4">
            <button
              onClick={() => onVerify(true)}
              className="button-primary w-full"
            >
              I am 21 or older
            </button>
            <button
              onClick={() => setShowMedical(true)}
              className="w-full px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition"
            >
              I am under 21 with medical card
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              className="w-full p-2 rounded-lg bg-white/10 border border-white/20"
            />
            <button
              onClick={() => onVerify(true)}
              className="button-primary w-full"
            >
              Submit Medical Card
            </button>
            <button
              onClick={() => setShowMedical(false)}
              className="text-sm text-gray-400 hover:text-white"
            >
              Back
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AgeVerification;
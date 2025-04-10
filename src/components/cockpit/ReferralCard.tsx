import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { doc, updateDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

const ReferralCard = () => {
  const { user, setUser } = useStore();
  const [copied, setCopied] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const [isSettingKeyword, setIsSettingKeyword] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  if (!user) return null;

  const referralLink = `https://skyclub.com/join?ref=${user.referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Referral link copied!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy referral link');
    }
  };

  const checkKeywordAvailability = async (keyword: string): Promise<boolean> => {
    try {
      const keywordQuery = query(
        collection(db, 'users'),
        where('customReferralKeyword', '==', keyword)
      );
      const snapshot = await getDocs(keywordQuery);
      return snapshot.empty;
    } catch (error) {
      console.error('Error checking keyword availability:', error);
      return false;
    }
  };

  const validateKeyword = async (keyword: string): Promise<string> => {
    if (keyword.length < 3) return 'Keyword must be at least 3 characters';
    if (keyword.length > 20) return 'Keyword must be less than 20 characters';
    if (!/^[a-zA-Z0-9-]+$/.test(keyword)) return 'Only letters, numbers, and hyphens are allowed';
    
    setIsChecking(true);
    const isAvailable = await checkKeywordAvailability(keyword);
    setIsChecking(false);
    
    if (!isAvailable) return 'This keyword is already taken';
    return '';
  };

  const handleSetKeyword = async () => {
    const validationError = await validateKeyword(keyword);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        customReferralKeyword: keyword,
        referralCode: keyword
      });

      setUser({
        ...user,
        customReferralKeyword: keyword,
        referralCode: keyword
      });

      setIsSettingKeyword(false);
      setError('');
      toast.success('Custom referral keyword set successfully!');
    } catch (err) {
      console.error('Error setting keyword:', err);
      setError('Failed to set keyword. Please try again.');
      toast.error('Failed to set custom keyword');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 rounded-2xl"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Share2 className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold">Refer & Earn</h2>
      </div>

      <p className="text-gray-300 mb-4">
        Share your referral link with friends and both get 10% off your next purchase!
      </p>

      {!user.customReferralKeyword && !isSettingKeyword ? (
        <div className="mb-4">
          <button
            onClick={() => setIsSettingKeyword(true)}
            className="button-primary w-full"
          >
            Set Custom Referral Keyword
          </button>
        </div>
      ) : isSettingKeyword ? (
        <div className="space-y-4 mb-4">
          <div>
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setError('');
              }}
              placeholder="Enter your custom keyword"
              className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
              disabled={isChecking}
              required
            />
            {error && (
              <div className="flex items-center space-x-1 mt-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSetKeyword}
              disabled={isChecking}
              className="button-primary flex-1"
            >
              {isChecking ? 'Checking...' : 'Set Keyword'}
            </button>
            <button
              onClick={() => {
                setIsSettingKeyword(false);
                setError('');
                setKeyword('');
              }}
              disabled={isChecking}
              className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="w-full pr-10 pl-4 py-2 bg-white/10 rounded-lg border border-white/20"
        />
        <button
          onClick={handleCopy}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          {copied ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        Your referral code: <span className="font-mono">{user.referralCode}</span>
      </div>
    </motion.div>
  );
};

export default ReferralCard;
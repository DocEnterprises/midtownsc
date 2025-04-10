import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import AddressSearchInput from '../address/AddressSearchInput';
import AddressMap from '../address/AddressMap';
import { AddressResult } from '../address/types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AddDeliveryAddress: React.FC<Props> = ({ isOpen, onClose }) => {
  const [address, setAddress] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);
  const { user, setUser } = useStore();

  const handleAddressSelect = (result: AddressResult) => {
    setSelectedAddress(result);
    setAddress(result.place_name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedAddress) return;

    try {
      const newAddress = {
        id: `addr-${Date.now()}`,
        address: selectedAddress.place_name,
        coordinates: selectedAddress.center,
        isDefault: user.deliveryAddresses.length === 0,
        createdAt: new Date().toISOString()
      };

      setUser({
        ...user,
        deliveryAddresses: [...user.deliveryAddresses, newAddress]
      });

      toast.success('Delivery address added successfully');
      handleClose();
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address. Please try again.');
    }
  };

  const handleClose = () => {
    setAddress('');
    setSelectedAddress(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass p-6 rounded-2xl max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add Delivery Address</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AddressSearchInput
                value={address}
                onChange={setAddress}
                onAddressSelect={handleAddressSelect}
              />

              {selectedAddress && <AddressMap address={selectedAddress} />}

              <button 
                type="submit" 
                className="w-full button-primary"
                disabled={!selectedAddress}
              >
                {selectedAddress ? (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm Address
                  </div>
                ) : (
                  'Add Address'
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddDeliveryAddress;
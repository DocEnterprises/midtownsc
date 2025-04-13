import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, CreditCard, MapPin, User, Shield, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import AddPaymentMethod from './AddPaymentMethod';
import AddDeliveryAddress from './AddDeliveryAddress';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

const Settings = () => {
  const { user, setUser } = useStore();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  if (!user) {
    navigate('/');
    return null;
  }

  // Ensure we have default values for optional properties
  const paymentMethods = user.paymentMethods || [];
  const deliveryAddresses = user.deliveryAddresses || [];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);

      // Compress image before upload
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 400,
        useWebWorker: true
      });

      // Create a reference to the profile image in Firebase Storage
      const storageRef = ref(storage, `profile-images/${user.id}`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      uploadTask.on('state_changed',
        (snapshot) => {
          // Handle progress if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload profile image');
          setIsUploading(false);
        },
        async () => {
          try {
            // Get the download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Update user document in Firestore
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
              profileImage: downloadURL
            });

            // Update local state
            setUser({
              ...user,
              profileImage: downloadURL
            });

            toast.success('Profile image updated successfully');
          } catch (error) {
            console.error('Error getting download URL:', error);
            toast.error('Failed to update profile image');
          } finally {
            setIsUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error handling image upload:', error);
      toast.error('Failed to process image');
      setIsUploading(false);
    }
  };

  const handleAddPayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handleAddAddress = () => {
    setIsAddressModalOpen(true);
  };

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/cockpit')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl"
          >
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
              <div>
                <h3 className="font-bold">{user.name}</h3>
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>
          </motion.div>

          {/* Rest of the settings components remain unchanged */}
          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Payment Methods</h2>
              <button
                onClick={handleAddPayment}
                className="button-primary"
              >
                <CreditCard className="w-4 h-4 mr-2 inline" />
                Add Payment Method
              </button>
            </div>
            {paymentMethods.length > 0 ? (
              paymentMethods.map(method => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg mb-2"
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-medium">•••• {method.last4}</p>
                      <p className="text-sm text-gray-400">{method.type}</p>
                    </div>
                  </div>
                  {method.isDefault && (
                    <span className="text-sm text-purple-400">Default</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">No payment methods added</p>
            )}
          </motion.div>

          {/* Delivery Addresses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Delivery Addresses</h2>
              <button
                onClick={handleAddAddress}
                className="button-primary"
              >
                <MapPin className="w-4 h-4 mr-2 inline" />
                Add Address
              </button>
            </div>
            {deliveryAddresses.length > 0 ? (
              deliveryAddresses.map(address => (
                <div
                  key={address.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg mb-2"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-medium">{address.address}</p>
                      {address.isDefault && (
                        <span className="text-sm text-purple-400">Default</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No delivery addresses added</p>
            )}
          </motion.div>
        </div>

        <AddPaymentMethod
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        />
        
        <AddDeliveryAddress
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Settings;
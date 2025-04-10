import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Award, Edit2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { triggerConfetti } from '../../utils/confetti';
import ProductForm from '../admin/ProductForm';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface Props {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailsModal: React.FC<Props> = ({ product, isOpen, onClose }) => {
  const { addToCart, user } = useStore();
  const [showEditForm, setShowEditForm] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
    triggerConfetti();
  };

  const isAdmin = user?.email === 'admin@skyclub.com';

  const handleEditSubmit = async (updatedProduct: any) => {
    try {
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, updatedProduct);
      toast.success('Product updated successfully');
      setShowEditForm(false);
      // Refresh the product data
      window.location.reload();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              {isAdmin && (
                <button
                  onClick={() => setShowEditForm(true)}
                  className="p-2 hover:bg-white/10 rounded-full"
                  title="Edit Product"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="aspect-video rounded-lg overflow-hidden mb-6">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <p className="text-gray-300 mb-6">{product.description}</p>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Category</span>
                      <span>{product.category}</span>
                    </div>
                    {product.thc && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">THC</span>
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 text-purple-400 mr-1" />
                          <span>{product.thc}</span>
                        </div>
                      </div>
                    )}
                    {product.cbd && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">CBD</span>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 text-blue-400 mr-1" />
                          <span>{product.cbd}</span>
                        </div>
                      </div>
                    )}
                    {product.strain && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Strain</span>
                        <span className="capitalize">{product.strain}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Effects</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.effects?.map((effect: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm"
                      >
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div>
                  <span className="text-gray-400">Price</span>
                  <p className="text-2xl font-bold">${product.price}</p>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="button-primary"
                  disabled={!product.isAvailable || product.stock === 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showEditForm && (
        <ProductForm
          product={product}
          onClose={() => setShowEditForm(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </AnimatePresence>
  );
};

export default ProductDetailsModal;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Minus } from 'lucide-react';

// Import categories from Products component to maintain consistency
const CATEGORIES = [
  'Flower',
  'Vapes', 
  'Edibles',
  'Pre-Rolls',
  'Concentrates',
  'Tinctures',
  'Topicals'
];

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  thc?: string;
  cbd?: string;
  strain?: 'indica' | 'sativa' | 'hybrid';
  effects: string[];
  isAvailable: boolean;
}

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
  onSubmit: (product: Product) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Product>(product || {
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    stock: 0,
    thc: '',
    cbd: '',
    strain: undefined,
    effects: [],
    isAvailable: true
  });
  const [effect, setEffect] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!formData.name || !formData.description || !formData.category || !formData.image) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.price <= 0) {
        throw new Error('Price must be greater than 0');
      }

      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEffect = () => {
    if (effect && !formData.effects.includes(effect)) {
      setFormData(prev => ({
        ...prev,
        effects: [...prev.effects, effect]
      }));
      setEffect('');
    }
  };

  const handleRemoveEffect = (effectToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      effects: prev.effects.filter(e => e !== effectToRemove)
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only update if the value is a valid number or empty
    if (value === '' || !isNaN(parseFloat(value))) {
      setFormData(prev => ({
        ...prev,
        price: value === '' ? 0 : parseFloat(value)
      }));
    }
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only update if the value is a valid number or empty
    if (value === '' || !isNaN(parseInt(value))) {
      setFormData(prev => ({
        ...prev,
        stock: value === '' ? 0 : parseInt(value)
      }));
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            {!isSubmitting && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={handlePriceChange}
                  className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                  required
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input
                  type="number"
                  value={formData.stock || ''}
                  onChange={handleStockChange}
                  className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                  required
                  min="0"
                  disabled={isSubmitting}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                  rows={3}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">THC %</label>
                <input
                  type="text"
                  value={formData.thc}
                  onChange={(e) => setFormData(prev => ({ ...prev, thc: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">CBD %</label>
                <input
                  type="text"
                  value={formData.cbd}
                  onChange={(e) => setFormData(prev => ({ ...prev, cbd: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Strain</label>
                <select
                  value={formData.strain || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    strain: e.target.value as 'indica' | 'sativa' | 'hybrid' | undefined 
                  }))}
                  className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                  disabled={isSubmitting}
                >
                  <option value="">Select strain</option>
                  <option value="indica">Indica</option>
                  <option value="sativa">Sativa</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL *</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Effects</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={effect}
                    onChange={(e) => setEffect(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                    placeholder="Add effect"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={handleAddEffect}
                    disabled={isSubmitting}
                    className="p-2 bg-purple-500 rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.effects.map((e) => (
                    <div
                      key={e}
                      className="px-3 py-1 bg-white/10 rounded-full flex items-center space-x-2"
                    >
                      <span>{e}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEffect(e)}
                        disabled={isSubmitting}
                        className="p-1 hover:bg-white/10 rounded-full"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                    className="rounded border-white/20 bg-white/10"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm font-medium">Available for Purchase</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 text-red-400 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="button-primary"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </div>
                ) : product ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductForm;
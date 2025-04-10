import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Calendar, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface Promotion {
  id?: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  code: string;
  active: boolean;
  usageLimit?: number;
  usageCount: number;
}

const PromotionForm: React.FC<{
  promotion?: Promotion;
  onSubmit: (promotion: Promotion) => Promise<void>;
  onClose: () => void;
}> = ({ promotion, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Promotion>(promotion || {
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    code: '',
    active: true,
    usageCount: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting promotion:', error);
      toast.error('Failed to save promotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="glass p-6 rounded-2xl max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">
            {promotion ? 'Edit Promotion' : 'Add Promotion'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  discountType: e.target.value as 'percentage' | 'fixed'
                }))}
                className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                required
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount Value</label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  discountValue: parseFloat(e.target.value)
                }))}
                className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                required
                min="0"
                step={formData.discountType === 'percentage' ? '1' : '0.01'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Promo Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                code: e.target.value.toUpperCase()
              }))}
              className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Usage Limit (Optional)</label>
            <input
              type="number"
              value={formData.usageLimit || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                usageLimit: e.target.value ? parseInt(e.target.value) : undefined
              }))}
              className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
              min="0"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="rounded border-white/20 bg-white/10"
            />
            <label className="text-sm font-medium">Active</label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Saving...
                </div>
              ) : promotion ? 'Update Promotion' : 'Add Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PromotionsManager = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const promotionsRef = collection(db, 'promotions');
      const querySnapshot = await getDocs(promotionsRef);
      const promotionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Promotion[];
      setPromotions(promotionsData);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromotion = async (promotion: Promotion) => {
    try {
      const docRef = await addDoc(collection(db, 'promotions'), {
        ...promotion,
        createdAt: new Date().toISOString()
      });
      
      setPromotions(prev => [...prev, { ...promotion, id: docRef.id }]);
      toast.success('Promotion added successfully');
    } catch (error) {
      console.error('Error adding promotion:', error);
      throw error;
    }
  };

  const handleUpdatePromotion = async (promotion: Promotion) => {
    if (!promotion.id) return;

    try {
      await updateDoc(doc(db, 'promotions', promotion.id), {
        ...promotion,
        updatedAt: new Date().toISOString()
      });
      
      setPromotions(prev => prev.map(p => 
        p.id === promotion.id ? promotion : p
      ));
      toast.success('Promotion updated successfully');
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  };

  const handleDelete = async (promotionId: string) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) return;

    try {
      await deleteDoc(doc(db, 'promotions', promotionId));
      setPromotions(prev => prev.filter(p => p.id !== promotionId));
      toast.success('Promotion deleted successfully');
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Failed to delete promotion');
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    if (!promotion.id) return;

    try {
      const promotionRef = doc(db, 'promotions', promotion.id);
      await updateDoc(promotionRef, {
        active: !promotion.active
      });
      
      setPromotions(prev => prev.map(p => 
        p.id === promotion.id ? { ...p, active: !p.active } : p
      ));
      
      toast.success(`Promotion ${promotion.active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling promotion:', error);
      toast.error('Failed to update promotion');
    }
  };

  const filteredPromotions = promotions.filter(promotion =>
    promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Promotions</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search promotions..."
              className="pl-10 pr-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500 w-full"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="button-primary whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Promotion
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map(promotion => (
            <motion.div
              key={promotion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold">{promotion.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingPromotion(promotion)}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => promotion.id && handleDelete(promotion.id)}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-4">{promotion.description}</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Discount:</span>
                  <span className="font-medium">
                    {promotion.discountType === 'percentage'
                      ? `${promotion.discountValue}%`
                      : `$${promotion.discountValue}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Code:</span>
                  <code className="bg-white/10 px-2 py-1 rounded">
                    {promotion.code}
                  </code>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Period:</span>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(promotion.startDate).toLocaleDateString()} - 
                      {new Date(promotion.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Usage:</span>
                  <span>
                    {promotion.usageCount}
                    {promotion.usageLimit ? `/${promotion.usageLimit}` : ''}
                  </span>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleToggleActive(promotion)}
                    className={`w-full px-4 py-2 rounded-lg ${
                      promotion.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {promotion.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredPromotions.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400">
          No promotions found matching your search
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <PromotionForm
            onSubmit={handleAddPromotion}
            onClose={() => setShowAddModal(false)}
          />
        )}

        {editingPromotion && (
          <PromotionForm
            promotion={editingPromotion}
            onSubmit={handleUpdatePromotion}
            onClose={() => setEditingPromotion(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromotionsManager;
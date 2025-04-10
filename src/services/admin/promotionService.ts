import { Promotion } from '../../components/admin/types';

// Mock data store
let promotions: Promotion[] = [];

export const promotionService = {
  getPromotions: async (): Promise<Promotion[]> => {
    return promotions;
  },

  addPromotion: async (promotion: Omit<Promotion, 'id'>): Promise<Promotion> => {
    const newPromotion = {
      ...promotion,
      id: `promo-${Date.now()}`
    };
    promotions.push(newPromotion);
    return newPromotion;
  },

  updatePromotion: async (id: string, updates: Partial<Promotion>): Promise<Promotion> => {
    const index = promotions.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Promotion not found');
    
    promotions[index] = { ...promotions[index], ...updates };
    return promotions[index];
  },

  deletePromotion: async (id: string): Promise<void> => {
    promotions = promotions.filter(p => p.id !== id);
  }
};
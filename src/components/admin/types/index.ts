export interface AdminStats {
  totalProducts: number;
  activePromotions: number;
  dailyOrders: number;
  dailyRevenue: number;
  productsTrend: number;
  promotionsTrend: number;
  ordersTrend: number;
  revenueTrend: number;
}

export interface Product {
  id: string;
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

export interface Order {
  id: string;
  status: 'pending' | 'processing' | 'delivering' | 'completed' | 'cancelled';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  createdAt: Date;
}

export interface Promotion {
  id: string;
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
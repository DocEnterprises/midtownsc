import { Product } from '../../components/admin/types';

// Mock data store
let products: Product[] = [];

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    return products;
  },

  addProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`
    };
    products.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    products[index] = { ...products[index], ...updates };
    return products[index];
  },

  deleteProduct: async (id: string): Promise<void> => {
    products = products.filter(p => p.id !== id);
  }
};
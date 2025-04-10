import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Product } from './types';
import { productService } from '../../services/admin/productService';
import ProductForm from './ProductForm';
import toast from 'react-hot-toast';

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsData = await productService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productService.addProduct(product);
      setProducts(prev => [...prev, newProduct]);
      toast.success('Product added successfully');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      const updatedProduct = await productService.updateProduct(product.id, product);
      setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
      toast.success('Product updated successfully');
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Rest of the component remains the same, just update the data handling
  return (
    <div className="space-y-6">
      {/* Component JSX remains the same */}
    </div>
  );
};

export default ProductManager;
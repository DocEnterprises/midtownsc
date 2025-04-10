import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Award } from 'lucide-react';
import { useStore } from '../store/useStore';
import { triggerConfetti } from '../utils/confetti';
import ProductDetailsModal from './modals/ProductDetailsModal';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CATEGORIES = [
  'all',
  'Flower',
  'Vapes',
  'Edibles',
  'Pre-Rolls',
  'Concentrates',
  'Tinctures',
  'Topicals'
];

const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
    triggerConfetti();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section id="products" className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Premium Products</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explore our curated selection of premium cannabis products,
            carefully selected for quality and potency.
          </p>
        </motion.div>

        <div className="flex justify-center mb-8 space-x-4 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="glass p-6 rounded-xl flex flex-col cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="relative mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg"
                  loading="lazy"
                />
                <span className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded-full text-xs">
                  {product.category}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{product.description}</p>
              
              {(product.thc || product.cbd) && (
                <div className="flex justify-start items-center space-x-3 mb-4">
                  {product.thc && (
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span className="text-xs">THC: {product.thc}</span>
                    </div>
                  )}
                  {product.cbd && (
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4 text-blue-400" />
                      <span className="text-xs">CBD: {product.cbd}</span>
                    </div>
                  )}
                </div>
              )}
              
              {product.effects && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.effects.map((effect: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/10 rounded-full text-xs"
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-2xl font-bold">${product.price}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className="button-primary"
                  disabled={!product.isAvailable || product.stock === 0}
                >
                  {product.isAvailable && product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ProductDetailsModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
};

export default Products;
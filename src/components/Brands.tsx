import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const brands = [
  {
    name: 'Cookies',
    logo: 'https://images.unsplash.com/photo-1585166059782-fb2b2c71a458?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Connected',
    logo: 'https://images.unsplash.com/photo-1585166059717-e563e11a6f9f?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Alien Labs',
    logo: 'https://images.unsplash.com/photo-1585166059651-1dd42d73c7c7?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Raw Garden',
    logo: 'https://images.unsplash.com/photo-1585166059544-9e8d1b26c456?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Jungle Boys',
    logo: 'https://images.unsplash.com/photo-1585166059773-d53a2f3e19c5?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: '710 Labs',
    logo: 'https://images.unsplash.com/photo-1585166059862-89a34b3e2f6d?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Stiiizy',
    logo: 'https://images.unsplash.com/photo-1585166059849-d4a0df03d2f7?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Jeeter',
    logo: 'https://images.unsplash.com/photo-1585166059836-8d3e3b0e7f9c?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Wonderbrett',
    logo: 'https://images.unsplash.com/photo-1585166059823-4f3e0e0c8b8a?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Source Cannabis',
    logo: 'https://images.unsplash.com/photo-1585166059810-4d3e0e0c8b8b?auto=format&fit=crop&q=80&w=200'
  }
];

const Brands = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (brands.length - 4));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4 bg-black/20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Featured Brands</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Discover our curated selection of premium cannabis brands,
            each chosen for their commitment to quality and innovation.
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: `-${currentIndex * 25}%` }}
            transition={{ duration: 0.5 }}
            className="flex space-x-8"
          >
            {brands.map((brand) => (
              <motion.div
                key={brand.name}
                className="flex-none w-1/4 glass p-6 rounded-xl"
                whileHover={{ scale: 1.05 }}
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-4">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-xl font-bold text-center">{brand.name}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Brands;
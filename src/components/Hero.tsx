import React from 'react';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const { user, openAuthModal } = useStore();
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (user) {
      navigate('/cockpit');
    } else {
      openAuthModal('signup');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "https://unsplash.com/photos/airplane-skyline-horizon-flight-cloud-concept-qs5Yd2-USos",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.4)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Plane className="w-20 h-20 mx-auto mb-8 text-purple-400 animate-float" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Skyclub Members
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Elevate your experience with New York's premier cannabis collective
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="button-primary"
            onClick={handleButtonClick}
          >
            {user ? "Enter Cockpit" : "Join the Club"}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
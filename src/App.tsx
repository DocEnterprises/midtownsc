import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Products from './components/Products';
import Brands from './components/Brands';
import About from './components/About';
import Events from './components/Events';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import AuthModal from './components/auth/AuthModal';
import Cart from './components/Cart';
import Dashboard from './components/cockpit/Dashboard';
import Settings from './components/cockpit/Settings';
import SecureChat from './components/chat/SecureChat';
import AdminChat from './components/chat/AdminChat';
import PasswordProtection from './components/PasswordProtection';
import AgeVerification from './components/AgeVerification';
import PromoPopup from './components/PromoPopup';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';
import { ChatProvider } from './components/chat/ChatProvider';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { 
    isPasswordVerified, 
    isAgeVerified, 
    isAuthModalOpen,
    closeAuthModal,
    isCartOpen,
    toggleCart,
    user,
    darkMode 
  } = useStore();

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isPasswordVerified) {
    return <PasswordProtection onVerify={() => useStore.setState({ isPasswordVerified: true })} />;
  }

  if (!isAgeVerified) {
    return <AgeVerification onVerify={(verified) => useStore.setState({ isAgeVerified: verified })} />;
  }

  return (
    <Router>
      <ChatProvider>
        <div className={`min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white ${darkMode ? 'dark' : ''}`}>
          <Navigation />
          
          <Routes>
            <Route path="/" element={
              <main className="relative">
                <Hero />
                <Products />
                <Brands />
                <About />
                <Events />
                <Newsletter />
              </main>
            } />
            
            <Route 
              path="/cockpit" 
              element={
                user ? <Dashboard /> : <Navigate to="/" replace />
              } 
            />

            <Route 
              path="/settings" 
              element={
                user ? <Settings /> : <Navigate to="/" replace />
              } 
            />

            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>

          <Footer />
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={closeAuthModal} 
          />
          <Cart 
            isOpen={isCartOpen}
            onClose={toggleCart}
          />
          <SecureChat />
          {user?.email === 'admin@skyclub.com' && <AdminChat />}
          <PromoPopup />
        </div>
      </ChatProvider>
    </Router>
  );
};

export default App;
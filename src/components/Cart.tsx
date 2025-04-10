import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import CheckoutModal from './checkout/CheckoutModal';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { 
    cart, 
    user, 
    updateCartItemQuantity, 
    removeFromCart,
    openAuthModal
  } = useStore();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal * 0.30; // 30% delivery fee including tax
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (!user) {
      openAuthModal('signin', () => {
        setIsCheckoutModalOpen(true);
      });
      return;
    }

    if (cart.length === 0) return;

    const hasPaymentMethod = user.paymentMethods.length > 0;
    if (!hasPaymentMethod) {
      navigate('/settings');
      return;
    }

    setIsCheckoutModalOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 z-50"
          >
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            
            <div className="relative h-full glass ml-auto w-full sm:w-96">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Your Cart</h2>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto cart-scroll">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      Your cart is empty
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div 
                          key={item.id} 
                          className="glass p-4 rounded-lg flex items-center space-x-4"
                        >
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-400">${item.price}</p>
                            
                            <div className="flex items-center space-x-2 mt-2">
                              <button
                                onClick={() => updateCartItemQuantity(item.id, Math.max(0, item.quantity - 1))}
                                className="p-1 hover:bg-white/10 rounded-full"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-white/10 rounded-full"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 hover:bg-white/10 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-400">Delivery Fee (includes tax)</span>
                        <span className="text-purple-400">
                          ${deliveryFee.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between font-medium pt-2 border-t border-white/10">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleCheckout}
                      className="button-primary w-full"
                    >
                      {user ? 'Continue to Checkout' : 'Sign in to Checkout'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutModal 
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
      />
    </>
  );
};

export default Cart;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from "lucide-react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useStore } from '../../store/useStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AddPaymentMethod: React.FC<Props> = ({ isOpen, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, setUser } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!stripe || !elements || !user) {
      setError("Stripe has not loaded yet.");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Card Element not found");
      setLoading(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setError(error.message || "Failed to create payment method");
      setLoading(false);
      return;
    }

    const last4 = paymentMethod.card?.last4 || "";
    const type = paymentMethod.card?.brand || "Card";

    const newMethod = {
      id: paymentMethod.id,
      last4,
      type,
      isDefault: user.paymentMethods.length === 0,
    };

    setUser({
      ...user,
      paymentMethods: [...user.paymentMethods, newMethod],
    });

    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass p-6 rounded-2xl max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add Payment Method</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-medium mb-1">
                Card Details
              </label>
              <div className="border border-white/20 rounded-lg bg-white/10 p-3">
                <CardElement
                  options={{
                    style: {
                      base: {
                        color: "#fff",
                        fontSize: "16px",
                        "::placeholder": { color: "#a0aec0" },
                      },
                      invalid: { color: "#e53e3e" },
                    },
                  }}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full button-primary"
                disabled={loading || !stripe}
              >
                {loading ? "Adding..." : "Add Payment Method"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddPaymentMethod;

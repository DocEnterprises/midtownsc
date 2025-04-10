import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

interface LineItem {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      images?: string[];
    };
    unit_amount: number;
  };
  quantity: number;
}

interface CheckoutSessionRequest {
  items: LineItem[];
  success_url: string;
  cancel_url: string;
  customer_email?: string;
}

export const createCheckoutSession = async (
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>,
  email?: string
): Promise<string> => {
  try {
    const checkoutData: CheckoutSessionRequest = {
      items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      success_url: `${window.location.origin}/cockpit`,
      cancel_url: `${window.location.origin}/#products`,
      customer_email: email,
    };

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const handleStripeCheckout = async (
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>,
  email?: string
): Promise<void> => {
  try {
    const sessionId = await createCheckoutSession(items, email);
    const stripe = await getStripe();
    
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
};
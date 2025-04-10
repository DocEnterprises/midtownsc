import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

export const createPaymentIntent = async ({
  amount,
  currency = 'usd',
  description,
  metadata
}: {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}) => {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency,
      description,
      metadata
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return await response.json();
};

export const handlePaymentWithStripe = async ({
  amount,
  currency = 'usd',
  paymentMethodId,
  description,
  metadata
}: {
  amount: number;
  currency?: string;
  paymentMethodId: string;
  description?: string;
  metadata?: Record<string, string>;
}) => {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    const paymentIntent = await createPaymentIntent({
      amount,
      currency,
      description,
      metadata
    });

    const { error, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
      paymentIntent.client_secret,
      {
        payment_method: paymentMethodId
      }
    );

    if (error) {
      throw error;
    }

    return confirmedIntent;
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
};

export const handleStripeCheckout = async (sessionId: string) => {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe failed to initialize');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    throw error;
  }
};

export const createCheckoutSession = async (data: {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  customer_email?: string;
}) => {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return await response.json();
};
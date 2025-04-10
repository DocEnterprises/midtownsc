import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY, {
      apiVersion: '2023-10-16',
      stripeAccount: process.env.NODE_ENV === 'development' ? 'acct_test' : undefined
    });
  }
  return stripePromise;
};

interface PaymentIntentResponse {
  clientSecret: string;
  id: string;
  amount: number;
  status: string;
}

export const createPaymentIntent = async (amount: number): Promise<PaymentIntentResponse> => {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
      capture_method: 'automatic'
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create payment intent');
  }

  return response.json();
};

export const handlePaymentWithStripe = async ({
  amount,
  paymentMethodId,
  description,
  metadata = {}
}: {
  amount: number;
  paymentMethodId: string;
  description?: string;
  metadata?: Record<string, string>;
}) => {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    // Create payment intent
    const { clientSecret } = await createPaymentIntent(amount);

    // Confirm the payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: process.env.NODE_ENV === 'development' 
          ? 'pm_card_visa' // Use test card in development
          : paymentMethodId,
        ...(description && { description }),
        ...(metadata && { metadata })
      }
    );

    if (error) {
      throw error;
    }

    return {
      success: true,
      paymentId: paymentIntent?.id
    };
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
import { useState, useEffect } from 'react';
import { PaymentIntent, Stripe } from '@stripe/stripe-js';
import { getStripe } from './index';

export const useStripe = () => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getStripe()
      .then(setStripe)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { stripe, loading, error };
};

export const usePaymentIntent = (amount: number) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

  useEffect(() => {
    const createIntent = async () => {
      try {
        const secret = await getStripe().then(stripe => 
          stripe?.paymentIntents.create({
            amount,
            currency: 'usd',
          })
        );
        if (secret?.client_secret) {
          setClientSecret(secret.client_secret);
          setPaymentIntent(secret);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [amount]);

  return { clientSecret, loading, error, paymentIntent };
};
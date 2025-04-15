// src/lib/stripe.ts
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

export const createPaymentIntent = async ({
  amount,
  currency = "usd",
  description,
  metadata,
}: {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}) => {
  const storage = localStorage.getItem("skyclub-storage");
  const email = storage ? JSON.parse(storage)?.state?.user?.email : undefined;

  console.log("Received email:", email);
  console.log("Received storage:", storage);

  // add email to metadata if it exists
  if (email) {
    metadata = { ...metadata, email };
  }

  const response = await fetch("/.netlify/functions/create-payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency,
      description,
      metadata,
    }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to create payment intent");
  }

  return await response.json();
};

export const handlePaymentWithStripe = async (
  paymentMethodId: string,
  amount: number,
  description?: string
) => {
  try {
    // 1. Create payment intent on server
    const paymentIntentResponse = await createPaymentIntent({
      amount,
      currency: "usd",
      description,
      metadata: {
        payment_method_id: paymentMethodId,
      },
    });
    // 2. Get stripe instance
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error("Stripe failed to initialize");
    }

    // 3. Confirm the payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      paymentIntentResponse.client_secret,
      {
        payment_method: paymentMethodId,
      }
    );

    if (error) {
      console.error("Payment confirmation error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (paymentIntent.status === "succeeded") {
      return {
        success: true,
        paymentIntent,
      };
    } else {
      return {
        success: false,
        error: `Payment status: ${paymentIntent.status}`,
      };
    }
  } catch (error) {
    console.error("Payment error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

export const handleStripeCheckout = async (sessionId: string) => {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error("Stripe failed to initialize");
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    throw error;
  }
};

export const createCheckoutSession = async (data: {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  customer_email?: string;
}) => {
  const response = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to create checkout session");
  }

  return await response.json();
};

export const processCheckout = async (
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>,
  email?: string
) => {
  try {
    const { sessionId, url } = await createCheckoutSession({
      items,
      customer_email: email,
    });

    // Redirect to Stripe Checkout
    window.location.href = url;
    return { success: true, sessionId };
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Checkout failed",
    };
  }
};

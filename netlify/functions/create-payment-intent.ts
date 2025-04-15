// netlify/functions/create-payment-intent.ts
import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const {
      amount,
      currency = "usd",
      description,
      metadata,
    } = JSON.parse(event.body || "{}");

    if (!amount || isNaN(amount) || amount <= 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Invalid amount provided" }),
      };
    }

    const email = metadata?.email;
    const payment_method_id = metadata?.payment_method_id;

    console.log("Received email:", email);
    let customer;

    if (email) {
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email,
        });
      }

      if (payment_method_id) {
        await stripe.paymentMethods.attach(payment_method_id, {
          customer: customer.id,
        });

        await stripe.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: payment_method_id,
          },
        });
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      description,
      customer: customer?.id,
      metadata: {
        ...metadata,
        source: "skyclub_members",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("Payment Intent created:", paymentIntent);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        client_secret: paymentIntent.client_secret,
        customer_id: customer?.id,
      }),
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
    };
  }
};

import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DELIVERY_FEE_PERCENTAGE = 30;

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { items, customer_email } = JSON.parse(event.body || '{}');

    if (!items?.length) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No items provided' }),
      };
    }

    // Calculate subtotal and delivery fee
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0);
    const deliveryFee = Math.round(subtotal * (DELIVERY_FEE_PERCENTAGE / 100));

    // Format line items for Stripe
    const lineItems = [
      ...items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined,
            metadata: {
              product_id: item.id,
            },
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      // Add delivery fee as a separate line item
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Delivery Fee (includes tax)',
            description: '30% delivery fee including sales tax',
          },
          unit_amount: deliveryFee * 100, // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.URL || 'http://localhost:5173'}/cockpit?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'http://localhost:5173'}/#products`,
      customer_email,
      allow_promotion_codes: true,
      metadata: {
        source: 'skyclub_members',
        requires_delivery: 'true',
        delivery_status: 'pending',
      },
      payment_intent_data: {
        metadata: {
          source: 'skyclub_members',
          customer_email,
          requires_delivery: 'true',
          delivery_status: 'pending',
        },
      },
    });

    // Notify customer service and admins about the new order
    try {
      await fetch(`${process.env.VITE_CHAT_WS_URL}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'new_order',
          data: {
            sessionId: session.id,
            customerEmail: customer_email,
            items,
            total: (subtotal + deliveryFee).toFixed(2),
          },
        }),
      });
    } catch (notifyError) {
      console.error('Failed to send notification:', notifyError);
      // Don't fail the checkout if notification fails
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
    };
  } catch (error) {
    console.error('Stripe error:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};
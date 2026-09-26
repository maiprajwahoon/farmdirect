import { products } from '../data';
import { supabase } from './supabase';

import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'web' ? 'http://localhost:3000' : 'http://192.168.0.102:3000';

export const api = {
  async sendOtp(email) {
    if (!email) throw new Error('Enter email.');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw new Error(error.message);
    return true;
  },

  async verifyOtp(email, otp) {
    if (!otp) throw new Error('Enter OTP.');
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.user.id,
      name: data.user.user_metadata?.name || email.split('@')[0] || 'Buyer',
      email: data.user.email,
    };
  },

  async searchProducts(query) {
    await sleep(220);

    const q = query.trim().toLowerCase();

    if (!q) {
      return products;
    }

    return products.filter((p) =>
      [p.name, p.category, p.farmer, p.location]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  },

  async checkout(payload) {
    await sleep(900);

    const items = payload.items || [];

    if (items.length === 0) {
      throw new Error('Your cart is empty.');
    }

    const firstItemProduct = items[0]?.product || items[0] || {};
    const farmerId = firstItemProduct.farmerId || payload.farmerId || 'demo-farmer-1';

    const serverPayload = {
      buyerId: payload.buyerId || 'buyer-demo',

      buyerName: payload.buyerName || 'FarmDirect Buyer',

      farmerId: farmerId,

      listingId: payload.listingId || 'listing-001',

      items: items.map((item) => {
        const prod = item.product || item;
        return {
          productId: prod.id || prod.productId || null,
          productName: prod.name || 'Unknown Product',
          quantity: Number(item.quantity || item.qty) || 1,
          price: Number(prod.price) || 0,
        };
      }),

      // Preserve the existing checkout total.
      total: Number(payload.total) || 0,

      address: payload.address || 'Not specified',

      slot: payload.slot || 'Not specified',

      instructions: `Deliver to: ${payload.address || 'Not specified'
        }, Slot: ${payload.slot || 'Not specified'}`,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(serverPayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `Order failed (${response.status}): ${errorText}`
        );
      }

      const result = await response.json();

      if (!result.success || !result.order) {
        throw new Error('Invalid response from backend.');
      }

      console.log(
        'Order created successfully:',
        result.order.orderNumber
      );

      return {
        ...result.order,

        date: new Date(
          result.order.createdAt
        ).toLocaleDateString('en-IN', {
          day: '2-digit',

          month: 'short',

          year: 'numeric',
        }),
      };
    } catch (error) {
      console.error(
        'Failed to create order:',
        error
      );

      throw error;
    }
  },
};

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));
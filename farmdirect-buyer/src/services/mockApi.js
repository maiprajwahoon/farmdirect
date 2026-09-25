import { products } from '../data';

export const api = {
  async login(email, password) {
    await sleep(550);
    if (!email || !password) throw new Error('Enter email and password.');
    return { id: 'buyer-demo', name: email.split('@')[0] || 'Buyer', email };
  },
  async register(name, email, password) {
    await sleep(700);
    if (!name || !email || !password) throw new Error('Fill all required fields.');
    if (password.length < 6) throw new Error('Password must contain at least 6 characters.');
    return { id: 'buyer-demo', name, email };
  },
  async searchProducts(query) {
    await sleep(220);
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => [p.name, p.category, p.farmer, p.location].join(' ').toLowerCase().includes(q));
  },
  async checkout(payload) {
    await sleep(900);
    const localOrder = {
      ...payload,
      id: `FD-${Date.now().toString().slice(-7)}`,
      status: 'Confirmed',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    try {
      // Get the first item to pass product details
      const firstItem = Object.values(payload.items || {})[0] || {};
      
      const serverPayload = {
        buyerName: 'FarmDirect Buyer',
        productName: firstItem.name || 'Assorted Items',
        quantity: firstItem.quantity || 1,
        price: firstItem.price || 0,
        total: payload.total,
        instructions: `Deliver to: ${payload.address}, Slot: ${payload.slot}`
      };

      await fetch('http://192.168.0.102:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serverPayload)
      });
      console.log('Order sent to backend successfully.');
    } catch (error) {
      console.error('Failed to send order to backend:', error);
    }

    return localOrder;
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

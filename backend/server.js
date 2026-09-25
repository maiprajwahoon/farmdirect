const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store for orders
let orders = [];

app.post('/api/orders', (req, res) => {
  const payload = req.body;
  const orderId = `FD-${Date.now().toString().slice(-7)}`;
  
  // Create an order matching the structure expected by happy-galileo
  const order = {
    id: orderId,
    orderNumber: orderId,
    buyerId: payload.buyerId || 'buyer-demo',
    farmerId: payload.farmerId || 'demo-farmer-1',
    listingId: payload.listingId || 'listing-001',
    buyer: {
      id: payload.buyerId || 'buyer-demo',
      name: payload.buyerName || 'Demo Buyer',
      businessName: 'FarmDirect Buyer App',
      businessType: 'retailer',
      phone: '+91 99999 99999',
      address: 'Test Address',
      district: 'Test District',
      state: 'Test State',
      isVerified: true,
      rating: 5.0,
      totalOrders: 1,
      createdAt: new Date().toISOString(),
    },
    cropName: payload.productName || 'Assorted Vegetables',
    variety: payload.productVariety || 'Regular',
    quantity: payload.quantity || 1,
    quantityUnit: 'kg', // Or from payload
    pricePerUnit: payload.price || 0,
    totalAmount: payload.total || 0,
    deliveryType: 'delivery',
    status: 'new',
    statusHistory: [
      { status: 'new', timestamp: new Date().toISOString() },
    ],
    buyerInstructions: payload.instructions || '',
    paymentStatus: 'pending',
    photos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.push(order);
  console.log(`[+] New Order Received: ${order.orderNumber} for ${order.cropName} (${order.totalAmount} INR)`);
  
  res.json({ success: true, order });
});

app.get('/api/orders', (req, res) => {
  res.json({ orders });
});

// A route for testing if the server is up
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FarmDirect Integration Server running on http://0.0.0.0:${PORT}`);
  console.log(`Waiting for orders from the buyer app...`);
});

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = 'https://xkoewoyrlylsmogkexic.supabase.co';
const supabaseKey = 'sb_publishable_7Z9aohcBPGOMTAQ2MkuMQQ_JhSlqOMT'; // Public anon key is fine for demo
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/api/orders', async (req, res) => {
  const payload = req.body;
  const orderId = `FD-${Date.now().toString().slice(-7)}`;
  
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
    quantityUnit: 'kg',
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

  // Insert into Supabase
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select();

  if (error) {
    console.error('Error inserting order into Supabase:', error);
    return res.status(500).json({ success: false, error: error.message });
  }

  console.log(`[+] New Order Saved to Supabase: ${order.orderNumber}`);
  res.json({ success: true, order: data[0] || order });
});

app.get('/api/orders', async (req, res) => {
  // Fetch from Supabase
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching orders from Supabase:', error);
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ orders: orders || [] });
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

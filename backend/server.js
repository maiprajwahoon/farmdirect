const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Initialize Supabase Client
const supabaseUrl = 'https://xkoewoyrlylsmogkexic.supabase.co';
const supabaseKey = 'sb_publishable_7Z9aohcBPGOMTAQ2MkuMQQ_JhSlqOMT'; // Public anon key is fine for demo
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// PRODUCT CATALOG PERSISTENCE & SYNC
// ==========================================
const PRODUCTS_FILE = process.env.VERCEL ? path.join('/tmp', 'products.json') : path.join(__dirname, 'products.json');

function detectCategory(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('spinach') || n.includes('palak') || n.includes('methi') || n.includes('coriander')) return 'Leafy Greens';
  if (n.includes('potato') || n.includes('carrot') || n.includes('radish') || n.includes('beet')) return 'Root Vegetables';
  if (n.includes('banana') || n.includes('apple') || n.includes('mango') || n.includes('guava') || n.includes('orange') || n.includes('grape')) return 'Fruits';
  return 'Vegetables';
}

function getImageForCrop(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('tomato')) return (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/tomatoes.jpg';
  if (n.includes('potato') || n.includes('aloo')) return (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/potatoes.jpg';
  if (n.includes('capsicum') || n.includes('pepper') || n.includes('shimla') || n.includes('chilli') || n.includes('mirchi')) return (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/capsicum.jpg';
  if (n.includes('spinach') || n.includes('palak') || n.includes('methi') || n.includes('leaf') || n.includes('coriander')) return (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/spinach.jpg';
  if (n.includes('onion') || n.includes('pyaz')) return (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/onions.jpg';
  if (n.includes('carrot') || n.includes('gajar') || n.includes('radish') || n.includes('beet')) return (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/carrots.jpg';
  if (n.includes('banana') || n.includes('kela')) return (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/bananas.jpg';
  if (n.includes('mango') || n.includes('aam')) return (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/mangoes.jpg';
  if (n.includes('guava') || n.includes('amrud')) return (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/guava.jpg';
  if (n.includes('cucumber') || n.includes('kakdi') || n.includes('kheera')) return 'https://placehold.co/600x400/e9efe9/2f5b3a?text=Cucumbers';
  
  // Generic fallback if not matched
  return 'https://placehold.co/600x400/eeeeee/999999?text=Produce';
}

const defaultProducts = [
  {
    id: 'p1', name: 'Fresh Tomatoes', variety: 'Pusa Ruby', category: 'Vegetables', unit: 'kg', price: 58, farmer: 'Green Valley Farm', location: 'Ozar, Nashik', quality: 'Verified', harvest: 'Today',
    quantity: 350,
    description: 'Firm red tomatoes sourced directly from our farm. Great for curries, salads and everyday cooking.',
    image: (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/tomatoes.jpg',
    isAiGenerated: true,
    available: true,
  },
  {
    id: 'p2', name: 'Farm Potatoes', variety: 'Kufri Jyoti', category: 'Root Vegetables', unit: 'kg', price: 42, farmer: 'Green Valley Farm', location: 'Ozar, Nashik', quality: 'Verified', harvest: 'Today',
    quantity: 500,
    description: 'Everyday cooking potatoes with a natural earthy finish and reliable availability.',
    image: (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/potatoes.jpg',
    isAiGenerated: true,
    available: true,
  },
  {
    id: 'p3', name: 'Green Capsicum', variety: 'California Wonder', category: 'Vegetables', unit: 'kg', price: 78, farmer: 'Green Valley Farm', location: 'Ozar, Nashik', quality: 'Verified', harvest: 'Today',
    quantity: 140,
    description: 'Crunchy green capsicum supplied directly by Green Valley Farm. Great for stir-fries and stuffed dishes.',
    image: (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/capsicum.jpg',
    isAiGenerated: true,
    available: true,
  },
  {
    id: 'p4', name: 'Fresh Spinach', variety: 'All Rounder Palak', category: 'Leafy Greens', unit: 'bundle', price: 28, farmer: 'Green Valley Farm', location: 'Ozar, Nashik', quality: 'Verified', harvest: 'Today',
    quantity: 90,
    description: 'Fresh leafy greens picked close to dispatch. Availability can change quickly by harvest.',
    image: (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/spinach.jpg',
    isAiGenerated: true,
    available: true,
  },
  {
    id: 'p5', name: 'Red Onions', variety: 'Nashik Special', category: 'Vegetables', unit: 'kg', price: 49, farmer: 'Green Valley Farm', location: 'Ozar, Nashik', quality: 'Verified', harvest: 'Today',
    quantity: 600,
    description: 'Red onions with a balanced bite for everyday cooking and fresh salads.',
    image: (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/onions.jpg',
    isAiGenerated: true,
    available: true,
  },
  {
    id: 'p6', name: 'Fresh Carrots', variety: 'Pusa Kesar', category: 'Root Vegetables', unit: 'kg', price: 62, farmer: 'Green Valley Farm', location: 'Ozar, Nashik', quality: 'Verified', harvest: 'Today',
    quantity: 180,
    description: 'Fresh carrots with a crisp texture. Seller details and visual quality information are shown transparently.',
    image: (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/carrots.jpg',
    isAiGenerated: true,
    available: true,
  },
  {
    id: 'p7', name: 'Bananas', variety: 'Robusta', category: 'Fruits', unit: 'dozen', price: 70, farmer: 'Green Valley Farm', location: 'Ozar, Nashik', quality: 'Verified', harvest: 'Today',
    quantity: 150,
    description: 'Naturally ripening bananas supplied directly by our local farm orchard.',
    image: (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/bananas.jpg',
    isAiGenerated: true,
    available: true,
  },
  {
    id: 'p8', name: 'Seasonal Guava', variety: 'Allahabad Safeda', category: 'Seasonal Picks', unit: 'kg', price: 76, farmer: 'Green Valley Farm', location: 'Ozar, Nashik', quality: 'Verified', harvest: 'Today',
    quantity: 90,
    description: 'Seasonal guava selection. Freshly picked from Green Valley Farm.',
    image: (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/guava.jpg',
    isAiGenerated: true,
    available: true,
  },
];

let catalog = defaultProducts;
if (fs.existsSync(PRODUCTS_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    if (Array.isArray(saved) && saved.length > 0) {
      catalog = saved;
    }
  } catch (e) {
    catalog = defaultProducts;
  }
} else {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(catalog, null, 2));
  } catch (e) {}
}

function saveCatalog() {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(catalog, null, 2));
  } catch (e) {
    console.error('Error saving products:', e);
  }
}

// ==========================================
// ORDERS PERSISTENCE & SYNC (TWO-WAY BUYER & FARMER)
// ==========================================
const ORDERS_FILE = process.env.VERCEL ? path.join('/tmp', 'orders.json') : path.join(__dirname, 'orders.json');

function loadLocalOrders() {
  if (fs.existsSync(ORDERS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    } catch (e) {}
  }
  return [];
}

function saveLocalOrders(ordersList) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(ordersList, null, 2));
  } catch (e) {
    console.error('Error saving local orders:', e);
  }
}

function formatOrder(raw) {
  if (!raw) return raw;
  const buyerObj = typeof raw.buyer === 'object' && raw.buyer !== null ? raw.buyer : {};
  
  // Resolve item list from order.items, buyer.items, or synthesize
  let items = Array.isArray(raw.items) && raw.items.length > 0 
    ? raw.items 
    : (Array.isArray(buyerObj.items) && buyerObj.items.length > 0 ? buyerObj.items : []);

  if (!items || items.length === 0) {
    const rawCrop = raw.cropName && raw.cropName !== 'Assorted Vegetables' ? raw.cropName : 'Fresh Produce';
    items = [
      {
        productId: raw.listingId || 'p1',
        productName: rawCrop,
        variety: raw.variety || 'Regular',
        quantity: Number(raw.quantity) || 1,
        unit: raw.quantityUnit || 'kg',
        price: Number(raw.pricePerUnit) || Number(raw.totalAmount) || 50,
        image: (raw.photos && raw.photos[0]) || getImageForCrop(rawCrop),
      }
    ];
  } else {
    items = items.map(it => {
      const name = it.productName || it.name || 'Fresh Produce';
      return {
        productId: it.productId || it.id || 'p1',
        productName: name,
        variety: it.variety || 'Fresh Harvest',
        quantity: Number(it.quantity || it.qty || 1),
        unit: it.unit || 'kg',
        price: Number(it.price || 50),
        image: it.image || getImageForCrop(name),
      };
    });
  }

  const total = Number(raw.totalAmount !== undefined ? raw.totalAmount : (raw.total || 0));
  const rawDate = raw.createdAt || raw.date;
  const dateFormatted = rawDate 
    ? new Date(rawDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Today';

  const buyerName = buyerObj.name && buyerObj.name !== 'Demo Buyer' && buyerObj.name !== 'FarmDirect Buyer'
    ? buyerObj.name 
    : (raw.buyerName || 'Sunita Patil');

  const buyerPhone = buyerObj.phone && buyerObj.phone !== '+91 99999 99999'
    ? buyerObj.phone 
    : '+91 98201 45829';

  const deliveryAddress = raw.deliveryAddress 
    || buyerObj.address 
    || 'Flat 402, Sai Residency, Virar East, Maharashtra';

  const deliverySlot = raw.deliverySlot 
    || buyerObj.deliverySlot 
    || raw.slot 
    || 'Today • 6:00 PM – 8:00 PM';

  const photos = Array.isArray(raw.photos) && raw.photos.length > 0 
    ? raw.photos 
    : items.map(x => x.image).filter(Boolean);

  return {
    ...raw,
    id: raw.id || raw.orderNumber,
    orderNumber: raw.orderNumber || raw.id,
    total: total,
    totalAmount: total,
    items: items,
    date: dateFormatted,
    farmer: raw.farmer || 'Green Valley Farm',
    deliveryType: raw.deliveryType || 'delivery',
    deliveryAddress: deliveryAddress,
    deliverySlot: deliverySlot,
    slot: deliverySlot,
    address: deliveryAddress,
    status: raw.status || 'new',
    statusHistory: raw.statusHistory || [{ status: raw.status || 'new', timestamp: new Date().toISOString() }],
    paymentStatus: raw.paymentStatus || 'paid',
    paymentMethod: raw.paymentMethod || buyerObj.paymentMethod || 'UPI',
    photos: photos.length > 0 ? photos : [getImageForCrop(raw.cropName || 'Tomatoes')],
    buyer: {
      ...buyerObj,
      name: buyerName,
      businessName: buyerObj.businessName || 'Retail Buyer',
      phone: buyerPhone,
      address: deliveryAddress,
      district: buyerObj.district || 'Palghar',
      state: buyerObj.state || 'Maharashtra',
      deliverySlot: deliverySlot,
      items: items,
    }
  };
}

// POST /api/orders - Buyer places a new order
app.post('/api/orders', async (req, res) => {
  const payload = req.body || {};
  const orderId = `FD-${Date.now().toString().slice(-7)}`;
  
  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  const items = rawItems.map(it => {
    const prod = it.product || it;
    const name = it.productName || prod.name || 'Farm Produce';
    return {
      productId: it.productId || prod.id || `p_${Date.now()}`,
      productName: name,
      variety: it.variety || prod.variety || 'Regular',
      quantity: Number(it.quantity || it.qty || 1),
      unit: it.unit || prod.unit || 'kg',
      price: Number(it.price !== undefined ? it.price : (prod.price || 50)),
      image: it.image || prod.image || getImageForCrop(name),
    };
  });

  const firstItem = items[0] || {};
  const cropSummary = items.length === 1 
    ? firstItem.productName 
    : items.length > 1 
      ? items.map(x => x.productName).join(', ') 
      : (payload.productName || 'Fresh Farm Produce');

  const totalQty = items.reduce((s, x) => s + x.quantity, 0) || Number(payload.quantity) || 1;
  const primaryUnit = firstItem.unit || 'kg';
  const totalAmount = Number(payload.total) || Number(payload.totalAmount) || items.reduce((s, x) => s + (x.price * x.quantity), 0);

  const buyerName = payload.buyerName || (payload.buyer && payload.buyer.name) || 'Sunita Patil';
  const buyerPhone = payload.buyerPhone || (payload.buyer && payload.buyer.phone) || '+91 98201 45829';
  const deliveryAddress = payload.address || (payload.buyer && payload.buyer.address) || 'Flat 402, Sai Residency, Virar East, Maharashtra';
  const deliverySlot = payload.slot || (payload.buyer && payload.buyer.deliverySlot) || 'Today • 6:00 PM – 8:00 PM';
  const paymentMethod = payload.payment || 'UPI';
  const farmerName = payload.farmer || (firstItem.farmer) || 'Green Valley Farm';

  const orderPhotos = items.map(x => x.image).filter(Boolean);
  if (orderPhotos.length === 0) {
    orderPhotos.push(getImageForCrop(cropSummary));
  }

  const order = {
    id: orderId,
    orderNumber: orderId,
    buyerId: payload.buyerId || 'buyer-demo',
    farmerId: payload.farmerId || 'demo-farmer-1',
    listingId: firstItem.productId || payload.listingId || 'listing-001',
    buyer: {
      id: payload.buyerId || 'buyer-demo',
      name: buyerName,
      businessName: 'Retail Buyer',
      businessType: 'retailer',
      phone: buyerPhone,
      address: deliveryAddress,
      district: 'Palghar',
      state: 'Maharashtra',
      isVerified: true,
      rating: 5.0,
      totalOrders: 1,
      createdAt: new Date().toISOString(),
      items: items,
      deliverySlot: deliverySlot,
      paymentMethod: paymentMethod,
    },
    cropName: cropSummary,
    variety: firstItem.variety || 'Fresh Harvest',
    quantity: totalQty,
    quantityUnit: primaryUnit,
    pricePerUnit: firstItem.price || Math.round(totalAmount / totalQty),
    totalAmount: totalAmount,
    total: totalAmount,
    items: items,
    farmer: farmerName,
    deliveryType: 'delivery',
    deliveryAddress: deliveryAddress,
    deliverySlot: deliverySlot,
    paymentMethod: paymentMethod,
    status: 'new',
    statusHistory: [
      { status: 'new', timestamp: new Date().toISOString(), note: 'Order placed by buyer' },
    ],
    buyerInstructions: payload.instructions || `Deliver to: ${deliveryAddress}, Slot: ${deliverySlot}`,
    paymentStatus: paymentMethod === 'Cash on Delivery' ? 'pending' : 'paid',
    photos: orderPhotos,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to local orders.json
  const localList = loadLocalOrders();
  localList.unshift(order);
  saveLocalOrders(localList);

  // 2. Sync to Supabase
  try {
    const supabasePayload = {
      id: order.id,
      orderNumber: order.orderNumber,
      buyerId: order.buyerId,
      farmerId: order.farmerId,
      listingId: order.listingId,
      buyer: order.buyer,
      cropName: order.cropName,
      variety: order.variety,
      quantity: order.quantity,
      quantityUnit: order.quantityUnit,
      pricePerUnit: order.pricePerUnit,
      totalAmount: order.totalAmount,
      deliveryType: order.deliveryType,
      status: order.status,
      statusHistory: order.statusHistory,
      buyerInstructions: order.buyerInstructions,
      paymentStatus: order.paymentStatus,
      photos: order.photos,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
    await supabase.from('orders').insert([supabasePayload]);
  } catch (err) {
    console.warn('Notice: Order saved locally, Supabase mirror skipped:', err.message);
  }

  const formatted = formatOrder(order);
  console.log(`[+] New Order Created: #${order.orderNumber} - ${cropSummary} (₹${totalAmount}) for ${buyerName}`);
  res.json({ success: true, order: formatted });
});

// GET /api/orders - Fetch all orders (for Buyer and Farmer apps)
app.get('/api/orders', async (req, res) => {
  const localList = loadLocalOrders();
  let mergedMap = new Map();

  // Populate from local storage first
  localList.forEach(o => {
    mergedMap.set(o.id, o);
  });

  // Then merge with Supabase data
  try {
    const { data: remoteOrders, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });

    if (!error && Array.isArray(remoteOrders)) {
      remoteOrders.forEach(ro => {
        const local = mergedMap.get(ro.id) || {};
        mergedMap.set(ro.id, { ...ro, ...local, status: ro.status || local.status });
      });
    }
  } catch (e) {}

  const ordersArray = Array.from(mergedMap.values())
    .map(formatOrder)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  res.json({ success: true, orders: ordersArray });
});

// PUT /api/orders/:id - Farmer or Buyer updates order status
app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body || {};

  const localList = loadLocalOrders();
  let order = localList.find(o => o.id === id || o.orderNumber === id);

  if (!order) {
    // Try fetching from Supabase
    try {
      const { data } = await supabase.from('orders').select('*').eq('id', id).single();
      if (data) order = data;
    } catch (e) {}
  }

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  if (status) {
    order.status = status;
    const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    history.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Order updated to ${status}`,
    });
    order.statusHistory = history;
    order.updatedAt = new Date().toISOString();
  }

  // Save to local
  const existingIdx = localList.findIndex(o => o.id === order.id || o.orderNumber === order.id);
  if (existingIdx >= 0) {
    localList[existingIdx] = order;
  } else {
    localList.unshift(order);
  }
  saveLocalOrders(localList);

  // Sync to Supabase
  try {
    await supabase.from('orders').update({
      status: order.status,
      statusHistory: order.statusHistory,
      updatedAt: order.updatedAt,
    }).eq('id', order.id);
  } catch (e) {}

  const formatted = formatOrder(order);
  console.log(`[+] Order ${order.id} status updated to: ${order.status}`);
  res.json({ success: true, order: formatted });
});

app.patch('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body || {};

  const localList = loadLocalOrders();
  let order = localList.find(o => o.id === id || o.orderNumber === id);

  if (!order) {
    // Try fetching from Supabase
    try {
      const { data } = await supabase.from('orders').select('*').eq('id', id).single();
      if (data) order = data;
    } catch (e) {}
  }

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  if (status) {
    order.status = status;
    const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    history.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Order updated to ${status}`,
    });
    order.statusHistory = history;
    order.updatedAt = new Date().toISOString();
  }

  // Save to local
  const existingIdx = localList.findIndex(o => o.id === order.id || o.orderNumber === order.id);
  if (existingIdx >= 0) {
    localList[existingIdx] = order;
  } else {
    localList.unshift(order);
  }
  saveLocalOrders(localList);

  // Sync to Supabase
  try {
    await supabase.from('orders').update({
      status: order.status,
      statusHistory: order.statusHistory,
      updatedAt: order.updatedAt,
    }).eq('id', order.id);
  } catch (e) {}

  const formatted = formatOrder(order);
  console.log(`[+] Order ${order.id} status updated to: ${order.status} (via PATCH)`);
  res.json({ success: true, order: formatted });
});


// ==========================================
// PRODUCT CATALOG ROUTES (SYNC FARMER & BUYER)
// ==========================================

// GET /api/products - Buyer & Farmer fetch current live catalog
app.get('/api/products', async (req, res) => {
  let mergedMap = new Map();
  catalog.forEach(p => mergedMap.set(p.name.toLowerCase(), p));

  try {
    const { data: remoteListings, error } = await supabase.from('listings').select('*');
    if (!error && Array.isArray(remoteListings)) {
      remoteListings.forEach(rl => {
        const key = rl.product_name.toLowerCase();
        const local = mergedMap.get(key) || {
          id: rl.id,
          name: rl.product_name,
          category: rl.category || (rl.is_organic ? 'Organic Produce' : 'Vegetables'),
          farmer: rl.farmer || 'Green Valley Farm',
          location: rl.location || 'Ozar, Nashik',
          quality: rl.quality || 'Verified',
          harvest: rl.harvest || 'Recent',
          description: rl.description || `Fresh ${rl.product_name} sourced directly from our farm.`,
          image: rl.image || getImageForCrop(rl.product_name),
          isAiGenerated: true,
        };
        mergedMap.set(key, {
          ...local,
          id: rl.id,
          name: rl.product_name,
          variety: rl.variety || local.variety || '',
          price: rl.price_per_unit !== undefined ? rl.price_per_unit : local.price,
          unit: rl.unit || local.unit || 'kg',
          quantity: rl.quantity_available !== undefined ? rl.quantity_available : local.quantity,
          available: rl.available !== undefined ? rl.available : local.available,
          image: rl.image || local.image,
          description: rl.description || local.description,
          category: rl.category || local.category,
          farmer: rl.farmer || local.farmer,
          location: rl.location || local.location,
        });
      });
    }
  } catch (e) {}

  const productsArray = Array.from(mergedMap.values());
  res.json({ success: true, products: productsArray });
});

// POST /api/products - Farmer adds or updates a product
app.post('/api/products', async (req, res) => {
  const p = req.body;
  if (!p) {
    return res.status(400).json({ success: false, error: 'Product payload required' });
  }

  const name = p.name || p.cropName || 'Farm Produce';
  const existingIdx = catalog.findIndex(x => x.id === p.id || x.name.toLowerCase() === name.toLowerCase());

  const formatted = {
    id: p.id || `p_${Date.now()}`,
    name: name,
    variety: p.variety || '',
    category: p.category || detectCategory(name),
    unit: p.unit || p.quantityUnit || 'kg',
    price: Number(p.price !== undefined ? p.price : (p.pricePerUnit || 50)),
    quantity: Number(p.quantity !== undefined ? p.quantity : (p.quantity_available || 100)),
    farmer: p.farmer || 'Green Valley Farm',
    location: p.location || 'Ozar, Nashik',
    quality: p.quality || 'Verified',
    harvest: p.harvest || 'Today',
    description: p.description || `Fresh ${name} sourced directly from our farm.`,
    image: p.image || getImageForCrop(name),
    isAiGenerated: true,
    available: p.available !== undefined ? Boolean(p.available) : (p.status === 'active' || p.status === undefined),
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    catalog[existingIdx] = { ...catalog[existingIdx], ...formatted };
  } else {
    catalog.unshift(formatted);
  }

  saveCatalog();
  
  // Supabase direct sync is handled by the frontends because this backend anon key is blocked by listings RLS.
  
  console.log(`[+] Product Catalog updated: ${formatted.name} (₹${formatted.price}/${formatted.unit}, Stock: ${formatted.quantity})`);
  res.json({ success: true, product: formatted, products: catalog });
});

// PUT /api/products/:id - Farmer updates stock, price, or availability
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const item = catalog.find(x => x.id === id || x.name.toLowerCase() === id.toLowerCase());
  
  if (!item) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  if (updates.price !== undefined) item.price = Number(updates.price);
  if (updates.pricePerUnit !== undefined) item.price = Number(updates.pricePerUnit);
  if (updates.quantity !== undefined) item.quantity = Number(updates.quantity);
  if (updates.quantity_available !== undefined) item.quantity = Number(updates.quantity_available);
  if (updates.available !== undefined) item.available = Boolean(updates.available);
  if (updates.status !== undefined) item.available = updates.status === 'active';
  if (updates.name) item.name = updates.name;
  if (updates.variety) item.variety = updates.variety;
  item.updatedAt = new Date().toISOString();

  saveCatalog();
  
  // Supabase direct sync is handled by the frontends because this backend anon key is blocked by listings RLS.
  
  console.log(`[+] Product ${item.name} updated: Stock=${item.quantity}, Price=₹${item.price}, Available=${item.available}`);
  res.json({ success: true, product: item, products: catalog });
});

// DELETE /api/products/:id - Farmer removes a product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const idx = catalog.findIndex(x => x.id === id || x.name.toLowerCase() === id.toLowerCase());
  if (idx >= 0) {
    const deleted = catalog.splice(idx, 1);
    saveCatalog();
    console.log(`[-] Product removed: ${deleted[0].name}`);
    return res.json({ success: true, deleted: deleted[0], products: catalog });
  }
  res.status(404).json({ success: false, error: 'Product not found' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', productsCount: catalog.length });
});

// ==========================================
// AI PRODUCE QUALITY SCANNER API
// ==========================================
const PRODUCE_KNOWLEDGE_BASE = {
  tomato: {
    cropName: 'Country Tomatoes',
    variety: 'Pusa Ruby (Desi Hybrid)',
    category: 'Vegetables',
    grade: 'Grade A',
    qualityScore: 95,
    confidence: 0.96,
    ripeness: {
      level: 'Ripe & Ready',
      percentage: 94,
      harvestWindow: 'Optimal flavor window: 4-6 days',
    },
    observations: [
      'Uniform red pigmentation with high lycopene expression',
      'Smooth, firm skin reflection with active turgidity',
      'Clean calyx detachment zone with hydrated green stem base',
      'No deep fungal bruising or soft decay detected',
    ],
    defects: ['Minor natural surface micro-line; zero skin punctures'],
    metrics: {
      surfaceGloss: '92% (High)',
      colorUniformity: '95% (Optimal)',
      firmnessScore: '92% (Firm)',
      blemishFreeRatio: '98%',
    },
    shelfLifeDays: 5,
    buyerInsights: {
      bestUse: 'Fresh salads, rich gravies, and slow-simmered curries',
      storageTip: 'Store at room temperature away from direct sunlight; avoid premature refrigeration',
      purityVerdict: 'Visually pristine farm harvest',
      matchedProductId: 'p1',
    },
    farmerInsights: {
      recommendedMandiPrice: 35,
      recommendedDirectPrice: 58,
      directProfitAdvantage: '+65% direct margin',
      marketDemand: 'Very High Demand',
      gradingRationale: 'Meets Grade A market retail standard based on size symmetry and zero rot',
    },
  },
  spinach: {
    cropName: 'Fresh Spinach',
    variety: 'All Rounder Palak',
    category: 'Leafy Greens',
    grade: 'Grade A',
    qualityScore: 93,
    confidence: 0.94,
    ripeness: {
      level: 'Freshly Harvested',
      percentage: 95,
      harvestWindow: 'Hydration window: 2-3 days',
    },
    observations: [
      'Vibrant deep green chlorophyll saturation across whole leaf lamina',
      'Turgid, crisp stems with zero wilting or limpness',
      'Unblemished leaf margins with no yellowing (chlorosis)',
      'Zero pest bite holes or chemical scorch marks visible',
    ],
    defects: ['Minor natural edge moisture variation; no slimy rot'],
    metrics: {
      surfaceGloss: '86% (Fresh)',
      colorUniformity: '94% (Deep Green)',
      firmnessScore: '90% (Crisp)',
      blemishFreeRatio: '96%',
    },
    shelfLifeDays: 3,
    buyerInsights: {
      bestUse: 'Palak paneer, dal palak, healthy green smoothies',
      storageTip: 'Refrigerate in a breathable bag or paper towel to maintain crispness',
      purityVerdict: 'Crisp and hydrated farm greens',
      matchedProductId: 'p4',
    },
    farmerInsights: {
      recommendedMandiPrice: 18,
      recommendedDirectPrice: 28,
      directProfitAdvantage: '+55% direct margin',
      marketDemand: 'High Demand',
      gradingRationale: 'Top tier freshness; dispatch immediately for maximum premium',
    },
  },
  capsicum: {
    cropName: 'Green Capsicum',
    variety: 'California Wonder',
    category: 'Vegetables',
    grade: 'Grade A',
    qualityScore: 94,
    confidence: 0.93,
    ripeness: {
      level: 'Crisp & Firm',
      percentage: 91,
      harvestWindow: 'Optimum crunch: 7-10 days',
    },
    observations: [
      'Glossy, thick-walled pericarp structure with taut skin reflection',
      'Firm 3-4 lobe symmetry without bottom indentation or soft spots',
      'Fresh green stem (pedicel) attached firmly',
      'Free from anthracnose spots or sunburn discoloration',
    ],
    defects: ['Uniform green surface with zero soft lesions'],
    metrics: {
      surfaceGloss: '95% (High Sheen)',
      colorUniformity: '92% (Rich Forest Green)',
      firmnessScore: '94% (Very Crisp)',
      blemishFreeRatio: '99%',
    },
    shelfLifeDays: 8,
    buyerInsights: {
      bestUse: 'Stir-fries, stuffed capsicum, fresh garden salads',
      storageTip: 'Store in vegetable crisper drawer; keep dry to prevent moisture build-up',
      purityVerdict: 'Premium crunchy bell pepper',
      matchedProductId: 'p3',
    },
    farmerInsights: {
      recommendedMandiPrice: 45,
      recommendedDirectPrice: 78,
      directProfitAdvantage: '+73% direct margin',
      marketDemand: 'Steady High Demand',
      gradingRationale: 'A+ Grade bell pepper standard for direct consumer sales',
    },
  },
  potato: {
    cropName: 'Farm Potatoes',
    variety: 'Kufri Jyoti',
    category: 'Root Vegetables',
    grade: 'Grade A',
    qualityScore: 92,
    confidence: 0.95,
    ripeness: {
      level: 'Cured & Ready',
      percentage: 96,
      harvestWindow: 'Storage life: 3-4 weeks',
    },
    observations: [
      'Clean, dry earthy skin with intact shallow eyes',
      'Zero greening (no solanine exposure from sunlight)',
      'Firm tuber consistency with no sponginess or sprouting',
      'No hollow heart or scab scarring detected',
    ],
    defects: ['Minor natural soil residual; zero fungal blights'],
    metrics: {
      surfaceGloss: '78% (Natural Earthy)',
      colorUniformity: '90% (Consistent Golden)',
      firmnessScore: '96% (Solid)',
      blemishFreeRatio: '95%',
    },
    shelfLifeDays: 25,
    buyerInsights: {
      bestUse: 'Roasting, mashed potatoes, daily curries, aloo parathas',
      storageTip: 'Store in cool, dark, well-ventilated space; do not store with onions',
      purityVerdict: 'Firm, naturally cured potatoes',
      matchedProductId: 'p2',
    },
    farmerInsights: {
      recommendedMandiPrice: 24,
      recommendedDirectPrice: 42,
      directProfitAdvantage: '+75% direct margin',
      marketDemand: 'Staple High Volume',
      gradingRationale: 'Cured Grade A suitable for bulk retail',
    },
  },
  onion: {
    cropName: 'Red Onions',
    variety: 'Nashik Red Special',
    category: 'Vegetables',
    grade: 'Grade A',
    qualityScore: 94,
    confidence: 0.94,
    ripeness: {
      level: 'Fully Cured',
      percentage: 95,
      harvestWindow: 'Pantry life: 4-6 weeks',
    },
    observations: [
      'Tight, dry papery outer tunic scales with deep ruby-purple hue',
      'Firm neck closure indicating proper post-harvest curing',
      'Zero premature root emergence or central shoot sprouting',
      'No black mold (Aspergillus) or basal rot marks',
    ],
    defects: ['Slight dry outer scale peeling, natural protective layer'],
    metrics: {
      surfaceGloss: '84% (Dry Sheen)',
      colorUniformity: '91% (Deep Red/Purple)',
      firmnessScore: '95% (Dense & Heavy)',
      blemishFreeRatio: '97%',
    },
    shelfLifeDays: 30,
    buyerInsights: {
      bestUse: 'Essential base for Indian curries, raw onion rings, gravies',
      storageTip: 'Keep in a cool, dry, airy place away from potatoes',
      purityVerdict: 'Well-cured pungent red onions',
      matchedProductId: 'p5',
    },
    farmerInsights: {
      recommendedMandiPrice: 28,
      recommendedDirectPrice: 49,
      directProfitAdvantage: '+75% direct margin',
      marketDemand: 'Essential Daily Commodity',
      gradingRationale: 'Cured export standard from Nashik region',
    },
  },
  carrot: {
    cropName: 'Fresh Carrots',
    variety: 'Pusa Kesar',
    category: 'Root Vegetables',
    grade: 'Grade A',
    qualityScore: 93,
    confidence: 0.92,
    ripeness: {
      level: 'Crisp & Tender',
      percentage: 93,
      harvestWindow: 'Freshness: 10-14 days',
    },
    observations: [
      'Intense orange-red pigmentation rich in beta-carotene',
      'Straight, uniform taper without bifurcation or root splitting',
      'Smooth skin with fine rootlet scars cleanly trimmed',
      'High internal core turgor with audible crisp snap',
    ],
    defects: ['Fine natural soil dusting; no cavity rot or pest grooves'],
    metrics: {
      surfaceGloss: '82% (Smooth Matte)',
      colorUniformity: '93% (Rich Orange)',
      firmnessScore: '94% (Hard & Crisp)',
      blemishFreeRatio: '96%',
    },
    shelfLifeDays: 12,
    buyerInsights: {
      bestUse: 'Gajar halwa, fresh carrot juice, winter salads, sambar',
      storageTip: 'Trim tops and refrigerate in plastic/ziploc bag with damp paper towel',
      purityVerdict: 'Sweet and crunchy winter harvest',
      matchedProductId: 'p6',
    },
    farmerInsights: {
      recommendedMandiPrice: 36,
      recommendedDirectPrice: 62,
      directProfitAdvantage: '+72% direct margin',
      marketDemand: 'High Winter Demand',
      gradingRationale: 'Top grade taper and uniform coloring',
    },
  },
  banana: {
    cropName: 'Bananas',
    variety: 'Robusta (Grand Naine)',
    category: 'Fruits',
    grade: 'Grade A',
    qualityScore: 95,
    confidence: 0.94,
    ripeness: {
      level: 'Stage 5 (Yellow with green tips)',
      percentage: 92,
      harvestWindow: 'Ripe life: 3-5 days',
    },
    observations: [
      'Clear bright yellow peel with minimal sugar flecks',
      'Full finger curvature without transit bruising or neck snapping',
      'Intact crown pedicel with clean cut',
      'No anthracnose crown rot or chilling injury',
    ],
    defects: ['Minor natural peel scratch; fruit pulp fully protected'],
    metrics: {
      surfaceGloss: '88% (Natural Wax)',
      colorUniformity: '94% (Even Yellow)',
      firmnessScore: '89% (Firm Tender)',
      blemishFreeRatio: '96%',
    },
    shelfLifeDays: 4,
    buyerInsights: {
      bestUse: 'Breakfast smoothies, direct snacking, banana bread',
      storageTip: 'Hang or keep at room temperature; do not put in fridge while ripening',
      purityVerdict: 'Naturally ripened orchard bananas',
      matchedProductId: 'p7',
    },
    farmerInsights: {
      recommendedMandiPrice: 40,
      recommendedDirectPrice: 70,
      directProfitAdvantage: '+75% direct margin',
      marketDemand: 'Year-round staple fruit',
      gradingRationale: 'Retail shelf-ready stage',
    },
  },
  guava: {
    cropName: 'Seasonal Guava',
    variety: 'Allahabad Safeda',
    category: 'Fruits',
    grade: 'Grade A',
    qualityScore: 92,
    confidence: 0.91,
    ripeness: {
      level: 'Semi-Ripe & Fragrant',
      percentage: 88,
      harvestWindow: 'Ready in 2-4 days',
    },
    observations: [
      'Light green to yellowish-white smooth skin with characteristic aroma',
      'Firm flesh with crisp crunch and high pectin content',
      'Uniform spherical fruit geometry with intact calyx ring',
      'Zero fruit fly puncture marks or fungal blotches',
    ],
    defects: ['Natural epidermal roughness near blossom end'],
    metrics: {
      surfaceGloss: '80% (Velvety)',
      colorUniformity: '89% (Pale Lime)',
      firmnessScore: '93% (Crunchy Firm)',
      blemishFreeRatio: '95%',
    },
    shelfLifeDays: 5,
    buyerInsights: {
      bestUse: 'Fresh slicing with chaat masala, jams, vitamin C rich snacking',
      storageTip: 'Ripen at room temperature, then chill',
      purityVerdict: 'Fragrant, crunchy garden guava',
      matchedProductId: 'p8',
    },
    farmerInsights: {
      recommendedMandiPrice: 42,
      recommendedDirectPrice: 76,
      directProfitAdvantage: '+80% direct margin',
      marketDemand: 'High Seasonal Favorite',
      gradingRationale: 'Clean unpunctured orchard pick',
    },
  }
};

function detectCropFromInput(hint, imageUri) {
  const combined = `${hint || ''} ${imageUri || ''}`.toLowerCase();
  for (const key of Object.keys(PRODUCE_KNOWLEDGE_BASE)) {
    if (combined.includes(key)) return key;
  }
  // Extended Hindi / common aliases for known crops
  if (combined.includes('palak') || combined.includes('methi') || combined.includes('leaf') || combined.includes('saag')) return 'spinach';
  if (combined.includes('aloo') || combined.includes('batata') || combined.includes('urulaikizhangu')) return 'potato';
  if (combined.includes('pyaz') || combined.includes('kanda') || combined.includes('vengayam')) return 'onion';
  if (combined.includes('gajar') || combined.includes('beet') || combined.includes('beetroot') || combined.includes('radish') || combined.includes('mooli')) return 'carrot';
  if (combined.includes('pepper') || combined.includes('chilli') || combined.includes('mirch') || combined.includes('shimla') || combined.includes('bell pepper')) return 'capsicum';
  if (combined.includes('kela') || combined.includes('pazham')) return 'banana';
  if (combined.includes('amrud')) return 'guava';
  if (combined.includes('tamatar') || combined.includes('thakkali')) return 'tomato';
  // No match — return null so the endpoint can build a generic result
  return null;
}

// POST /api/scan - AI Produce Scanner Endpoint (Gemini-powered)
app.post('/api/scan', async (req, res) => {
  const { image, cropHint, role } = req.body || {};
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  // ── Try live Gemini analysis first ─────────────────────────────────────────
  if (GEMINI_API_KEY && (cropHint || image)) {
    try {
      const prompt = `You are an expert agricultural quality inspector for Indian farm produce.
Analyze the provided image and/or crop hint: "${cropHint || ''}".
Role requesting analysis: ${role || 'general'}

IMPORTANT:
- Do NOT assume the produce is tomato.
- Identify the actual vegetable, fruit, or farm produce visible.
- Return ONLY valid JSON (no markdown fences, no explanation) with this exact structure:
{
  "cropName": "<proper name of the crop, e.g. Red Onions, Fresh Potatoes, Spinach, etc.>",
  "variety": "<common Indian variety or 'Local Variety'>",
  "category": "<Vegetables|Fruits|Leafy Greens|Grains|Spices>",
  "grade": "<Grade A|Grade B|Grade C>",
  "qualityScore": 92,
  "confidence": 0.95,
  "ripeness": {
    "level": "<ripeness description>",
    "percentage": 92,
    "harvestWindow": "<e.g. Ready now / Ready in 2-3 days>"
  },
  "observations": [
    "<detailed visual observation 1>",
    "<detailed visual observation 2>",
    "<detailed visual observation 3>",
    "<detailed visual observation 4>"
  ],
  "defects": ["<any minor defect or 'No significant defects observed'>"],
  "metrics": {
    "surfaceGloss": "90%",
    "colorUniformity": "93%",
    "firmnessScore": "89%",
    "blemishFreeRatio": "96%"
  },
  "shelfLifeDays": 5,
  "buyerInsights": {
    "bestUse": "<cooking uses or consumption suggestions>",
    "storageTip": "<storage advice>",
    "purityVerdict": "<one-line freshness verdict>",
    "matchedProductId": ""
  },
  "farmerInsights": {
    "recommendedMandiPrice": 35,
    "recommendedDirectPrice": 58,
    "directProfitAdvantage": "+65% direct margin",
    "marketDemand": "High Demand",
    "gradingRationale": "<brief grading reason>"
  }
}`;

      const parts = [{ text: prompt }];
      if (image && typeof image === 'string' && (image.startsWith('data:image/') || image.length > 200)) {
        const cleanBase64 = image.replace(/^data:image\/[a-z]+;base64,/i, '').trim();
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      const geminiRes = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts }],
          }),
        }
      );

      if (!geminiRes.ok) {
        const errBody = await geminiRes.text();
        throw new Error(`Gemini HTTP ${geminiRes.status}: ${errBody}`);
      }

      const geminiData = await geminiRes.json();
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const jsonText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      const aiResult = JSON.parse(jsonText);

      const result = {
        ...aiResult,
        scannedImage: image || getImageForCrop(aiResult.cropName),
        scannedAt: new Date().toISOString(),
        displayTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        disclaimer: 'AI-generated quality analysis powered by Google Gemini. Does not replace laboratory food-safety or chemical residue testing.',
        aiPowered: true,
      };

      console.log(`[AI SCAN ✨ Gemini] ${result.cropName} — ${result.grade}, Score: ${result.qualityScore}% | role=${role || 'general'}`);
      return res.json({ success: true, result });

    } catch (err) {
      console.warn('[AI SCAN] Gemini call failed, falling back to knowledge base:', err.message);
    }
  }

  // ── Fallback: local knowledge base ─────────────────────────────────────────
  const detectedKey = detectCropFromInput(cropHint, image);

  let template;
  if (detectedKey && PRODUCE_KNOWLEDGE_BASE[detectedKey]) {
    template = PRODUCE_KNOWLEDGE_BASE[detectedKey];
  } else {
    const displayName = cropHint
      ? cropHint.trim().replace(/\b\w/g, c => c.toUpperCase())
      : 'Farm Produce';
    template = {
      cropName: displayName,
      variety: 'Local Variety',
      category: detectCategory(displayName),
      grade: 'Grade A',
      qualityScore: 88,
      confidence: 0.85,
      ripeness: { level: 'Ripe & Ready', percentage: 85, harvestWindow: 'Harvest now for best quality' },
      observations: [
        'Good surface appearance with natural colour',
        'Firm texture indicating fresh quality',
        'Consistent size and shape',
        'Free from visible pest damage',
      ],
      defects: ['Minor natural surface variations within acceptable range'],
      metrics: {
        surfaceGloss: '85% (Good)',
        colorUniformity: '88% (Even)',
        firmnessScore: '87% (Firm)',
        blemishFreeRatio: '93%',
      },
      shelfLifeDays: 5,
      buyerInsights: {
        bestUse: 'Cooking, fresh consumption as appropriate for crop type',
        storageTip: 'Store in a cool dry place; refrigerate if perishable',
        purityVerdict: 'Farm-fresh quality',
        matchedProductId: '',
      },
      farmerInsights: {
        recommendedMandiPrice: 40,
        recommendedDirectPrice: 70,
        directProfitAdvantage: '+75% direct margin vs. mandi',
        marketDemand: 'Moderate to High',
        gradingRationale: 'Visual surface quality assessment',
      },
    };
  }

  const result = {
    ...template,
    scannedImage: image || getImageForCrop(template.cropName),
    scannedAt: new Date().toISOString(),
    displayTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    disclaimer: 'AI-generated visible surface quality estimate. Does not replace laboratory food-safety or chemical residue testing.',
    aiPowered: false,
  };

  console.log(`[AI SCAN 📋 Local] ${result.cropName} — ${result.grade}, Score: ${result.qualityScore}% | role=${role || 'general'}`);
  res.json({ success: true, result });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FarmDirect Integration Server running on http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;

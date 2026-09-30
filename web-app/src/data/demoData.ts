// ─── Demo Data ────────────────────────────────────────────────────────────────

const now = new Date().toISOString();
const today = new Date().toISOString().split('T')[0];

const daysAgo = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0];
};
const daysAhead = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0];
};
const hoursAgo = (h: number) => {
  const d = new Date(); d.setHours(d.getHours() - h); return d.toISOString();
};

// ─── Farm ─────────────────────────────────────────────────────────────────────
export const demoFarm = {
  name: 'Green Valley Farm',
  totalArea: 24.5,
  cultivatedArea: 15.2,
  areaUnit: 'acres',
  soilType: 'Black Cotton',
  irrigationType: 'Drip',
  farmingMethod: 'Conventional',
  village: 'Ozar',
  district: 'Nashik',
  state: 'Maharashtra',
  pincode: '422206',
};

// ─── Crops ────────────────────────────────────────────────────────────────────
export const demoCrops = [
  {
    id: 'crop-001', name: 'Tomato', variety: 'Pusa Ruby', category: 'Vegetables',
    plantingDate: daysAgo(75), expectedHarvestDate: daysAhead(5),
    area: 5.2, areaUnit: 'acres', estimatedYield: 1200, yieldUnit: 'kg',
    status: 'ready_to_harvest', field: 'Field 1 – South Block',
    notes: 'Excellent growth this season. Ready for harvest in 5–7 days.',
  },
  {
    id: 'crop-002', name: 'Onion', variety: 'Red Nashik', category: 'Vegetables',
    plantingDate: daysAgo(90), expectedHarvestDate: daysAhead(30),
    area: 8.0, areaUnit: 'acres', estimatedYield: 3200, yieldUnit: 'kg',
    status: 'growing', field: 'Field 2 – North Block',
    notes: 'Growing well. Irrigation check needed on Field 2.',
  },
  {
    id: 'crop-003', name: 'Spinach', variety: 'All Rounder', category: 'Vegetables',
    plantingDate: daysAgo(30), expectedHarvestDate: daysAgo(7),
    actualHarvestDate: daysAgo(7),
    area: 2.0, areaUnit: 'acres', estimatedYield: 400, yieldUnit: 'kg',
    status: 'harvested', field: 'Field 3 – East Block',
    notes: 'Harvested last week. Good quality batch.',
  },
];

// ─── Listings ─────────────────────────────────────────────────────────────────
export const demoListings = [
  {
    id: 'listing-001', cropName: 'Fresh Tomatoes', variety: 'Pusa Ruby',
    quantity: 350, quantityUnit: 'kg', pricePerUnit: 58,
    minimumOrder: 5, quality: 'A', harvestDate: today,
    pickupLocation: 'Green Valley Farm, Ozar, Nashik',
    deliveryOptions: ['Pickup', 'Delivery'],
    description: 'Fresh farm-picked tomatoes with deep red color and firm texture.',
    status: 'active', views: 48, inquiries: 12,
    emoji: '🍅', createdAt: hoursAgo(24),
  },
  {
    id: 'listing-002', cropName: 'Red Onions', variety: 'Nashik Special',
    quantity: 600, quantityUnit: 'kg', pricePerUnit: 49,
    minimumOrder: 10, quality: 'A', harvestDate: today,
    pickupLocation: 'Green Valley Farm, Ozar, Nashik',
    deliveryOptions: ['Pickup', 'Delivery'],
    description: 'Premium Nashik red onions. Dry-cured, ideal for wholesale or retail.',
    status: 'active', views: 35, inquiries: 8,
    emoji: '🧅', createdAt: hoursAgo(48),
  },
  {
    id: 'listing-003', cropName: 'Farm Potatoes', variety: 'Kufri Jyoti',
    quantity: 500, quantityUnit: 'kg', pricePerUnit: 42,
    minimumOrder: 10, quality: 'A', harvestDate: today,
    pickupLocation: 'Green Valley Farm, Ozar, Nashik',
    deliveryOptions: ['Pickup', 'Delivery'],
    description: 'Naturally grown, clean potatoes with consistent size and firm texture.',
    status: 'active', views: 29, inquiries: 6,
    emoji: '🥔', createdAt: hoursAgo(72),
  },
  {
    id: 'listing-004', cropName: 'Fresh Spinach', variety: 'All Rounder Palak',
    quantity: 90, quantityUnit: 'kg', pricePerUnit: 28,
    minimumOrder: 2, quality: 'A', harvestDate: today,
    pickupLocation: 'Green Valley Farm, Ozar, Nashik',
    deliveryOptions: ['Pickup', 'Delivery'],
    description: 'Tender, fresh green spinach bundles harvested early morning.',
    status: 'active', views: 41, inquiries: 9,
    emoji: '🥬', createdAt: hoursAgo(8),
  },
  {
    id: 'listing-005', cropName: 'Green Capsicum', variety: 'California Wonder',
    quantity: 140, quantityUnit: 'kg', pricePerUnit: 78,
    minimumOrder: 5, quality: 'A', harvestDate: today,
    pickupLocation: 'Green Valley Farm, Ozar, Nashik',
    deliveryOptions: ['Pickup', 'Delivery'],
    description: 'Crisp bell peppers with shiny skin and thick walls. Premium grading.',
    status: 'paused', views: 22, inquiries: 5,
    emoji: '🫑', createdAt: hoursAgo(36),
  },
];

// ─── Orders ───────────────────────────────────────────────────────────────────
export const demoOrders = [
  {
    id: 'order-001', orderNumber: 'FD1042',
    buyerName: 'Suresh Kapoor', buyerBiz: 'FreshMart Wholesale', buyerType: 'Wholesaler',
    buyerPhone: '+91 98001 12345', buyerVerified: true, buyerRating: 4.8,
    cropName: 'Tomato', variety: 'Pusa Ruby', quantity: 80, unit: 'kg',
    pricePerUnit: 42, totalAmount: 3360,
    deliveryType: 'Pickup', pickupDate: daysAhead(1),
    status: 'new', paymentStatus: 'pending',
    buyerInstructions: 'Please pack in 10 kg bags. Will arrive by 8 AM.',
    createdAt: hoursAgo(2),
    statusHistory: [{ status: 'new', timestamp: hoursAgo(2) }],
  },
  {
    id: 'order-002', orderNumber: 'FD1038',
    buyerName: 'Priya Sharma', buyerBiz: 'Mumbai Fresh Markets', buyerType: 'Retailer',
    buyerPhone: '+91 90002 67890', buyerVerified: true, buyerRating: 4.5,
    cropName: 'Onion', variety: 'Red Nashik', quantity: 120, unit: 'kg',
    pricePerUnit: 28, totalAmount: 3360,
    deliveryType: 'Delivery', deliveryAddress: 'Crawford Market, Fort, Mumbai – 400001',
    expectedDeliveryDate: daysAhead(2),
    status: 'preparing', paymentStatus: 'pending',
    buyerInstructions: '',
    createdAt: hoursAgo(48),
    statusHistory: [
      { status: 'new', timestamp: hoursAgo(48) },
      { status: 'accepted', timestamp: hoursAgo(46) },
      { status: 'preparing', timestamp: hoursAgo(24) },
    ],
  },
  {
    id: 'order-003', orderNumber: 'FD1035',
    buyerName: 'Arjun Nair', buyerBiz: 'Green Veggies Co', buyerType: 'Retailer',
    buyerPhone: '+91 70003 11111', buyerVerified: false, buyerRating: 4.2,
    cropName: 'Spinach', variety: 'All Rounder', quantity: 50, unit: 'kg',
    pricePerUnit: 35, totalAmount: 1750,
    deliveryType: 'Pickup', status: 'delivered', paymentStatus: 'paid',
    buyerInstructions: '',
    createdAt: hoursAgo(120),
    statusHistory: [
      { status: 'new', timestamp: hoursAgo(120) },
      { status: 'accepted', timestamp: hoursAgo(118) },
      { status: 'preparing', timestamp: hoursAgo(72) },
      { status: 'ready', timestamp: hoursAgo(48) },
      { status: 'picked_up', timestamp: hoursAgo(24) },
      { status: 'delivered', timestamp: hoursAgo(6) },
    ],
  },
  {
    id: 'order-004', orderNumber: 'FD1031',
    buyerName: 'Vikram Singh', buyerBiz: 'Mumbai Fresh Markets', buyerType: 'Wholesaler',
    buyerPhone: '+91 98111 44444', buyerVerified: true, buyerRating: 4.7,
    cropName: 'Tomato', variety: 'Pusa Ruby', quantity: 200, unit: 'kg',
    pricePerUnit: 40, totalAmount: 8000,
    deliveryType: 'Delivery', deliveryAddress: 'APMC Vashi, Navi Mumbai',
    status: 'delivered', paymentStatus: 'paid',
    buyerInstructions: 'Grade A only, crates required.',
    createdAt: hoursAgo(168),
    statusHistory: [
      { status: 'new', timestamp: hoursAgo(168) },
      { status: 'accepted', timestamp: hoursAgo(166) },
      { status: 'preparing', timestamp: hoursAgo(120) },
      { status: 'ready', timestamp: hoursAgo(96) },
      { status: 'picked_up', timestamp: hoursAgo(72) },
      { status: 'delivered', timestamp: hoursAgo(48) },
    ],
  },
];

// ─── Market Prices ────────────────────────────────────────────────────────────
export const demoMarketPrices = [
  { id: 'p1', crop: 'Tomato', market: 'Nashik Mandi', min: 32, max: 42, modal: 38, unit: 'kg', trend: 'up', trendPct: 8.2 },
  { id: 'p2', crop: 'Tomato', market: 'Mumbai APMC', min: 38, max: 48, modal: 42, unit: 'kg', trend: 'up', trendPct: 5.0 },
  { id: 'p3', crop: 'Tomato', market: 'FarmDirect', min: 42, max: 45, modal: 43, unit: 'kg', trend: 'stable', trendPct: 0 },
  { id: 'p4', crop: 'Onion', market: 'Nashik Mandi', min: 22, max: 30, modal: 26, unit: 'kg', trend: 'down', trendPct: -3.5 },
  { id: 'p5', crop: 'Spinach', market: 'Nashik Mandi', min: 28, max: 40, modal: 35, unit: 'kg', trend: 'stable', trendPct: 1.2 },
  { id: 'p6', crop: 'Mango', market: 'Pune APMC', min: 60, max: 120, modal: 90, unit: 'kg', trend: 'up', trendPct: 12.5 },
];

// ─── Buyer Requests ───────────────────────────────────────────────────────────
export const demoBuyerRequests = [
  {
    id: 'req-001', buyerName: 'Vikram Singh', buyerBiz: 'Mumbai Fresh Markets',
    buyerType: 'Wholesaler', buyerVerified: true, buyerRating: 4.7,
    crop: 'Tomato', quantity: 500, unit: 'kg', offeredPrice: 42,
    requiredDate: daysAhead(2), location: 'Navi Mumbai', distance: 48,
    notes: 'Need grade A quality, packed in crates',
  },
  {
    id: 'req-002', buyerName: 'Anita Joshi', buyerBiz: 'Star Restaurants Group',
    buyerType: 'Restaurant', buyerVerified: true, buyerRating: 4.9,
    crop: 'Spinach', quantity: 100, unit: 'kg', offeredPrice: 38,
    requiredDate: daysAhead(1), location: 'Mumbai', distance: 65,
    notes: 'Fresh organic preferred, weekly supply needed',
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const demoNotifications = [
  {
    id: 'n1', type: 'new_order', title: '🔔 New Order Received!',
    body: 'FreshMart has purchased 80 kg of your Tomatoes for ₹3,360',
    isRead: false, createdAt: hoursAgo(2),
  },
  {
    id: 'n2', type: 'market_alert', title: '📈 Tomato prices increased',
    body: 'Tomato prices at Nashik Mandi went up by 8% today. Current: ₹38/kg',
    isRead: false, createdAt: hoursAgo(5),
  },
  {
    id: 'n3', type: 'weather_alert', title: '🌧️ Rain expected tonight',
    body: 'Light rainfall expected tonight. Consider delaying irrigation on Field 2.',
    isRead: true, createdAt: hoursAgo(8),
  },
  {
    id: 'n4', type: 'payment_received', title: '💰 Payment Received',
    body: 'Green Veggies Co paid ₹1,750 for Order #FD1035',
    isRead: true, createdAt: hoursAgo(6),
  },
];

// ─── Weather ──────────────────────────────────────────────────────────────────
export const demoWeather = {
  temperature: 28, humidity: 65, rainfall: 0, rainfallProbability: 30,
  windSpeed: 12, windDirection: 'NW', condition: 'partly_cloudy',
  description: 'Partly cloudy with mild humidity',
  farmingAdvice: 'Good conditions for fieldwork. Rain expected tonight — consider delaying irrigation on Field 2.',
};

// ─── Earnings Summary ─────────────────────────────────────────────────────────
export const demoEarnings = {
  today: 3360,
  thisWeek: 14870,
  thisMonth: 42350,
  total: 128900,
  pending: 6720,
  completed: 122180,
};

// ─── Monthly Revenue (bar chart data) ─────────────────────────────────────────
export const demoMonthlyRevenue = [
  { month: 'Apr', amount: 8200 },
  { month: 'May', amount: 11400 },
  { month: 'Jun', amount: 9800 },
  { month: 'Jul', amount: 13600 },
  { month: 'Aug', amount: 16200 },
  { month: 'Sep', amount: 14870 },
];

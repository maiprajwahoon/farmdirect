import { Asset } from 'expo-asset';

const resolve = (img) => Asset.fromModule(img).uri;

export const products = [
  {
    id: 'p1', name: 'Fresh Tomatoes', category: 'Vegetables', unit: 'kg', price: 58, farmer: 'Green Valley Farm', location: 'Palghar, MH', quality: 'Verified', harvest: 'Today',
    description: 'Firm red tomatoes sourced directly from a local farm. Great for curries, salads and everyday cooking.',
    image: resolve(require('../assets/produce/tomatoes.jpg')),
    isAiGenerated: true
  },
  {
    id: 'p2', name: 'Farm Potatoes', category: 'Root Vegetables', unit: 'kg', price: 42, farmer: 'Sunrise Fields', location: 'Nashik, MH', quality: 'Verified', harvest: '2 days ago',
    description: 'Everyday cooking potatoes with a natural earthy finish and reliable availability.',
    image: resolve(require('../assets/produce/potatoes.jpg')),
    isAiGenerated: true
  },
  {
    id: 'p3', name: 'Green Capsicum', category: 'Vegetables', unit: '500 g', price: 39, farmer: 'Kokan Fresh', location: 'Thane, MH', quality: 'Verified', harvest: 'Today',
    description: 'Crunchy green capsicum supplied by a nearby grower. Great for stir-fries and stuffed dishes.',
    image: resolve(require('../assets/produce/capsicum.jpg')),
    isAiGenerated: true
  },
  {
    id: 'p4', name: 'Fresh Spinach', category: 'Leafy Greens', unit: 'bundle', price: 28, farmer: 'Village Greens', location: 'Boisar, MH', quality: 'Verified', harvest: 'Today',
    description: 'Fresh leafy greens picked close to dispatch. Availability can change quickly by harvest.',
    image: resolve(require('../assets/produce/spinach.jpg')),
    isAiGenerated: true
  },
  {
    id: 'p5', name: 'Red Onions', category: 'Vegetables', unit: 'kg', price: 49, farmer: 'Deccan Roots', location: 'Pune, MH', quality: 'Verified', harvest: '1 day ago',
    description: 'Red onions with a balanced bite for everyday cooking and fresh salads.',
    image: resolve(require('../assets/produce/onions.jpg')),
    isAiGenerated: true
  },
  {
    id: 'p6', name: 'Fresh Carrots', category: 'Root Vegetables', unit: 'kg', price: 62, farmer: 'Hill Crest Produce', location: 'Mahabaleshwar, MH', quality: 'Verified', harvest: 'Today',
    description: 'Fresh carrots with a crisp texture. Seller details and visual quality information are shown transparently.',
    image: resolve(require('../assets/produce/carrots.jpg')),
    isAiGenerated: true
  },
  {
    id: 'p7', name: 'Bananas', category: 'Fruits', unit: 'dozen', price: 70, farmer: 'Konkan Orchard', location: 'Ratnagiri, MH', quality: 'Verified', harvest: '1 day ago',
    description: 'Naturally ripening bananas supplied by a local orchard.',
    image: resolve(require('../assets/produce/bananas.jpg')),
    isAiGenerated: true
  },
  {
    id: 'p8', name: 'Seasonal Guava', category: 'Seasonal Picks', unit: 'kg', price: 76, farmer: 'Green Basket Farm', location: 'Vasai, MH', quality: 'Verified', harvest: 'Today',
    description: 'Seasonal guava selection. Availability depends on current harvest and seller stock.',
    image: resolve(require('../assets/produce/guava.jpg')),
    isAiGenerated: true
  }
];

export const categories = [
  { key: 'Vegetables', icon: '🥕' },
  { key: 'Fruits', icon: '🍎' },
  { key: 'Leafy Greens', icon: '🥬' },
  { key: 'Root Vegetables', icon: '🥔' },
  { key: 'Organic Produce', icon: '🌱' },
  { key: 'Seasonal Picks', icon: '☀️' }
];

export const demoOrders = [
  {
    id: 'FD-240924-081', date: '24 Sep 2026', items: [{ productId: 'p1', qty: 1 }, { productId: 'p4', qty: 2 }], total: 114,
    status: 'Out for Delivery', farmer: 'Green Valley Farm', address: 'Virar East, Maharashtra', eta: 'Today, 6:30 PM'
  },
  {
    id: 'FD-220924-044', date: '22 Sep 2026', items: [{ productId: 'p2', qty: 2 }], total: 84,
    status: 'Delivered', farmer: 'Sunrise Fields', address: 'Virar East, Maharashtra', eta: 'Delivered 23 Sep'
  }
];

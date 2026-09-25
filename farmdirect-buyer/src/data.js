export const products = [
  {
    id: 'p1', name: 'Fresh Tomatoes', category: 'Vegetables', unit: 'kg', price: 58, farmer: 'Green Valley Farm', location: 'Palghar, MH', quality: 'Verified', harvest: 'Today',
    description: 'Firm red tomatoes sourced directly from a local farm. Great for curries, salads and everyday cooking.',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p2', name: 'Farm Potatoes', category: 'Root Vegetables', unit: 'kg', price: 42, farmer: 'Sunrise Fields', location: 'Nashik, MH', quality: 'Not verified', harvest: '2 days ago',
    description: 'Everyday cooking potatoes with a natural earthy finish and reliable availability.',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p3', name: 'Green Capsicum', category: 'Vegetables', unit: '500 g', price: 39, farmer: 'Kokan Fresh', location: 'Thane, MH', quality: 'Pending', harvest: 'Today',
    description: 'Crunchy green capsicum supplied by a nearby grower. Great for stir-fries and stuffed dishes.',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p4', name: 'Fresh Spinach', category: 'Leafy Greens', unit: 'bundle', price: 28, farmer: 'Village Greens', location: 'Boisar, MH', quality: 'Verified', harvest: 'Today',
    description: 'Fresh leafy greens picked close to dispatch. Availability can change quickly by harvest.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p5', name: 'Red Onions', category: 'Vegetables', unit: 'kg', price: 49, farmer: 'Deccan Roots', location: 'Pune, MH', quality: 'Verified', harvest: '1 day ago',
    description: 'Red onions with a balanced bite for everyday cooking and fresh salads.',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784720?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p6', name: 'Fresh Carrots', category: 'Root Vegetables', unit: 'kg', price: 62, farmer: 'Hill Crest Produce', location: 'Mahabaleshwar, MH', quality: 'Pending', harvest: 'Today',
    description: 'Fresh carrots with a crisp texture. Seller details and visual quality information are shown transparently.',
    image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p7', name: 'Bananas', category: 'Fruits', unit: 'dozen', price: 70, farmer: 'Konkan Orchard', location: 'Ratnagiri, MH', quality: 'Not verified', harvest: '1 day ago',
    description: 'Naturally ripening bananas supplied by a local orchard.',
    image: 'https://images.unsplash.com/photo-1574226516831-e1dff420e37f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p8', name: 'Seasonal Guava', category: 'Seasonal Picks', unit: 'kg', price: 76, farmer: 'Green Basket Farm', location: 'Vasai, MH', quality: 'Pending', harvest: 'Today',
    description: 'Seasonal guava selection. Availability depends on current harvest and seller stock.',
    image: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&w=900&q=80'
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

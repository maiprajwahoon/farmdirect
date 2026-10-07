const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'web-app/src/lib/api.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import { API_BASE } from './supabase'", "import { API_BASE, supabase } from './supabase'");

content = content.replace(
  /async getProducts\(\): Promise<Product\[\]> \{[\s\S]*?return data.products \?\? \[\]\n  \},/m,
`async getProducts(): Promise<Product[]> {
    try {
      const data = await apiFetch('/api/products')
      return data.products ?? []
    } catch (err) {
      console.warn("Node backend unreachable, fetching products from Supabase", err);
      const { data } = await supabase.from('listings').select('*').eq('available', true);
      if (!data) return [];
      return data.map(row => ({
        id: row.id,
        name: row.crop_name || row.name,
        variety: row.variety || '',
        category: row.category || 'Vegetables',
        farmer: row.farmer || 'Unknown Farmer',
        description: row.description || '',
        image: row.image || 'https://placehold.co/600x400/eeeeee/999999?text=Produce',
        unit: row.quantity_unit || 'kg',
        price: row.price_per_unit || 0,
        quantity: row.quantity_available || 0,
        location: row.location || 'Unknown',
        quality: row.quality_grade || 'Standard',
        harvest: 'Recently',
        isAiGenerated: false,
        available: row.available !== false
      })) as Product[];
    }
  },`
);

content = content.replace(
  /async addProduct\(p: Partial<Product>\): Promise<Product> \{[\s\S]*?return data.product\n  \},/m,
`async addProduct(p: Partial<Product>): Promise<Product> {
    try {
      const data = await apiFetch('/api/products', { method: 'POST', body: JSON.stringify(p) })
      return data.product
    } catch (err) {
      console.warn("Node backend unreachable, adding product to Supabase directly");
      const { data, error } = await supabase.from('listings').insert({
        farmer_id: 'local',
        crop_name: p.name,
        variety: p.variety,
        quantity_available: p.quantity,
        quantity_unit: p.unit,
        price_per_unit: p.price,
        location: p.location,
        quality_grade: p.quality,
        category: p.category,
        farmer: p.farmer,
        description: p.description,
        image: p.image,
        available: p.available !== false
      }).select().single();
      if (error) throw error;
      return { ...p, id: data.id } as Product;
    }
  },`
);

content = content.replace(
  /async getOrders\(\): Promise<Order\[\]> \{[\s\S]*?return data.orders \?\? \[\]\n  \},/m,
`async getOrders(): Promise<Order[]> {
    try {
      const data = await apiFetch('/api/orders')
      return data.orders ?? []
    } catch (err) {
      console.warn("Node backend unreachable, fetching orders from Supabase", err);
      const { data } = await supabase.from('orders').select('*');
      if (!data) return [];
      return data.map(row => ({
        id: row.id,
        orderNumber: row.id.split('-')[0],
        buyerId: row.buyer_id,
        farmerId: row.farmer_id,
        cropName: row.crop_name,
        quantity: row.quantity,
        quantityUnit: row.quantity_unit,
        pricePerUnit: row.price_per_unit,
        totalAmount: row.total_amount,
        total: row.total_amount,
        status: row.status,
        createdAt: row.created_at,
        buyer: typeof row.buyer === 'string' ? JSON.parse(row.buyer) : (row.buyer || {}),
        items: (typeof row.buyer === 'string' ? JSON.parse(row.buyer).items : (row.buyer?.items)) || [{
          productId: 'fake', productName: row.crop_name, quantity: row.quantity, unit: row.quantity_unit, price: row.price_per_unit, image: 'https://placehold.co/600x400/eeeeee/999999?text=Produce'
        }]
      })) as Order[];
    }
  },`
);

content = content.replace(
  /async placeOrder\(payload: Record<string, unknown>\): Promise<Order> \{[\s\S]*?return data.order\n  \},/m,
`async placeOrder(payload: Record<string, unknown>): Promise<Order> {
    try {
      const data = await apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(payload) })
      return data.order
    } catch (err) {
      console.warn("Node backend unreachable, placing order to Supabase directly");
      const { data, error } = await supabase.from('orders').insert({
        buyer_id: payload.buyerId || 'local',
        farmer_id: payload.farmerId || 'local',
        crop_name: payload.cropName || 'Order',
        quantity: payload.quantity || 1,
        quantity_unit: payload.quantityUnit || 'item',
        price_per_unit: payload.pricePerUnit || payload.total,
        total_amount: payload.totalAmount || payload.total,
        status: 'new',
        buyer: payload.buyer
      }).select().single();
      if (error) throw error;
      return { ...payload, id: data.id } as Order;
    }
  },`
);

fs.writeFileSync(file, content);
console.log('done');

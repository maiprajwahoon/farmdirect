// Central API layer — mirrors farmdirect-buyer/src/services/mockApi.js
import { API_BASE, supabase } from './supabase'

export type Product = {
  id: string; name: string; variety: string; category: string
  unit: string; price: number; quantity: number; farmer: string
  location: string; quality: string; harvest: string
  description: string; image: string; isAiGenerated: boolean; available: boolean
}

export type Order = {
  id: string; orderNumber: string; buyerId: string; farmerId: string
  cropName: string; variety: string; quantity: number; quantityUnit: string
  pricePerUnit: number; totalAmount: number; total: number
  items: OrderItem[]; farmer: string; deliveryType: string
  deliveryAddress: string; deliverySlot: string; slot: string
  status: string; statusHistory: { status: string; timestamp: string; note?: string }[]
  paymentStatus: string; paymentMethod: string
  buyer: BuyerInfo; photos: string[]
  createdAt: string; updatedAt: string
  buyerInstructions?: string
}

export type OrderItem = {
  productId: string; productName: string; variety: string
  quantity: number; unit: string; price: number; image: string
}

export type BuyerInfo = {
  id: string; name: string; businessName: string; businessType?: string
  email?: string; phone: string; address: string; district: string; state: string
  isVerified: boolean; rating: number; deliverySlot: string
}

export type ScanResult = {
  cropName: string; variety: string; grade: string; qualityScore: number
  confidence: number; ripeness: { level: string; percentage: number; harvestWindow: string }
  observations: string[]; defects: string[]
  metrics: { surfaceGloss: string; colorUniformity: string; firmnessScore: string; blemishFreeRatio: string }
  shelfLifeDays: number
  buyerInsights: { bestUse: string; storageTip: string; purityVerdict: string; matchedProductId: string }
  farmerInsights: { recommendedMandiPrice: number; recommendedDirectPrice: number; directProfitAdvantage: string; marketDemand: string; gradingRationale: string }
  scannedImage: string; scannedAt: string; displayTime: string; disclaimer: string
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

// ── Products ──────────────────────────────────────────────────────────────────
export const api = {
  async getProducts(): Promise<Product[]> {
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
  },

  async addProduct(p: Partial<Product>): Promise<Product> {
    try {
      const data = await apiFetch('/api/products', { method: 'POST', body: JSON.stringify(p) })
      return data.product
    } catch (err) {
      console.warn("Node backend unreachable, adding product to Supabase directly");
      const richPayload = {
        farmer_id: '11111111-1111-1111-1111-111111111111',
        product_name: p.name,
        variety: p.variety,
        quantity_available: p.quantity,
        unit: p.unit,
        price_per_unit: p.price,
        location: p.location,
        quality_grade: p.quality,
        category: p.category,
        farmer: p.farmer,
        description: p.description,
        image: p.image,
        available: p.available !== false
      };
      let { data, error } = await supabase.from('listings').insert(richPayload).select().single();
      
      // Fallback if columns are missing
      if (error && error.code === '42703') {
        const minimalPayload = {
          farmer_id: '11111111-1111-1111-1111-111111111111',
          product_name: p.name,
          variety: p.variety,
          quantity_available: p.quantity,
          unit: p.unit,
          price_per_unit: p.price,
          is_organic: p.category?.toLowerCase().includes('organic') || false
        };
        const fallback = await supabase.from('listings').insert(minimalPayload).select().single();
        data = fallback.data;
        error = fallback.error;
      }
      
      if (error) throw error;
      return { ...p, id: data?.id || `local-${Date.now()}` } as Product;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const data = await apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
      return data.product
    } catch (err) {
      console.warn("Node backend unreachable, updating product in Supabase directly");
      
      const payload: any = {};
      if (updates.name !== undefined) payload.product_name = updates.name;
      if (updates.quantity !== undefined) payload.quantity_available = updates.quantity;
      if (updates.price !== undefined) payload.price_per_unit = updates.price;
      if (updates.available !== undefined) payload.available = updates.available;
      
      let { data, error } = await supabase.from('listings').update(payload).eq('id', id).select().single();
      if (error) throw error;
      
      return { id, ...updates, ...data } as Product;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' })
  },

  // ── Orders ─────────────────────────────────────────────────────────────────
  async getOrders(): Promise<Order[]> {
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
  },

  async placeOrder(payload: Record<string, unknown>): Promise<Order> {
    try {
      const data = await apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(payload) })
      return data.order
    } catch (err) {
      console.warn("Node backend unreachable, placing order to Supabase directly");
      const { data, error } = await supabase.from('orders').insert({
        buyerId: payload.buyerId || 'local',
        farmerId: payload.farmerId || 'local',
        cropName: payload.cropName || 'Order',
        quantity: payload.quantity || 1,
        quantityUnit: payload.quantityUnit || 'item',
        pricePerUnit: payload.pricePerUnit || payload.total,
        totalAmount: payload.totalAmount || payload.total,
        status: 'new',
        buyer: payload.buyer
      }).select().single();
      if (error) throw error;
      return { ...payload, id: data.id } as Order;
    }
  },

  async updateOrderStatus(id: string, status: string, note?: string): Promise<Order> {
    try {
      const data = await apiFetch(`/api/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, note }),
      })
      return data.order
    } catch (err) {
      console.warn("Node backend unreachable, updating order in Supabase directly");
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return data as unknown as Order;
    }
  },

  // ── AI Scanner ─────────────────────────────────────────────────────────────
  async scanProduce(imageUri: string, cropHint = '', role = 'buyer'): Promise<ScanResult> {
    const data = await apiFetch('/api/scan', {
      method: 'POST',
      body: JSON.stringify({ image: imageUri, cropHint, role }),
    })
    return data.result
  },

  // ── Health ─────────────────────────────────────────────────────────────────
  async health(): Promise<boolean> {
    try {
      const data = await apiFetch('/api/health')
      return data.status === 'ok'
    } catch {
      return false
    }
  },
}

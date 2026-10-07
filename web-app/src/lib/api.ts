// Central API layer — mirrors farmdirect-buyer/src/services/mockApi.js
import { API_BASE } from './supabase'

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
    const data = await apiFetch('/api/products')
    return data.products ?? []
  },

  async addProduct(p: Partial<Product>): Promise<Product> {
    const data = await apiFetch('/api/products', { method: 'POST', body: JSON.stringify(p) })
    return data.product
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const data = await apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
    return data.product
  },

  async deleteProduct(id: string): Promise<void> {
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' })
  },

  // ── Orders ─────────────────────────────────────────────────────────────────
  async getOrders(): Promise<Order[]> {
    const data = await apiFetch('/api/orders')
    return data.orders ?? []
  },

  async placeOrder(payload: Record<string, unknown>): Promise<Order> {
    const data = await apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(payload) })
    return data.order
  },

  async updateOrderStatus(id: string, status: string, note?: string): Promise<Order> {
    const data = await apiFetch(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    })
    return data.order
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

import { useState, useEffect, useCallback } from 'react'
import {
  Search, ShoppingBag, Sprout, Smartphone, Plus, Minus, MapPin, Star, Truck, ArrowRight,
  ChevronRight, CheckCircle2, Clock, ShieldCheck, CreditCard, Leaf,
  X, Loader2, Sparkles, Home, User
} from 'lucide-react'
import { api, type Product, type Order } from '../lib/api'
import { useAuth } from '../context/AuthContext'

// ─── Utilities ─────────────────────────────────────────────────────────────────
const fmtFull = (n: number) => `₹${n.toLocaleString('en-IN')}`
const PASTEL = ['pastel-0','pastel-1','pastel-2','pastel-3','pastel-4','pastel-5']

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string,string> = {
    new:'badge-new', accepted:'badge-accepted', preparing:'badge-preparing', ready:'badge-ready',
    picked_up:'badge-picked_up', delivered:'badge-delivered', cancelled:'badge-cancelled'
  }
  const lbl: Record<string,string> = {
    new:'Order Placed', accepted:'Accepted', preparing:'Preparing', ready:'Ready for Delivery', picked_up:'Out for Delivery',
    delivered:'Delivered', cancelled:'Cancelled'
  }
  return <span className={`badge ${cfg[status] ?? 'badge-draft'}`}>{lbl[status] ?? status}</span>
}

type CartItem = Product & { cartQty: number }

export default function BuyerDashboard() {
  const { user, logout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'shop' | 'orders' | 'profile'>('shop')
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'upi' | 'success'>('cart')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [upiPin, setUpiPin] = useState('')
  
  // Checkout details
  const [address, setAddress] = useState(user?.address || 'Flat 402, Sai Residency, Virar East, Maharashtra')
  const [slot, setSlot] = useState('Tomorrow • 8:00 AM – 10:00 AM')
  const [payment, setPayment] = useState('UPI')

  const loadData = useCallback(async () => {
    try {
      const [prods, ords] = await Promise.all([api.getProducts(), api.getOrders()])
      // Filter out unavailable products
      setProducts(prods.filter(p => p.available))
      // Filter orders by this buyer's email/ID
      setOrders(ords.filter(o => {
        if (!user) return false;
        if (o.buyerId === user.id) return true;
        if (o.buyer?.email && o.buyer.email === user.email) return true;
        const demoIds = ['demo-buyer', 'buyer-demo', 'buyer-demo-01'];
        if (demoIds.includes(user.id) && demoIds.includes(o.buyerId)) return true;
        return false;
      }))
    } catch (e) {
      console.warn('Failed to load buyer data')
    }
    setLoading(false)
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  // Refresh orders periodically
  useEffect(() => {
    if (tab !== 'orders') return
    const id = setInterval(() => { 
      api.getOrders().then(ords => setOrders(ords.filter(o => {
        if (!user) return false;
        if (o.buyerId === user.id) return true;
        if (o.buyer?.email && o.buyer.email === user.email) return true;
        const demoIds = ['demo-buyer', 'buyer-demo', 'buyer-demo-01'];
        if (demoIds.includes(user.id) && demoIds.includes(o.buyerId)) return true;
        return false;
      }))) 
    }, 15000)
    return () => clearInterval(id)
  }, [tab, user])

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(x => x.id === p.id)
      if (ex) return prev.map(x => x.id === p.id ? { ...x, cartQty: x.cartQty + 1 } : x)
      return [...prev, { ...p, cartQty: 1 }]
    })
    setShowCart(true)
  }

  const updateCart = (id: string, delta: number) => {
    setCart(prev => prev.map(x => {
      if (x.id === id) {
        const next = x.cartQty + delta
        return next > 0 ? { ...x, cartQty: next } : x
      }
      return x
    }).filter(x => x.cartQty > 0))
  }

  const cartTotal = cart.reduce((s, item) => s + (item.price * item.cartQty), 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setPlacingOrder(true)
    
    try {
      const payload = {
        buyerId: user?.id,
        buyerName: user?.name,
        buyerPhone: user?.phone || '+91 99999 99999',
        address,
        slot,
        payment,
        items: cart.map(c => ({
          productId: c.id,
          productName: c.name,
          variety: c.variety,
          quantity: c.cartQty,
          unit: c.unit,
          price: c.price,
          image: c.image,
          farmer: c.farmer
        })),
        total: cartTotal
      }
      
      await api.placeOrder(payload)
      setCart([])
      setCheckoutStep('success')
      // Refresh orders
      const ords = await api.getOrders()
      setOrders(ords.filter(o => {
        if (!user) return false;
        if (o.buyerId === user.id) return true;
        if (o.buyer?.email && o.buyer.email === user.email) return true;
        const demoIds = ['demo-buyer', 'buyer-demo', 'buyer-demo-01'];
        if (demoIds.includes(user.id) && demoIds.includes(o.buyerId)) return true;
        return false;
      }))
    } catch (e) {
      console.error(e)
      alert('Failed to place order. Please try again.')
    }
    setPlacingOrder(false)
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.farmer.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'var(--offwhite)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem' }}>
      <Loader2 size={36} color="var(--forest)" style={{ animation:'spin 1s linear infinite' }} />
      <div style={{ fontSize:14, color:'var(--text-3)' }}>Loading FarmDirect...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--offwhite)' }}>
      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border-2)', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', cursor: 'pointer' }} onClick={() => setTab('shop')}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, var(--forest), var(--light-g))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={18} color="#fff" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--forest)', letterSpacing: '-.02em' }}>FarmDirect</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', color: tab === 'shop' ? 'var(--forest)' : 'var(--text-3)', fontWeight: tab === 'shop' ? 800 : 600, fontSize: 14, cursor: 'pointer' }} onClick={() => setTab('shop')}>Shop</button>
            <button style={{ background: 'none', border: 'none', color: tab === 'orders' ? 'var(--forest)' : 'var(--text-3)', fontWeight: tab === 'orders' ? 800 : 600, fontSize: 14, cursor: 'pointer' }} onClick={() => setTab('orders')}>My Orders</button>
            <button style={{ background: 'none', border: 'none', color: tab === 'profile' ? 'var(--forest)' : 'var(--text-3)', fontWeight: tab === 'profile' ? 800 : 600, fontSize: 14, cursor: 'pointer' }} onClick={() => setTab('profile')}>Profile</button>
            
            <button className="btn btn-primary" style={{ borderRadius: 99, padding: '.5rem 1.25rem', gap: '.5rem' }} onClick={() => { setShowCart(true); setCheckoutStep('cart') }}>
              <ShoppingBag size={16} /> 
              <span>{cart.reduce((s,c) => s + c.cartQty, 0)} Items</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        
        {/* ── SHOP TAB ───────────────────────────────────────────────────────── */}
        {tab === 'shop' && (
          <div className="slide-up">
            <div style={{ background: 'linear-gradient(135deg, var(--forest), var(--leaf))', borderRadius: 24, padding: '3rem', color: '#fff', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '.75rem', letterSpacing: '-.03em' }}>Fresh from the farm.</h1>
                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,.8)', maxWidth: 400, lineHeight: 1.5 }}>Order directly from verified local farmers. Delivered fresh to your doorstep.</p>
              </div>
              <div style={{ width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,.2)' }}>
                <Sprout size={64} color="#fff" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Available Produce</h2>
              <div className="search-bar" style={{ width: 300, background: '#fff' }}>
                <Search size={16} color="var(--text-4)"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search for tomatoes, onions..." />
              </div>
            </div>

            <div className="grid-4">
              {filteredProducts.map((p, i) => (
                <div key={p.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 160, width: '100%', position: 'relative', background: 'var(--mint)' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e=>(e.currentTarget.style.display='none')} />
                    {p.quality === 'Verified' && (
                      <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(4px)', padding: '.25rem .5rem', borderRadius: 8, fontSize: 11, fontWeight: 800, color: 'var(--forest)', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                        <ShieldCheck size={12} /> Verified
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.25rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>{p.name}</h3>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--forest)' }}>₹{p.price}</div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: '.75rem', flex: 1 }}>{p.variety} • per {p.unit}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', marginBottom: '1rem' }}>
                      <div className="avatar-circle" style={{ width: 20, height: 20, fontSize: 10 }}>{p.farmer.charAt(0)}</div>
                      <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>{p.farmer}</span>
                    </div>

                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: 12, padding: '.65rem' }} onClick={() => addToCart(p)}>
                      <Plus size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ─────────────────────────────────────────────────────── */}
        {tab === 'orders' && (
          <div className="slide-up">
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-.02em' }}>My Orders</h1>
            
            {orders.length === 0 ? (
              <div className="card empty-state" style={{ padding: '4rem 2rem' }}>
                <ShoppingBag size={48} color="var(--text-4)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '.5rem' }}>No orders yet</h3>
                <p style={{ color: 'var(--text-3)', marginBottom: '1.5rem' }}>You haven't placed any orders. Browse the shop to get started!</p>
                <button className="btn btn-primary" onClick={() => setTab('shop')}>Go to Shop</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((o, i) => (
                  <div key={o.id} className={`card ${PASTEL[i%6]}`} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,.06)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.25rem' }}>
                          <span style={{ background: 'rgba(0,0,0,.06)', padding: '.2rem .6rem', borderRadius: 8, fontSize: 12, fontWeight: 800, color: 'var(--text-2)' }}>#{o.orderNumber}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)' }}>From {o.farmer}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <StatusBadge status={o.status} />
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--forest)', marginTop: '.5rem' }}>{fmtFull(o.totalAmount)}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {o.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', background: 'rgba(255,255,255,.7)', padding: '.5rem .75rem', borderRadius: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--mint)', overflow: 'hidden' }}>
                            <img src={item.image || o.photos?.[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e=>(e.currentTarget.style.display='none')} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800 }}>{item.productName || o.cropName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{item.quantity} {item.unit} • ₹{item.price}/{item.unit}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,.5)', padding: '.75rem 1rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                      <Truck size={16} color="var(--forest)" />
                      <div style={{ fontSize: 12 }}>
                        <span style={{ fontWeight: 700 }}>Delivery:</span> {o.deliverySlot || 'Today'} to {o.deliveryAddress?.split(',')[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ─────────────────────────────────────────────────────── */}
        {tab === 'profile' && (
          <div className="slide-up grid-2">
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: 'var(--forest)' }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{user?.name}</h2>
                  <div style={{ color: 'var(--text-3)' }}>{user?.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.25rem' }}>Phone Number</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.phone || '+91 -'}</div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.25rem' }}>Saved Address</div>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{user?.address || 'No address saved.'}</div>
                </div>
              </div>

              <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', padding: '.75rem', borderRadius: 12 }} onClick={logout}>Sign Out</button>
            </div>
            
            <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--forest)' }}>FarmDirect Benefits</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { title: 'Direct from Farmers', desc: 'No middlemen. Farmers earn more, you pay less.', icon: '🌾' },
                  { title: 'AI Quality Assurance', desc: 'Every batch is verified for freshness and grade.', icon: '✨' },
                  { title: 'Same Day Delivery', desc: 'Harvested in the morning, in your kitchen by evening.', icon: '🚚' }
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,.6)', padding: '1rem', borderRadius: 16 }}>
                    <div style={{ fontSize: '1.5rem' }}>{b.icon}</div>
                    <div>
                      <div style={{ fontWeight: 800, marginBottom: '.2rem' }}>{b.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CART OVERLAY ─────────────────────────────────────────────────────── */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end' }} onClick={() => { if (!placingOrder) setShowCart(false) }}>
          <div style={{ width: 440, maxWidth: '100%', background: '#fff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>Your Cart</h2>
              {!placingOrder && (
                <button className="btn-icon" onClick={() => setShowCart(false)}><X size={20} /></button>
              )}
            </div>

            {checkoutStep === 'success' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--mint)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <CheckCircle2 size={40} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '.5rem' }}>Order Placed!</h2>
                <p style={{ color: 'var(--text-3)', marginBottom: '2rem' }}>The farmer has been notified and will begin preparing your fresh produce.</p>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }} onClick={() => { setShowCart(false); setTab('orders') }}>Track Order</button>
              </div>
            ) : cart.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
                <ShoppingBag size={48} color="var(--text-4)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '.5rem' }}>Your cart is empty</h3>
                <p style={{ color: 'var(--text-3)', marginBottom: '1.5rem' }}>Add some fresh farm produce to get started.</p>
                <button className="btn btn-secondary" onClick={() => setShowCart(false)}>Browse Shop</button>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                  {checkoutStep === 'cart' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {cart.map(c => (
                        <div key={c.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--border-2)', borderRadius: 16 }}>
                          <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--mint)', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e=>(e.currentTarget.style.display='none')} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.25rem' }}>
                              <span style={{ fontWeight: 800 }}>{c.name}</span>
                              <span style={{ fontWeight: 900, color: 'var(--forest)' }}>₹{c.price * c.cartQty}</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: '.75rem' }}>{c.farmer}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-2)', borderRadius: 8 }}>
                                <button style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => updateCart(c.id, -1)}><Minus size={14}/></button>
                                <span style={{ width: 24, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{c.cartQty}</span>
                                <button style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => updateCart(c.id, 1)}><Plus size={14}/></button>
                              </div>
                              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>× ₹{c.price}/{c.unit}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {checkoutStep === 'details' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slide-up .3s cubic-bezier(.22,1,.36,1)' }}>
                      <div>
                        <label className="form-label">Delivery Address</label>
                        <div style={{ position: 'relative' }}>
                          <MapPin size={16} color="var(--text-4)" style={{ position: 'absolute', left: 12, top: 12 }} />
                          <textarea className="form-input" style={{ paddingLeft: 36, minHeight: 80, resize: 'none' }} value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                      </div>
                      
                      <div>
                        <label className="form-label">Delivery Slot</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                          {['Today • 6:00 PM – 8:00 PM', 'Tomorrow • 8:00 AM – 10:00 AM', 'Tomorrow • 5:00 PM – 7:00 PM'].map(s => (
                            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '1rem', border: `2px solid ${slot === s ? 'var(--forest)' : 'var(--border-2)'}`, borderRadius: 12, background: slot === s ? 'var(--mint)' : '#fff', cursor: 'pointer', transition: 'all .2s' }}>
                              <input type="radio" checked={slot === s} onChange={() => setSlot(s)} style={{ accentColor: 'var(--forest)' }} />
                              <span style={{ fontSize: 14, fontWeight: slot === s ? 700 : 500, color: slot === s ? 'var(--forest)' : 'var(--text-1)' }}>{s}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="form-label">Payment Method</label>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                          {['UPI', 'Cash on Delivery'].map(m => (
                            <button key={m} style={{ flex: 1, padding: '.875rem', borderRadius: 12, border: `2px solid ${payment === m ? 'var(--forest)' : 'var(--border-2)'}`, background: payment === m ? 'var(--mint)' : '#fff', fontWeight: 700, fontSize: 13, color: payment === m ? 'var(--forest)' : 'var(--text-3)', cursor: 'pointer' }} onClick={() => setPayment(m)}>
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 'upi' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', animation: 'slide-up .3s cubic-bezier(.22,1,.36,1)', textAlign: 'center', padding: '1rem 0' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Scan & Pay</h3>
                      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 24, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-2)', display: 'inline-block' }}>
                        <Smartphone size={80} color="var(--forest)" style={{ opacity: 0.8 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--forest)' }}>{fmtFull(cartTotal)}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-3)' }}>FarmDirect UPI Gateway</div>
                      </div>
                      
                      <div style={{ width: '100%', maxWidth: 240 }}>
                        <label className="form-label" style={{ textAlign: 'left', fontSize: 12 }}>ENTER UPI PIN</label>
                        <input type="password" maxLength={6} style={{ fontSize: '1.5rem', letterSpacing: '0.4em', textAlign: 'center', padding: '.75rem', borderRadius: 12 }} className="form-input" value={upiPin} onChange={e => setUpiPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" autoFocus />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-2)', background: 'var(--surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem', fontSize: 14, color: 'var(--text-3)' }}>
                    <span>Subtotal</span>
                    <span>{fmtFull(cartTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: 14, color: 'var(--text-3)' }}>
                    <span>Delivery Fee</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>Free</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 900 }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--forest)' }}>{fmtFull(cartTotal)}</span>
                  </div>

                  {checkoutStep === 'cart' && (
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }} onClick={() => setCheckoutStep('details')}>
                      Proceed to Checkout
                    </button>
                  )}
                  {checkoutStep === 'details' && (
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }} onClick={() => { if (payment === 'UPI') setCheckoutStep('upi'); else handleCheckout(); }}>
                      Continue
                    </button>
                  )}
                  {checkoutStep === 'upi' && (
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }} onClick={handleCheckout} disabled={placingOrder || upiPin.length < 4}>
                      {placingOrder ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : `Pay ${fmtFull(cartTotal)} securely`}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

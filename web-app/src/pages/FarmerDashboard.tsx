import { useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  LayoutDashboard, Sprout, ShoppingBag, Package2, TrendingUp, Bell, User,
  ChevronRight, Plus, Search, MoreHorizontal, Leaf, ArrowUpRight, ArrowDownRight,
  Minus, CheckCircle2, XCircle, Clock, Star, MapPin, Eye, Trash2, Cloud, Wind,
  Droplets, AlertCircle, BarChart3, Sparkles, Bike, Play, PauseCircle, RefreshCw,
  Package, Banknote, X, Loader2, Pencil, CheckCheck, Save, ServerCrash,
  Activity, Wifi, WifiOff
} from 'lucide-react'
import { api, type Product, type Order } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { demoFarm, demoCrops, demoMarketPrices, demoEarnings, demoMonthlyRevenue, demoWeather } from '../data/demoData'

type Tab = 'dashboard' | 'farm' | 'listings' | 'orders' | 'market' | 'profile'

// ─── Utilities ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`
const fmtFull = (n: number) => `₹${n.toLocaleString('en-IN')}`
const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
const PASTEL = ['pastel-0','pastel-1','pastel-2','pastel-3','pastel-4','pastel-5']

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string,string> = {
    new:'badge-new', accepted:'badge-accepted', preparing:'badge-preparing', ready:'badge-ready',
    picked_up:'badge-picked_up', delivered:'badge-delivered', cancelled:'badge-cancelled',
    active:'badge-active', paused:'badge-paused', sold_out:'badge-sold_out', draft:'badge-draft',
    planted:'badge-planted', growing:'badge-growing', ready_to_harvest:'badge-ready_to_harvest', harvested:'badge-harvested',
  }
  const lbl: Record<string,string> = {
    new:'New', accepted:'Accepted', preparing:'Preparing', ready:'Ready', picked_up:'Picked Up',
    delivered:'Delivered', cancelled:'Cancelled', active:'In Stock', paused:'Paused',
    sold_out:'Out of Stock', draft:'Draft', planted:'Planted', growing:'Growing',
    ready_to_harvest:'Ready to Harvest', harvested:'Harvested',
  }
  return <span className={`badge ${cfg[status] ?? 'badge-draft'}`}>{lbl[status] ?? status}</span>
}

function TrendArrow({ t }: { t: string }) {
  if (t === 'up')   return <ArrowUpRight size={13} className="trend-up" />
  if (t === 'down') return <ArrowDownRight size={13} className="trend-down" />
  return <Minus size={13} className="trend-flat" />
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success'|'error' }) {
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <CheckCircle2 size={16} color="var(--success)" /> : <XCircle size={16} color="var(--error)" />}
      <span>{msg}</span>
    </div>
  )
}
function useToast() {
  const [toasts, set] = useState<{id:number;msg:string;type:'success'|'error'}[]>([])
  const add = (msg: string, type: 'success'|'error' = 'success') => {
    const id = Date.now()
    set(p => [...p, {id,msg,type}])
    setTimeout(() => set(p => p.filter(t => t.id !== id)), 3500)
  }
  return { toasts, add }
}

// ─── Server status indicator ───────────────────────────────────────────────────
function ServerIndicator({ online }: { online: boolean | null }) {
  if (online === null) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: 11.5, fontWeight: 600, color: online ? 'var(--success)' : 'var(--warning)', background: online ? 'var(--success-bg)' : 'var(--warning-bg)', padding: '.3rem .7rem', borderRadius: 99 }}>
      {online ? <Wifi size={12} /> : <WifiOff size={12} />}
      {online ? 'Live Data' : 'Offline — Demo Data'}
    </div>
  )
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  { id:'dashboard', label:'Dashboard', icon:LayoutDashboard },
  { id:'farm', label:'My Farm', icon:Sprout },
  { id:'listings', label:'Products', icon:ShoppingBag, hasBadge:false },
  { id:'orders', label:'Orders', icon:Package2, hasBadge:true },
  { id:'market', label:'Market', icon:TrendingUp },
] as const

function Sidebar({ active, onNav, unread, user, logout }:
  { active:Tab; onNav:(t:Tab)=>void; unread:number; user:any; logout:()=>void }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div style={{ width:36, height:36, borderRadius:12, background:'linear-gradient(135deg, var(--forest), var(--light-g))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-green)' }}>
          <Leaf size={18} color="#fff" />
        </div>
        <div>
          <div className="sidebar-brand-text">FarmDirect</div>
          <div style={{ fontSize:10, color:'var(--text-3)', marginTop:.5 }}>Farmer Dashboard</div>
        </div>
        <span className="sidebar-brand-badge">Live</span>
      </div>
      <nav className="sidebar-nav">
        <span className="nav-section-label">Navigation</span>
        {NAV.map(({id,label,icon:Icon,hasBadge}) => (
          <button key={id} className={`nav-item ${active===id?'active':''}`} onClick={()=>onNav(id as Tab)}>
            <Icon size={18} />{label}
            {hasBadge && unread>0 && <span className="nav-badge">{unread}</span>}
          </button>
        ))}
        <span className="nav-section-label" style={{marginTop:'.5rem'}}>Account</span>
        <button className={`nav-item ${active==='profile'?'active':''}`} onClick={()=>onNav('profile')}>
          <User size={18} /> Profile
        </button>
      </nav>
      <div className="sidebar-footer">
        <div className="farmer-pill">
          <div className="farmer-avatar">{user?.name?.charAt(0) ?? 'F'}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize:11, color:'var(--text-3)' }}>{user?.farmName ?? 'Your Farm'}</div>
          </div>
          <button onClick={logout} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-4)', fontSize:11 }}>Sign out</button>
        </div>
      </div>
    </aside>
  )
}

// ─── Topbar ────────────────────────────────────────────────────────────────────
function Topbar({ title, subtitle, children, unread, onBell, serverOnline }:
  { title:string; subtitle?:string; children?:ReactNode; unread:number; onBell:()=>void; serverOnline:boolean|null }) {
  return (
    <div className="topbar">
      <div style={{ flex:1 }}>
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-sub">{subtitle}</div>}
      </div>
      {children}
      <ServerIndicator online={serverOnline} />
      <button className="bell-btn" onClick={onBell}>
        <Bell size={18} />
        {unread>0 && <span className="bell-badge">{unread}</span>}
      </button>
    </div>
  )
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ orders, products, onNav }:
  { orders:Order[]; products:Product[]; onNav:(t:Tab)=>void }) {
  const newOrders = orders.filter(o => o.status === 'new').length
  const todayRev = orders.filter(o => ['delivered','picked_up'].includes(o.status))
    .reduce((s,o) => s+o.totalAmount, 0)
  const maxRev = Math.max(...demoMonthlyRevenue.map(m => m.amount), 1)

  return (
    <div className="page-body">
      <div className="slide-up" style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontSize:'1.65rem', fontWeight:900, letterSpacing:'-.035em' }}>
          Good {new Date().getHours()<12?'morning':'afternoon'}! 🌱
        </h1>
        <p style={{ fontSize:14, color:'var(--text-3)', marginTop:'.35rem' }}>
          {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid-4 slide-up su-1" style={{ marginBottom:'1.5rem' }}>
        {[
          { label:"Today's Revenue", value:fmtFull(todayRev || demoEarnings.today), trend:'up', sub:'+12%', icon:<Banknote size={18}/>, color:'var(--forest)' },
          { label:'Active Products', value:products.filter(p=>p.available).length.toString(), trend:'up', sub:'in marketplace', icon:<ShoppingBag size={18}/>, color:'#2563EB' },
          { label:'New Orders', value:newOrders.toString(), trend:'flat', sub:'awaiting action', icon:<Package2 size={18}/>, color:'#B45309' },
          { label:'Total Orders', value:orders.length.toString(), trend:'up', sub:'all time', icon:<BarChart3 size={18}/>, color:'#7E22CE' },
        ].map((m,i) => (
          <div key={i} className="metric-card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <span className="metric-label">{m.label}</span>
              <div style={{ width:36, height:36, borderRadius:12, background:`${m.color}18`, display:'flex', alignItems:'center', justifyContent:'center', color:m.color }}>{m.icon}</div>
            </div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-trend"><TrendArrow t={m.trend} /><span style={{color:'var(--text-4)',fontWeight:400}}>{m.sub}</span></div>
          </div>
        ))}
      </div>

      <div className="grid-2 slide-up su-2" style={{ marginBottom:'1.5rem', alignItems:'start' }}>
        {/* Revenue chart */}
        <div className="card" style={{ padding:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
            <div>
              <h3 style={{ fontSize:'1rem', fontWeight:800 }}>Monthly Revenue</h3>
              <p style={{ fontSize:12, color:'var(--text-3)', marginTop:'.15rem' }}>Last 6 months</p>
            </div>
            <div style={{ fontSize:'1rem', fontWeight:900, color:'var(--forest)' }}>{fmt(demoEarnings.thisMonth)}</div>
          </div>
          <div style={{ display:'flex', gap:'.625rem', alignItems:'flex-end', height:100, marginBottom:'1rem' }}>
            {demoMonthlyRevenue.map((m,i) => {
              const h = Math.round((m.amount/maxRev)*100)
              const last = i === demoMonthlyRevenue.length-1
              return (
                <div key={i} className="chart-bar-col">
                  <div style={{ width:'100%', flex:`0 0 ${h}%`, minHeight:6, borderRadius:'.4rem .4rem 0 0', background: last ? 'linear-gradient(to top, var(--forest), var(--light-g))' : 'var(--surface-3)' }} />
                  <div style={{ fontSize:11, color: last ? 'var(--forest)' : 'var(--text-3)', fontWeight: last ? 700 : 400 }}>{m.month}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weather + crop preview */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div className="card" style={{ padding:'1.25rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1rem' }}>
              <div style={{ fontSize:'2.5rem', fontWeight:700, color:'var(--text-1)', lineHeight:1 }}>{demoWeather.temperature}°</div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'.35rem', color:'var(--gold)' }}><Cloud size={18}/><span style={{ fontSize:13, color:'var(--text-2)' }}>Partly Cloudy</span></div>
                <div style={{ fontSize:11, color:'var(--text-3)' }}>Nashik, Maharashtra</div>
              </div>
            </div>
            <div className="metrics-strip">
              {[
                { icon:<Droplets size={16} color="#0284C7"/>, val:`${demoWeather.humidity}%`, label:'Humidity' },
                { icon:<AlertCircle size={16} color="#0284C7"/>, val:`${demoWeather.rainfallProbability}%`, label:'Rain' },
                { icon:<Wind size={16} color="var(--leaf)"/>, val:`${demoWeather.windSpeed}km/h`, label:'Wind' },
              ].map((m,i) => (
                <><div key={`d${i}`} className="metrics-strip-divider" style={{display:i===0?'none':'block'}} />
                <div key={i} className="metrics-strip-block">{m.icon}<div style={{fontSize:13,fontWeight:700,color:'var(--text-1)',margin:'.25rem 0 .1rem'}}>{m.val}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{m.label}</div></div></>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding:'1.25rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.875rem' }}>
              <h3 style={{ fontSize:'1rem', fontWeight:800 }}>Active Crops</h3>
              <button className="btn btn-ghost btn-sm" onClick={()=>onNav('farm')}>View <ChevronRight size={12}/></button>
            </div>
            {demoCrops.slice(0,2).map((c,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'.75rem', padding:'.6rem 0', borderBottom:i<1?'1px solid var(--border-2)':'none' }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'var(--mint)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem' }}>{c.name==='Tomato'?'🍅':c.name==='Onion'?'🧅':'🥬'}</div>
                <div style={{ flex:1 }}><div style={{ fontSize:13.5, fontWeight:700 }}>{c.name} · {c.variety}</div><div style={{ fontSize:11, color:'var(--text-3)' }}>{c.area} acres</div></div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="card slide-up su-3">
        <div style={{ padding:'1.25rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border-2)' }}>
          <h3 style={{ fontSize:'1rem', fontWeight:800 }}>Recent Orders</h3>
          <button className="btn btn-secondary btn-sm" onClick={()=>onNav('orders')}>All Orders <ChevronRight size={13}/></button>
        </div>
        {orders.length === 0 ? (
          <div className="empty-state"><Package size={32} color="var(--text-4)" /><div>No orders yet</div></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Order</th><th>Buyer</th><th>Produce</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {orders.slice(0,5).map(o => (
                <tr key={o.id}>
                  <td><span style={{ background:'rgba(0,0,0,.05)', borderRadius:8, padding:'.2rem .5rem', fontSize:12, fontWeight:800 }}>#{o.orderNumber}</span></td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
                      <div className="avatar-circle" style={{ width:30, height:30, fontSize:12 }}>{(o.buyer?.name ?? 'B').charAt(0)}</div>
                      <div style={{ fontSize:13.5, fontWeight:700 }}>{o.buyer?.name ?? 'Buyer'}</div>
                    </div>
                  </td>
                  <td><div style={{ fontSize:13.5, fontWeight:600 }}>{o.cropName}</div><div style={{ fontSize:11, color:'var(--text-3)' }}>{o.quantity} {o.quantityUnit}</div></td>
                  <td style={{ fontSize:15, fontWeight:900, color:'var(--forest)' }}>{fmtFull(o.totalAmount)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td style={{ fontSize:12, color:'var(--text-3)' }}>{timeAgo(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Listings (Products) — real backend CRUD ────────────────────────────────────
function ListingsScreen({ products, setProducts, onToast }:
  { products:Product[]; setProducts:React.Dispatch<React.SetStateAction<Product[]>>; onToast:(m:string,t:'success'|'error')=>void }) {
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name:'', variety:'', price:'', quantity:'', unit:'kg', description:'' })

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))

  const resetForm = () => setForm({ name:'', variety:'', price:'', quantity:'', unit:'kg', description:'' })

  async function addProduct() {
    if (!form.name.trim()) return onToast('Product name is required', 'error')
    setLoading(true)
    try {
      const p = await api.addProduct({ name:form.name, variety:form.variety, price:Number(form.price)||50, quantity:Number(form.quantity)||100, unit:form.unit, description:form.description, available:true })
      setProducts(prev => [p, ...prev])
      onToast(`${p.name} added to marketplace!`, 'success')
      resetForm(); setShowAdd(false)
    } catch { onToast('Could not add product — is the server running?', 'error') }
    setLoading(false)
  }

  async function toggleAvail(p: Product) {
    try {
      const updated = await api.updateProduct(p.id, { available: !p.available, status: !p.available ? 'active' : 'paused' })
      setProducts(prev => prev.map(x => x.id===p.id ? updated : x))
      onToast(`${p.name} ${updated.available ? 'activated' : 'paused'}`, 'success')
    } catch { onToast('Update failed', 'error') }
  }

  async function addStock(p: Product) {
    try {
      const updated = await api.updateProduct(p.id, { quantity: p.quantity + 50 })
      setProducts(prev => prev.map(x => x.id===p.id ? updated : x))
      onToast(`+50 ${p.unit} added to ${p.name}`, 'success')
    } catch { onToast('Update failed', 'error') }
  }

  async function deleteProduct(p: Product) {
    try {
      await api.deleteProduct(p.id)
      setProducts(prev => prev.filter(x => x.id!==p.id))
      onToast(`${p.name} removed`, 'success')
    } catch { onToast('Delete failed', 'error') }
  }

  async function updatePrice(p: Product, price: number) {
    try {
      const updated = await api.updateProduct(p.id, { price })
      setProducts(prev => prev.map(x => x.id===p.id ? updated : x))
      onToast(`Price updated to ₹${price}`, 'success')
      setEditId(null)
    } catch { onToast('Update failed', 'error') }
  }

  return (
    <div className="page-body">
      {/* Stats */}
      <div className="grid-4 slide-up" style={{ marginBottom:'1.5rem' }}>
        {[
          { label:'Total Products', value:products.length, icon:'📦' },
          { label:'Active', value:products.filter(p=>p.available).length, icon:'✅' },
          { label:'Total Stock', value:products.reduce((s,p)=>s+p.quantity,0)+' units', icon:'🏷️' },
          { label:'Avg Price', value:`₹${products.length?Math.round(products.reduce((s,p)=>s+p.price,0)/products.length):0}`, icon:'💰' },
        ].map((m,i) => (
          <div key={i} className="metric-card">
            <span style={{ fontSize:'1.5rem' }}>{m.icon}</span>
            <div className="metric-value" style={{ fontSize:'1.4rem' }}>{m.value}</div>
            <span className="metric-label">{m.label}</span>
          </div>
        ))}
      </div>

      <div className="slide-up su-1" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'1rem' }}>
        <div className="search-bar">
          <Search size={14} color="var(--text-4)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…" />
        </div>
        <button className="btn btn-primary" onClick={()=>setShowAdd(v=>!v)}><Plus size={15}/> {showAdd?'Cancel':'Add Product'}</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card slide-up" style={{ padding:'1.5rem', marginBottom:'1.5rem', borderLeft:'4px solid var(--forest)' }}>
          <h3 style={{ fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>New Product Listing</h3>
          <div className="grid-3" style={{ gap:'.875rem', marginBottom:'.875rem' }}>
            {[
              { label:'Product Name*', key:'name', ph:'e.g. Fresh Tomatoes' },
              { label:'Variety', key:'variety', ph:'e.g. Pusa Ruby' },
              { label:'Price per unit (₹)', key:'price', ph:'58', type:'number' },
              { label:'Available Stock', key:'quantity', ph:'100', type:'number' },
              { label:'Unit', key:'unit', ph:'kg / bundle / dozen' },
            ].map(f => (
              <div key={f.key}>
                <label className="form-label">{f.label}</label>
                <input className="form-input" type={f.type??'text'} value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom:'1rem' }}>
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Fresh tomatoes sourced directly from our farm…" style={{ resize:'vertical' }} />
          </div>
          <button className="btn btn-primary" onClick={addProduct} disabled={loading}>
            {loading?<Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>:<><CheckCircle2 size={14}/> Add to Marketplace</>}
          </button>
        </div>
      )}

      {/* Product cards */}
      <div className="grid-3 slide-up su-2">
        {filtered.map((p,i) => {
          const isEditing = editId === p.id
          const [tmpPrice, setTmpPrice] = useState(p.price.toString())
          return (
            <div key={p.id} className="card" style={{ padding:'1rem', opacity:p.available?1:0.75 }}>
              <div style={{ display:'flex', gap:'.875rem', alignItems:'flex-start', marginBottom:'.875rem' }}>
                <div style={{ width:64, height:64, borderRadius:20, overflow:'hidden', flexShrink:0 }}>
                  <img src={p.image} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>(e.currentTarget.style.display='none')} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.2rem' }}>
                    <div style={{ fontSize:15, fontWeight:800, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, marginRight:'.5rem' }}>{p.name}</div>
                    <StatusBadge status={p.available?'active':'paused'} />
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:'.4rem' }}>{p.variety} · {p.category}</div>
                  <span className="tag tag-green">Grade {p.quality==='Verified'?'A':p.quality}</span>
                  {p.isAiGenerated && <span className="tag tag-purple" style={{marginLeft:'.35rem'}}><Sparkles size={9}/> AI</span>}
                </div>
              </div>

              {/* Metrics */}
              <div className="metrics-strip" style={{ marginBottom:'.875rem' }}>
                <div className="metrics-strip-block">
                  <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:600, marginBottom:'.2rem' }}>Price</div>
                  {isEditing ? (
                    <div style={{ display:'flex', gap:.25, alignItems:'center' }}>
                      <span style={{ fontSize:12, fontWeight:600 }}>₹</span>
                      <input type="number" value={tmpPrice} onChange={e=>setTmpPrice(e.target.value)} style={{ width:60, fontSize:14, fontWeight:800, border:'none', background:'transparent', outline:'none', color:'var(--leaf)' }} />
                    </div>
                  ) : (
                    <div style={{ fontSize:16, fontWeight:800, color:'var(--leaf)' }}>₹{p.price} <span style={{ fontSize:11, fontWeight:400, color:'var(--text-3)' }}>/{p.unit}</span></div>
                  )}
                </div>
                <div className="metrics-strip-divider" />
                <div className="metrics-strip-block">
                  <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:600, marginBottom:'.2rem' }}>Stock</div>
                  <div style={{ fontSize:14, fontWeight:800, color:p.quantity<=30?'#DC2626':'var(--text-1)' }}>{p.quantity} {p.unit}</div>
                </div>
                <div className="metrics-strip-divider" />
                <div className="metrics-strip-block">
                  <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:600, marginBottom:'.2rem' }}>Location</div>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--text-2)' }}>{p.location.split(',')[0]}</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'.4rem', borderTop:'1px solid var(--border-2)', paddingTop:'.75rem', flexWrap:'wrap' }}>
                <button className="btn btn-warning btn-sm" style={{ borderRadius:14 }} onClick={()=>addStock(p)}>+50 {p.unit}</button>
                <button onClick={()=>toggleAvail(p)} style={{ display:'inline-flex', alignItems:'center', gap:'.3rem', padding:'.35rem .75rem', borderRadius:14, background:'var(--surface-3)', border:'none', cursor:'pointer', fontSize:12, fontWeight:700, color:p.available?'var(--warning)':'var(--leaf)' }}>
                  {p.available?<PauseCircle size={13}/>:<Play size={13}/>}{p.available?'Pause':'Activate'}
                </button>
                {isEditing ? (
                  <button onClick={()=>updatePrice(p,Number(tmpPrice))} className="btn btn-primary btn-sm" style={{ borderRadius:14 }}><Save size={13}/> Save</button>
                ) : (
                  <button onClick={()=>setEditId(p.id)} className="btn-icon" style={{ background:'var(--info-bg)', color:'var(--info)', borderRadius:14, width:32, height:32 }}><Pencil size={13}/></button>
                )}
                <button onClick={()=>deleteProduct(p)} className="btn-icon" style={{ background:'#FEE2E2', color:'#B91C1C', borderRadius:14, width:32, height:32 }}><Trash2 size={13}/></button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Orders Screen — real backend ──────────────────────────────────────────────
function OrdersScreen({ orders, setOrders, onToast }:
  { orders:Order[]; setOrders:React.Dispatch<React.SetStateAction<Order[]>>; onToast:(m:string,t:'success'|'error')=>void }) {
  const [selected, setSelected] = useState<Order|null>(null)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [saving, setSaving] = useState<string|null>(null)

  const statusFlow: Record<string,string> = { new:'accepted', accepted:'preparing', preparing:'ready', ready:'picked_up', picked_up:'delivered' }
  const actionCfg: Record<string,{label:string;cls:string}> = {
    new:{label:'Accept',cls:'action-accept'}, accepted:{label:'Start Prep',cls:'action-prepare'},
    preparing:{label:'Mark Ready',cls:'action-ready'}, ready:{label:'Picked Up',cls:'action-pickup'},
    picked_up:{label:'Delivered',cls:'action-deliver'},
  }

  async function advance(o: Order) {
    const next = statusFlow[o.status]
    if (!next) return
    setSaving(o.id)
    try {
      const updated = await api.updateOrderStatus(o.id, next)
      setOrders(prev => prev.map(x => x.id===o.id ? updated : x))
      if (selected?.id === o.id) setSelected(updated)
      onToast(`Order #${o.orderNumber} → ${next.replace('_',' ')}`, 'success')
    } catch {
      // Optimistic fallback if backend is offline
      const updated = { ...o, status:next, statusHistory:[...o.statusHistory,{status:next,timestamp:new Date().toISOString()}] }
      setOrders(prev => prev.map(x => x.id===o.id ? updated : x))
      if (selected?.id === o.id) setSelected(updated)
      onToast(`Status updated (offline mode)`, 'success')
    }
    setSaving(null)
  }

  const tabs = ['all','new','accepted','preparing','ready','delivered','cancelled']
  const filtered = activeTab==='all' ? orders : orders.filter(o=>o.status===activeTab)

  return (
    <div className="page-body">
      {/* Tab filters */}
      <div className="slide-up" style={{ display:'flex', gap:'.4rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {tabs.map(t => {
          const count = t==='all' ? orders.length : orders.filter(o=>o.status===t).length
          if (t!=='all' && count===0) return null
          return (
            <button key={t} onClick={()=>setActiveTab(t)} style={{ padding:'.45rem .875rem', borderRadius:99, fontSize:13, fontWeight:700, border:'none', cursor:'pointer', background:activeTab===t?'var(--forest)':'var(--surface)', color:activeTab===t?'#fff':'var(--text-2)', boxShadow:activeTab===t?'var(--shadow-green)':'var(--shadow-sm)', transition:'all .2s' }}>
              {t==='all'?`All (${count})`:`${t.charAt(0).toUpperCase()+t.slice(1).replace('_',' ')} (${count})`}
            </button>
          )
        })}
      </div>

      {/* Orders list */}
      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }} className="slide-up su-1">
        {filtered.length === 0 && (
          <div className="empty-state card"><Package size={36} color="var(--text-4)"/><div style={{ fontWeight:700 }}>No orders in this category</div></div>
        )}
        {filtered.map((o,idx) => {
          const act = actionCfg[o.status]
          const buyerName = o.buyer?.name ?? o.buyerName ?? 'Buyer'
          return (
            <div key={o.id} className={`card ${PASTEL[idx%6]}`} style={{ padding:'1.25rem 1.5rem', cursor:'pointer', transition:'transform .15s, box-shadow .15s' }} onClick={()=>setSelected(o)}
              onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-1px)',e.currentTarget.style.boxShadow='var(--shadow-md)')}
              onMouseLeave={e=>(e.currentTarget.style.transform='',e.currentTarget.style.boxShadow='')}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.75rem' }}>
                <span style={{ background:'rgba(0,0,0,.06)', padding:'.2rem .6rem', borderRadius:8, fontSize:12, fontWeight:800, color:'var(--text-2)' }}>#{o.orderNumber}</span>
                <span style={{ fontSize:12, color:'var(--text-3)' }}>{timeAgo(o.createdAt)}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'.75rem' }}>
                <div className="avatar-circle">{buyerName.charAt(0)}</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:800 }}>{buyerName}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}><Clock size={11} style={{display:'inline',marginRight:3}}/>{o.deliveryType}</div>
                </div>
              </div>
              <div style={{ background:'rgba(255,255,255,.7)', borderRadius:14, padding:'.75rem', display:'flex', alignItems:'center', gap:'.875rem', marginBottom:'.75rem' }}>
                <div style={{ width:44, height:44, borderRadius:12, overflow:'hidden', flexShrink:0, background:'var(--mint)' }}>
                  {o.photos?.[0] ? <img src={o.photos[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>(e.currentTarget.style.display='none')}/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>🌱</div>}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700 }}>{o.cropName} · {o.quantity} {o.quantityUnit}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>{o.deliveryType==='pickup'?'Self Pickup':'Doorstep Delivery'}</div>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(0,0,0,.06)', paddingTop:'.75rem' }}>
                <StatusBadge status={o.status}/>
                <div style={{ fontSize:17, fontWeight:900, color:'var(--forest)' }}>{fmtFull(o.totalAmount)}</div>
              </div>
              {o.status!=='delivered' && o.status!=='cancelled' && act && (
                <div style={{ display:'flex', justifyContent:'flex-end', gap:'.5rem', marginTop:'.75rem', paddingTop:'.625rem', borderTop:'1px solid rgba(0,0,0,.06)' }} onClick={e=>e.stopPropagation()}>
                  <button disabled={saving===o.id} className={`action-btn ${act.cls}`} onClick={()=>advance(o)}>
                    {saving===o.id?<Loader2 size={13} style={{animation:'spin 1s linear infinite'}}/>:<CheckCircle2 size={13}/>}{act.label}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div style={{ background:'linear-gradient(135deg, var(--forest), var(--leaf))', borderRadius:'32px 32px 0 0', padding:'1.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ background:'rgba(255,255,255,.2)', display:'inline-block', padding:'.2rem .65rem', borderRadius:8, fontSize:12, fontWeight:800, color:'rgba(255,255,255,.8)', marginBottom:'.5rem' }}>#{selected.orderNumber}</div>
                  <h2 style={{ fontSize:'1.25rem', fontWeight:900, color:'#fff' }}>{selected.cropName}</h2>
                </div>
                <button onClick={()=>setSelected(null)} style={{ background:'rgba(255,255,255,.2)', border:'none', borderRadius:10, width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}><X size={16}/></button>
              </div>
            </div>
            <div style={{ padding:'1.5rem' }}>
              {/* Status strip */}
              <div style={{ display:'flex', borderRadius:12, overflow:'hidden', border:'1px solid var(--border-2)', marginBottom:'1.25rem' }}>
                {['new','accepted','preparing','ready','picked_up','delivered'].map((s,i) => {
                  const done = selected.statusHistory?.some(h=>h.status===s)
                  const cur = selected.status===s
                  return (
                    <div key={i} style={{ flex:1, padding:'.45rem .2rem', textAlign:'center', background:cur?'var(--warning-bg)':done?'var(--success-bg)':'var(--surface-2)', borderRight:i<5?'1px solid var(--border-2)':'none' }}>
                      <div style={{ fontSize:8.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', color:cur?'var(--warning)':done?'var(--success)':'var(--text-4)' }}>{s.replace('_',' ')}</div>
                    </div>
                  )
                })}
              </div>

              {/* Buyer */}
              <div style={{ background:'var(--mint)', border:'1px solid var(--pale-g)', borderRadius:16, padding:'1rem 1.25rem', marginBottom:'1.25rem' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.75rem' }}>Buyer</div>
                <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                  <div className="avatar-circle">{(selected.buyer?.name??'B').charAt(0)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:800 }}>{selected.buyer?.name}</div>
                    <div style={{ fontSize:12.5, color:'var(--text-3)' }}>{selected.buyer?.businessName} · {selected.buyer?.phone}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:.3 }}><Star size={13} color="var(--gold)" fill="var(--gold)"/><span style={{ fontSize:13, fontWeight:800, color:'var(--gold)' }}>{selected.buyer?.rating??5}</span></div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid-2" style={{ gap:'.625rem', marginBottom:'1.25rem' }}>
                {[
                  {label:'Produce', value:selected.cropName},
                  {label:'Quantity', value:`${selected.quantity} ${selected.quantityUnit}`},
                  {label:'Price/unit', value:`₹${selected.pricePerUnit}`},
                  {label:'Total', value:fmtFull(selected.totalAmount)},
                  {label:'Payment', value:selected.paymentStatus},
                  {label:'Method', value:selected.paymentMethod},
                ].map((r,i) => (
                  <div key={i} style={{ background:'var(--surface-2)', borderRadius:12, padding:'.625rem .875rem' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'.25rem' }}>{r.label}</div>
                    <div style={{ fontSize:14, fontWeight:800 }}>{r.value}</div>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              {selected.buyerInstructions && (
                <div style={{ background:'var(--warning-bg)', borderRadius:14, padding:'.875rem 1rem', borderLeft:'3px solid var(--warm-g)', marginBottom:'1.25rem' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--warning)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'.3rem' }}>Buyer Instructions</div>
                  <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.55 }}>{selected.buyerInstructions}</p>
                </div>
              )}

              <div style={{ display:'flex', gap:'.75rem' }}>
                {statusFlow[selected.status] && (
                  <button disabled={saving===selected.id} className="btn btn-primary" style={{ flex:1, justifyContent:'center', borderRadius:14, padding:'.75rem' }} onClick={()=>advance(selected)}>
                    {saving===selected.id?<Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>:<CheckCircle2 size={14}/>} Mark as {statusFlow[selected.status].replace('_',' ')}
                  </button>
                )}
                <button className="btn btn-ghost" style={{ borderRadius:14 }} onClick={()=>setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Market Screen ─────────────────────────────────────────────────────────────
function MarketScreen({ products }: { products: Product[] }) {
  return (
    <div className="page-body">
      <div className="slide-up" style={{ marginBottom:'1.5rem' }}>
        <div style={{ background:'var(--warning-bg)', border:'1px solid #DDA02835', borderRadius:16, padding:'.875rem 1.25rem', display:'flex', gap:'.75rem', alignItems:'center', marginBottom:'1.5rem' }}>
          <AlertCircle size={18} color="var(--warning)"/>
          <div><div style={{ fontSize:13, fontWeight:700, color:'var(--warning)' }}>Demo market data — illustrative only</div><div style={{ fontSize:12, color:'var(--text-3)' }}>Prices shown are not real-time.</div></div>
        </div>
        <div className="section-header"><h3 style={{ fontSize:'1rem', fontWeight:800 }}>Today's Market Prices</h3></div>
        <div className="card">
          <table className="data-table">
            <thead><tr><th>Crop</th><th>Market</th><th>Min</th><th>Max</th><th>Modal</th><th>Unit</th><th>Trend</th></tr></thead>
            <tbody>
              {demoMarketPrices.map((p,i) => (
                <tr key={i}>
                  <td><span style={{ fontWeight:800 }}>{p.crop}</span></td>
                  <td>{p.market}</td>
                  <td>₹{p.min}</td><td>₹{p.max}</td>
                  <td style={{ fontWeight:900, color:'var(--forest)', fontSize:15 }}>₹{p.modal}</td>
                  <td style={{ color:'var(--text-4)' }}>/{p.unit}</td>
                  <td><div style={{ display:'flex', alignItems:'center', gap:.3 }}><TrendArrow t={p.trend}/><span className={p.trend==='up'?'trend-up':p.trend==='down'?'trend-down':'trend-flat'} style={{ fontSize:13, fontWeight:700 }}>{p.trendPct!==0?`${p.trendPct>0?'+':''}${p.trendPct}%`:'—'}</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Products from backend */}
      <div className="slide-up su-1">
        <div className="section-header">
          <div><h3 style={{ fontSize:'1rem', fontWeight:800 }}>Your Live Marketplace Listings</h3><p style={{ fontSize:12, color:'var(--text-3)', marginTop:'.15rem' }}>{products.filter(p=>p.available).length} active products visible to buyers</p></div>
        </div>
        <div className="grid-3">
          {products.filter(p=>p.available).map((p,i) => (
            <div key={i} className={`card ${PASTEL[i%6]}`} style={{ padding:'1.25rem' }}>
              <div style={{ display:'flex', gap:'.75rem', alignItems:'center', marginBottom:'.875rem' }}>
                <div style={{ width:50, height:50, borderRadius:16, overflow:'hidden', flexShrink:0, background:'var(--mint)' }}>
                  <img src={p.image} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>(e.currentTarget.style.display='none')} />
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:800 }}>{p.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>{p.location}</div>
                </div>
              </div>
              <div className="metrics-strip">
                <div className="metrics-strip-block"><div style={{ fontSize:10, color:'var(--text-3)', fontWeight:600, marginBottom:'.2rem' }}>Price</div><div style={{ fontSize:16, fontWeight:800, color:'var(--leaf)' }}>₹{p.price}/{p.unit}</div></div>
                <div className="metrics-strip-divider"/>
                <div className="metrics-strip-block"><div style={{ fontSize:10, color:'var(--text-3)', fontWeight:600, marginBottom:'.2rem' }}>Stock</div><div style={{ fontSize:14, fontWeight:800, color:p.quantity<=30?'#DC2626':'var(--text-1)' }}>{p.quantity} {p.unit}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── AI Scanner ────────────────────────────────────────────────────────────────
function ScannerSection({ onToast }: { onToast:(m:string,t:'success'|'error')=>void }) {
  const [hint, setHint] = useState('')
  const [result, setResult] = useState<any>(null)
  const [scanning, setScanning] = useState(false)

  async function scan() {
    if (!hint.trim()) return onToast('Enter a crop name to analyze', 'error')
    setScanning(true); setResult(null)
    try {
      const r = await api.scanProduce('', hint, 'farmer')
      setResult(r)
    } catch { onToast('Scanner unavailable — is the server running?', 'error') }
    setScanning(false)
  }

  return (
    <div className="card" style={{ padding:'1.5rem', marginBottom:'1.5rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1.25rem' }}>
        <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg, #7E22CE, #A855F7)', display:'flex', alignItems:'center', justifyContent:'center' }}><Sparkles size={20} color="#fff"/></div>
        <div><h3 style={{ fontSize:'1rem', fontWeight:800 }}>AI Produce Quality Scanner</h3><p style={{ fontSize:12, color:'var(--text-3)' }}>Get AI-powered quality analysis and pricing insights</p></div>
      </div>
      <div style={{ display:'flex', gap:'.875rem', marginBottom:'1rem' }}>
        <input className="form-input" value={hint} onChange={e=>setHint(e.target.value)} placeholder="Enter crop name (e.g. tomato, spinach, onion)" onKeyDown={e=>e.key==='Enter'&&scan()} style={{ flex:1 }} />
        <button className="btn btn-primary" onClick={scan} disabled={scanning}>
          {scanning?<Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/>:<><Sparkles size={15}/> Analyze</>}
        </button>
      </div>
      {result && (
        <div style={{ animation:'slide-up .3s cubic-bezier(.22,1,.36,1)', borderTop:'1px solid var(--border-2)', paddingTop:'1.25rem' }}>
          <div className="grid-2" style={{ gap:'1rem' }}>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
                <div><h4 style={{ fontSize:'1.05rem', fontWeight:800 }}>{result.cropName}</h4><div style={{ fontSize:12.5, color:'var(--text-3)' }}>{result.variety}</div></div>
                <div style={{ textAlign:'right' }}><div style={{ fontSize:'1.5rem', fontWeight:900, color:'var(--forest)' }}>{result.qualityScore}%</div><div style={{ fontSize:11, color:'var(--text-3)' }}>Quality Score</div></div>
              </div>
              <div style={{ marginBottom:'.875rem' }}>
                <div className="bar-track"><div className="bar-fill" style={{ width:`${result.qualityScore}%` }}/></div>
              </div>
              <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginBottom:'1rem' }}>
                <span className="badge badge-delivered">{result.grade}</span>
                <span className="badge badge-preparing">{result.ripeness?.level}</span>
              </div>
              {Object.entries(result.metrics??{}).map(([k,v],i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'.35rem 0', borderBottom:'1px solid var(--border-2)', fontSize:13 }}>
                  <span style={{ color:'var(--text-3)' }}>{k}</span><span style={{ fontWeight:700 }}>{v as string}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ background:'var(--mint)', borderRadius:14, padding:'1rem', marginBottom:'.875rem' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.625rem' }}>Pricing Insight</div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.5rem' }}>
                  <span style={{ fontSize:13, color:'var(--text-3)' }}>Mandi Rate</span>
                  <span style={{ fontSize:15, fontWeight:800, color:'var(--text-2)' }}>₹{result.farmerInsights?.recommendedMandiPrice}/kg</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.5rem' }}>
                  <span style={{ fontSize:13, color:'var(--text-3)' }}>Direct Price</span>
                  <span style={{ fontSize:15, fontWeight:900, color:'var(--forest)' }}>₹{result.farmerInsights?.recommendedDirectPrice}/kg</span>
                </div>
                <div style={{ background:'var(--pale-g)', borderRadius:8, padding:'.4rem .75rem', display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:12.5, fontWeight:700, color:'var(--leaf)' }}>Direct Advantage</span>
                  <span style={{ fontSize:13, fontWeight:900, color:'var(--forest)' }}>{result.farmerInsights?.directProfitAdvantage}</span>
                </div>
              </div>
              <div style={{ background:'var(--surface-2)', borderRadius:14, padding:'1rem' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.625rem' }}>Observations</div>
                {result.observations?.slice(0,3).map((o:string,i:number) => (
                  <div key={i} style={{ display:'flex', gap:'.5rem', fontSize:12.5, color:'var(--text-2)', marginBottom:'.35rem', lineHeight:1.5 }}>
                    <span style={{ color:'var(--success)', flexShrink:0 }}>✓</span><span>{o}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Profile Screen ────────────────────────────────────────────────────────────
function ProfileScreen({ user, orders, logout }: { user:any; orders:Order[]; logout:()=>void }) {
  const totalEarned = orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.totalAmount,0)
  return (
    <div className="page-body">
      <div className="card slide-up" style={{ marginBottom:'1.5rem', overflow:'hidden' }}>
        <div style={{ background:'linear-gradient(135deg, var(--forest), var(--leaf))', padding:'2rem', display:'flex', gap:'1.5rem', alignItems:'center' }}>
          <div style={{ width:72, height:72, borderRadius:24, background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.75rem', fontWeight:900, color:'#fff', border:'2px solid rgba(255,255,255,.3)' }}>
            {user?.name?.split(' ').map((w:string)=>w[0]).slice(0,2).join('')}
          </div>
          <div>
            <h2 style={{ fontSize:'1.35rem', fontWeight:900, color:'#fff', marginBottom:'.3rem' }}>{user?.name}</h2>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.7)', marginBottom:'.75rem' }}>{user?.email}</div>
            <div style={{ display:'flex', gap:'.5rem' }}>
              <span className="tag" style={{ background:'rgba(255,255,255,.2)', color:'#fff', border:'1px solid rgba(255,255,255,.3)' }}><CheckCircle2 size={11}/> Verified Farmer</span>
              <span className="tag" style={{ background:'rgba(255,255,255,.2)', color:'#fff', border:'1px solid rgba(255,255,255,.3)' }}>{user?.farmName ?? 'Your Farm'}</span>
            </div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderTop:'1px solid var(--border-2)' }}>
          {[{label:'Total Orders',value:orders.length},{label:'Delivered',value:orders.filter(o=>o.status==='delivered').length},{label:'Total Earned',value:fmtFull(totalEarned)}].map((s,i) => (
            <div key={i} style={{ padding:'1.1rem', textAlign:'center', borderRight:i<2?'1px solid var(--border-2)':'none' }}>
              <div style={{ fontSize:'1.35rem', fontWeight:900, color:'var(--forest)' }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text-3)', marginTop:'.15rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2 slide-up su-1">
        <div className="card" style={{ padding:'1.5rem' }}>
          <h3 style={{ fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Account Details</h3>
          {[{label:'Email',value:user?.email},{label:'Phone',value:user?.phone??'—'},{label:'Farm Name',value:user?.farmName??'—'},{label:'Role',value:'Farmer'}].map((r,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:13.5, padding:'.7rem 0', borderBottom:i<3?'1px solid var(--border-2)':'none' }}>
              <span style={{ color:'var(--text-3)' }}>{r.label}</span><span style={{ fontWeight:700 }}>{r.value}</span>
            </div>
          ))}
          <button className="btn btn-danger" style={{ width:'100%', justifyContent:'center', marginTop:'1.25rem', borderRadius:12 }} onClick={logout}>Sign Out</button>
        </div>

        <div className="card" style={{ padding:'1.5rem' }}>
          <ScannerSection onToast={()=>{}} />
        </div>
      </div>
    </div>
  )
}

// ─── Notifications panel ───────────────────────────────────────────────────────
const DEMO_NOTIFS = [
  { id:'1', title:'New Order Received', body:'Sunita Patil placed an order for 25kg Tomatoes', createdAt:new Date(Date.now()-3600000).toISOString(), isRead:false },
  { id:'2', title:'Payment Confirmed', body:'₹1,450 received via UPI for order #FD-7294821', createdAt:new Date(Date.now()-7200000).toISOString(), isRead:false },
  { id:'3', title:'Market Alert', body:'Tomato prices up 12% at Nashik APMC today', createdAt:new Date(Date.now()-86400000).toISOString(), isRead:true },
]
function NotificationsPanel({ orders, onClose }: { orders:Order[]; onClose:()=>void }) {
  const [notifs, setNotifs] = useState(DEMO_NOTIFS)
  const orderNotifs = orders.filter(o=>o.status==='new').map(o=>({
    id:o.id, title:'New Order', body:`#${o.orderNumber} — ${o.cropName} from ${o.buyer?.name??'Buyer'}`, createdAt:o.createdAt, isRead:false
  }))
  const all = [...orderNotifs, ...notifs]

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,.4)', backdropFilter:'blur(4px)' }} onClick={onClose}>
      <div style={{ position:'absolute', top:0, right:0, bottom:0, width:380, background:'var(--surface)', borderLeft:'1px solid var(--border-2)', overflow:'auto', boxShadow:'-8px 0 32px rgba(0,0,0,.12)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border-2)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'var(--surface)', zIndex:1 }}>
          <h3 style={{ fontSize:'1rem', fontWeight:800 }}>Notifications</h3>
          <div style={{ display:'flex', gap:'.5rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={()=>setNotifs(p=>p.map(n=>({...n,isRead:true})))}>Mark all read</button>
            <button className="btn-icon" onClick={onClose}><X size={16}/></button>
          </div>
        </div>
        <div style={{ padding:'.875rem' }}>
          {all.map((n,i) => (
            <div key={i} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,isRead:true}:x))} style={{ padding:'.875rem 1rem', borderRadius:14, marginBottom:'.35rem', cursor:'pointer', background:n.isRead?'transparent':'var(--mint)', border:`1px solid ${n.isRead?'transparent':'var(--pale-g)'}`, transition:'background .2s' }}>
              <div style={{ display:'flex', gap:'.75rem', alignItems:'flex-start' }}>
                {!n.isRead && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--forest)', marginTop:6, flexShrink:0 }}/>}
                <div style={{ flex:1, marginLeft:n.isRead?20:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:700, marginBottom:'.2rem' }}>{n.title}</div>
                  <div style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.55 }}>{n.body}</div>
                  <div style={{ fontSize:11, color:'var(--text-4)', marginTop:'.4rem' }}>{timeAgo(n.createdAt)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Farmer Dashboard ──────────────────────────────────────────────────────
export default function FarmerDashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [serverOnline, setServerOnline] = useState<boolean|null>(null)
  const [showNotifs, setShowNotifs] = useState(false)
  const { toasts, add: addToast } = useToast()

  const loadData = useCallback(async () => {
    try {
      const alive = await api.health()
      setServerOnline(alive)
      if (alive) {
        const [prods, ords] = await Promise.all([api.getProducts(), api.getOrders()])
        setProducts(prods)
        setOrders(ords)
      }
    } catch { setServerOnline(false) }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])
  // Refresh orders every 30s
  useEffect(() => {
    const id = setInterval(() => { if (serverOnline) api.getOrders().then(setOrders).catch(()=>{}) }, 30000)
    return () => clearInterval(id)
  }, [serverOnline])

  const newOrders = orders.filter(o=>o.status==='new').length
  const PAGE: Record<Tab,{title:string;subtitle:string}> = {
    dashboard:{ title:'Dashboard', subtitle:`${user?.farmName??'Your Farm'} · Nashik, Maharashtra` },
    farm:{ title:'My Farm', subtitle:'Crops, fields and harvest tracking' },
    listings:{ title:'Products & Listings', subtitle:'Manage your produce on the marketplace' },
    orders:{ title:'Orders', subtitle:'View and manage incoming buyer orders' },
    market:{ title:'Market Prices', subtitle:'Market rates and your live listings' },
    profile:{ title:'My Profile', subtitle:'Account, earnings and AI scanner' },
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'var(--offwhite)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem' }}>
      <Loader2 size={36} color="var(--forest)" style={{ animation:'spin 1s linear infinite' }} />
      <div style={{ fontSize:14, color:'var(--text-3)' }}>Loading your dashboard…</div>
    </div>
  )

  return (
    <>
      <div className="app-shell">
        <Sidebar active={tab} onNav={setTab} unread={newOrders} user={user} logout={logout} />
        <div className="main-content">
          <Topbar title={PAGE[tab].title} subtitle={PAGE[tab].subtitle} unread={newOrders} onBell={()=>setShowNotifs(v=>!v)} serverOnline={serverOnline}>
            {!serverOnline && (
              <div style={{ fontSize:12, color:'var(--warning)', background:'var(--warning-bg)', borderRadius:8, padding:'.3rem .75rem', fontWeight:600 }}>
                ⚠ Start backend: <code style={{ fontSize:11 }}>node backend/server.js</code>
              </div>
            )}
          </Topbar>

          {tab==='dashboard' && <Dashboard orders={orders} products={products} onNav={setTab} />}
          {tab==='farm' && (
            <div className="page-body">
              {/* Farm details from demo (no farm CRUD in backend) */}
              <div className="card slide-up" style={{ marginBottom:'1.5rem', overflow:'hidden' }}>
                <div style={{ background:'linear-gradient(135deg, var(--forest), var(--leaf))', padding:'1.75rem', color:'#fff' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                    <div style={{ width:48, height:48, borderRadius:16, background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}>🌾</div>
                    <div>
                      <h2 style={{ fontSize:'1.35rem', fontWeight:900, color:'#fff' }}>{user?.farmName ?? demoFarm.name}</h2>
                      <div style={{ fontSize:12, color:'rgba(255,255,255,.7)' }}><MapPin size={11} style={{display:'inline',marginRight:3}}/>{demoFarm.village}, {demoFarm.district}, {demoFarm.state}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid var(--border-2)' }}>
                  {[{label:'Total Area',value:`${demoFarm.totalArea} acres`},{label:'Cultivated',value:`${demoFarm.cultivatedArea} acres`},{label:'Soil Type',value:demoFarm.soilType},{label:'Irrigation',value:demoFarm.irrigationType}].map((item,i) => (
                    <div key={i} style={{ padding:'1rem 1.25rem', borderRight:i<3?'1px solid var(--border-2)':'none' }}>
                      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'.3rem' }}>{item.label}</div>
                      <div style={{ fontSize:14, fontWeight:800 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="section-header su-1">
                <h3 style={{ fontSize:'1rem', fontWeight:800 }}>Crops</h3>
                <button className="btn btn-primary btn-sm"><Plus size={14}/> Add Crop</button>
              </div>
              <div className="grid-3 slide-up su-2">
                {demoCrops.map((c,i) => {
                  const emoji = c.name==='Tomato'?'🍅':c.name==='Onion'?'🧅':'🥬'
                  return (
                    <div key={i} className={`card ${PASTEL[i%6]}`} style={{ padding:'1.25rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
                        <div style={{ width:52, height:52, borderRadius:18, background:'rgba(255,255,255,.7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.65rem' }}>{emoji}</div>
                        <StatusBadge status={c.status}/>
                      </div>
                      <h3 style={{ fontSize:'1.05rem', fontWeight:800 }}>{c.name}</h3>
                      <div style={{ fontSize:12.5, color:'var(--text-3)', marginBottom:'1rem' }}>{c.variety}</div>
                      <div style={{ background:'rgba(255,255,255,.7)', borderRadius:14, padding:'.75rem 1rem' }}>
                        {[{l:'Field',v:c.field},{l:'Area',v:`${c.area} ${c.areaUnit}`},{l:'Est. Yield',v:`${c.estimatedYield} ${c.yieldUnit}`},{l:'Harvest',v:c.actualHarvestDate??c.expectedHarvestDate}].map((row,j) => (
                          <div key={j} style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, paddingBottom:j<3?'.4rem':'', marginBottom:j<3?'.4rem':'', borderBottom:j<3?'1px solid rgba(0,0,0,.06)':'none' }}>
                            <span style={{ color:'var(--text-3)' }}>{row.l}</span><span style={{ fontWeight:700 }}>{row.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {tab==='listings' && <ListingsScreen products={products} setProducts={setProducts} onToast={addToast} />}
          {tab==='orders' && <OrdersScreen orders={orders} setOrders={setOrders} onToast={addToast} />}
          {tab==='market' && <MarketScreen products={products} />}
          {tab==='profile' && <ProfileScreen user={user} orders={orders} logout={logout} />}
        </div>
      </div>

      {showNotifs && <NotificationsPanel orders={orders} onClose={()=>setShowNotifs(false)} />}
      <div className="toast-stack">{toasts.map(t => <Toast key={t.id} msg={t.msg} type={t.type}/>)}</div>
    </>
  )
}

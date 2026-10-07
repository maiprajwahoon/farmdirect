import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Leaf, Mail, Phone, ArrowRight, ShieldCheck, Loader2, User, Home } from 'lucide-react'
import type { AppRole } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [mode, setMode] = useState<'pick' | 'email' | 'otp' | 'profile'>('pick')
  const [selectedRole, setSelectedRole] = useState<'buyer'|'farmer'>('buyer')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [farmName, setFarmName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [supaSession, setSupaSession] = useState<any>(null)

  const err = (msg: string) => { setError(msg); setLoading(false) }

  // ── Buyer OTP flow ──────────────────────────────────────────────────────────
  async function sendOtp() {
    if (!email.includes('@')) return err('Enter a valid email address.')
    setLoading(true); setError('')

    const { error: e } = await supabase.auth.signInWithOtp({ email })
    if (e) return err(e.message)
    setLoading(false); setMode('otp')
  }

  async function verifyOtp() {
    if (otp.length < 6) return err('Enter the 6-digit OTP sent to your email.')
    setLoading(true); setError('')

    const { data, error: e } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    if (e || !data.session) return err(e?.message ?? 'Invalid OTP. Please try again.')
    setSupaSession(data.session)
    // Check if they have a saved profile already
    const savedName = data.user?.user_metadata?.name
    const savedRole = data.user?.user_metadata?.role || selectedRole
    if (savedName) {
      // Returning user — log in directly
      login({
        id: data.user!.id,
        email: data.user!.email!,
        name: savedName,
        phone: data.user!.user_metadata?.phone,
        address: data.user!.user_metadata?.address,
        farmName: data.user!.user_metadata?.farmName,
        role: savedRole as AppRole,
      }, data.session)
    } else {
      setLoading(false); setMode('profile')
    }
  }

  async function completeProfile() {
    if (!name.trim()) return err('Please enter your full name.')
    if (selectedRole === 'farmer' && !farmName.trim()) return err('Please enter your farm name.')
    setLoading(true); setError('')
    await supabase.auth.updateUser({ data: { name: name.trim(), phone, address, farmName: farmName.trim(), role: selectedRole } })
    login({
      id: supaSession.user.id,
      email: supaSession.user.email!,
      name: name.trim(),
      phone, address,
      farmName: farmName.trim(),
      role: selectedRole as AppRole,
    }, supaSession)
  }

  async function demoLogin(role: AppRole) {
    setLoading(true); setError('')
    const { data, error: _e } = await supabase.auth.signInWithPassword({
      email: role === 'farmer' ? 'demo.farmer@farmdirect.in' : 'demo.buyer@farmdirect.in',
      password: 'FarmDirectDemo2026!',
    }).catch(() => ({ data: null, error: null })) as any

    if (data?.session) {
      login({
        id: data.user.id, email: data.user.email,
        name: role === 'farmer' ? 'Rajan Kumar' : 'Sunita Patil',
        phone: role === 'farmer' ? '+91 98765 43210' : '+91 98201 45829',
        address: role === 'farmer' ? 'Ozar, Nashik, Maharashtra' : 'Flat 402, Sai Residency, Virar East, Maharashtra',
        farmName: role === 'farmer' ? 'Green Valley Farm' : undefined,
        role,
      }, data.session)
    } else {
      // Offline demo — create a local session without Supabase (for demo purposes)
      const fakeSession = {
        access_token: `demo-${role}-${Date.now()}`,
        user: { id: `demo-${role}`, email: `demo.${role}@farmdirect.in` }
      } as any
      login({
        id: fakeSession.user.id,
        email: fakeSession.user.email,
        name: role === 'farmer' ? 'Rajan Kumar' : 'Sunita Patil',
        phone: role === 'farmer' ? '+91 98765 43210' : '+91 98201 45829',
        address: role === 'farmer' ? 'Ozar, Nashik, Maharashtra' : 'Flat 402, Sai Residency, Virar East, Maharashtra',
        farmName: role === 'farmer' ? 'Green Valley Farm' : undefined,
        role,
      }, fakeSession)
    }
  }

  // ── Farmer email+password flow ──────────────────────────────────────────────
  
    return (
    <div style={{ minHeight: '100vh', background: 'var(--offwhite)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-2)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '.65rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, var(--forest), var(--light-g))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Leaf size={18} color="#fff" />
        </div>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '-.02em', color: 'var(--forest)' }}>FarmDirect</span>
        <span style={{ fontSize: 11, background: 'var(--pale-g)', color: 'var(--leaf)', borderRadius: 99, padding: '.15rem .5rem', fontWeight: 700, marginLeft: 4 }}>Web</span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* ── ROLE PICKER ─────────────────────────────────────────────── */}
          {mode === 'pick' && (
            <div style={{ animation: 'slide-up .35s cubic-bezier(.22,1,.36,1)' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-.03em', marginBottom: '.5rem' }}>Welcome to FarmDirect</h1>
                <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Choose how you'd like to sign in</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Farmer card */}
                <button onClick={() => { setSelectedRole('farmer'); setMode('email') }} style={{ all: 'unset', cursor: 'pointer' }}>
                  <div style={{ background: 'var(--surface)', border: '2px solid var(--border-2)', borderRadius: 20, padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', transition: 'all .2s', boxShadow: 'var(--shadow-sm)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--forest)', e.currentTarget.style.boxShadow = 'var(--shadow-green)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-2)', e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, var(--forest), var(--light-g))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🌾</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', marginBottom: '.2rem' }}>I'm a Farmer</div>
                      <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Manage listings, orders, crops and market data</div>
                    </div>
                    <ArrowRight size={18} color="var(--text-3)" />
                  </div>
                </button>

                {/* Buyer card */}
                <button onClick={() => { setSelectedRole('buyer'); setMode('email') }} style={{ all: 'unset', cursor: 'pointer' }}>
                  <div style={{ background: 'var(--surface)', border: '2px solid var(--border-2)', borderRadius: 20, padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', transition: 'all .2s', boxShadow: 'var(--shadow-sm)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#2563EB', e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,.2)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-2)', e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🛒</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', marginBottom: '.2rem' }}>I'm a Buyer</div>
                      <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Browse fresh produce, place orders and track delivery</div>
                    </div>
                    <ArrowRight size={18} color="var(--text-3)" />
                  </div>
                </button>
              </div>

              {/* Demo section */}
              <div style={{ background: 'var(--warning-bg)', borderRadius: 14, padding: '1rem 1.25rem', border: '1px solid #DDA02840' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>⚡ Quick Demo</div>
                <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: '.875rem' }}>Try the full app instantly without creating an account.</p>
                <div style={{ display: 'flex', gap: '.625rem' }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => demoLogin('farmer')} disabled={loading}>
                    {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '🌾'} Farmer Demo
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => demoLogin('buyer')} disabled={loading}>
                    {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '🛒'} Buyer Demo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── BUYER: EMAIL STEP ───────────────────────────────────────── */}
          {mode === 'email' && (
            <div style={{ background: 'var(--surface)', borderRadius: 24, padding: '2rem', boxShadow: 'var(--shadow-lg)', animation: 'slide-up .35s cubic-bezier(.22,1,.36,1)' }}>
              <button onClick={() => { setMode('pick'); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 13, display: 'flex', alignItems: 'center', gap: '.3rem', marginBottom: '1.5rem' }}>
                ← Back
              </button>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>🛒</div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '.35rem' }}>{selectedRole === 'farmer' ? 'Farmer Sign In' : 'Buyer Sign In'}</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-3)', marginBottom: '1.5rem' }}>We'll send a one-time code to your email</p>

              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }} />
                <input className="form-input" style={{ paddingLeft: 36 }} type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendOtp()} />
              </div>
              {error && <div style={{ fontSize: 13, color: 'var(--error)', marginBottom: '.875rem', background: 'var(--error-bg)', padding: '.625rem .875rem', borderRadius: 10, borderLeft: '3px solid var(--error)' }}>{error}</div>}
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '.75rem' }} onClick={sendOtp} disabled={loading}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <><Mail size={15} /> Send OTP</>}
              </button>
              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <button onClick={() => demoLogin(selectedRole)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-3)', textDecoration: 'underline' }}>
                  Skip — use demo account
                </button>
              </div>
            </div>
          )}

          {/* ── BUYER: OTP STEP ─────────────────────────────────────────── */}
          {mode === 'otp' && (
            <div style={{ background: 'var(--surface)', borderRadius: 24, padding: '2rem', boxShadow: 'var(--shadow-lg)', animation: 'slide-up .35s cubic-bezier(.22,1,.36,1)' }}>
              <button onClick={() => { setMode('email'); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 13, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>← Back</button>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📩</div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '.35rem' }}>Check your email</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-3)', marginBottom: '1.5rem' }}>We sent a 6-digit code to <strong>{email}</strong></p>

              <label className="form-label">6-Digit OTP</label>
              <input className="form-input" style={{ fontSize: '1.5rem', letterSpacing: '.4em', textAlign: 'center', marginBottom: '1rem' }}
                type="text" maxLength={6} placeholder="······"
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && verifyOtp()} />
              {error && <div style={{ fontSize: 13, color: 'var(--error)', marginBottom: '.875rem', background: 'var(--error-bg)', padding: '.625rem .875rem', borderRadius: 10, borderLeft: '3px solid var(--error)' }}>{error}</div>}
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '.75rem' }} onClick={verifyOtp} disabled={loading}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <><ShieldCheck size={15} /> Verify OTP</>}
              </button>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button onClick={sendOtp} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-3)', textDecoration: 'underline' }}>
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* ── BUYER: PROFILE STEP ─────────────────────────────────────── */}
          {mode === 'profile' && (
            <div style={{ background: 'var(--surface)', borderRadius: 24, padding: '2rem', boxShadow: 'var(--shadow-lg)', animation: 'slide-up .35s cubic-bezier(.22,1,.36,1)' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>👋</div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '.35rem' }}>Almost there!</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-3)', marginBottom: '1.5rem' }}>Tell us a bit about yourself to complete sign up</p>

              {[
                { label: 'Full Name', val: name, set: setName, ph: 'Sunita Patil', icon: <User size={14} /> },
                { label: 'Phone (optional)', val: phone, set: setPhone, ph: '+91 98xxx xxxxx', icon: <Phone size={14} /> },
                { label: 'Delivery Address', val: address, set: setAddress, ph: 'Flat no., Street, City, State', icon: <Home size={14} /> },
                ...(selectedRole === 'farmer' ? [{ label: 'Farm Name', val: farmName, set: setFarmName, ph: 'Green Valley Farm', icon: <span style={{fontSize:14}}>🌾</span> }] : []),
              ].map((f, i) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <label className="form-label">{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }}>{f.icon}</span>
                    <input className="form-input" style={{ paddingLeft: 36 }} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} />
                  </div>
                </div>
              ))}
              {error && <div style={{ fontSize: 13, color: 'var(--error)', marginBottom: '.875rem', background: 'var(--error-bg)', padding: '.625rem .875rem', borderRadius: 10, borderLeft: '3px solid var(--error)' }}>{error}</div>}
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '.75rem' }} onClick={completeProfile} disabled={loading}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Continue to Marketplace →'}
              </button>
            </div>
          )}

          
        </div>
      </div>
    </div>
  )
}

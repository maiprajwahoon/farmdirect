import { Fragment, useCallback, useEffect, useRef, useState, type RefObject, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'

// ─── Scroll-reveal hook (fires once) ────────────────────────────────────────
function useReveal(threshold = 0.14) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) { el.classList.add('in'); return }
    el.classList.add('r-up')
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return ref as RefObject<any>
}

// ─── Tiny inline icons ───────────────────────────────────────────────────────
const Ico = {
  Arrow: ({ s = 14 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Leaf: ({ s = 16 }: { s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false)
  const links = ['How It Works', 'AI Scanner', 'Marketplace', 'Farmers', 'About']

  return (
    <>
      <nav className="nav-bar">
        {/* Wordmark */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', textDecoration: 'none', marginRight: '2.5rem' }}>
          <div style={{ color: 'var(--teal)', opacity: .9 }}><Ico.Leaf s={15} /></div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, letterSpacing: '-.01em', color: 'var(--ink)' }}>
            FarmDirect<span style={{ color: 'var(--amber)' }}>.</span>
          </span>
        </a>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '1.75rem', flex: 1 }} className="hide-mobile">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
              className="label"
              style={{ textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--amber)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
              {l}
            </a>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }} className="hide-mobile">
          <a href="https://expo.dev/accounts/moonknight7005/projects/farmdirect-buyer/builds/f9549c15-c739-4f1d-9d48-10c8be296da1" target="_blank" className="btn btn-solid" style={{ fontSize: 10, padding: '.45rem 1.1rem' }}>
            User App
          </a>
          <a href="https://expo.dev/accounts/moonknight7005/projects/farm-direct/builds/a79876e2-2190-4715-ab0f-9d10f9abe4c4" target="_blank" className="btn btn-amber" style={{ fontSize: 10, padding: '.45rem 1.1rem' }}>
            Farmer App
          </a>
        </div>
        <button className="show-mobile" onClick={() => setOpen(!open)}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--ink-2)', cursor: 'pointer' }}>
          {open ? <Ico.X /> : <Ico.Menu />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div style={{
          position: 'fixed', top: 58, left: 0, right: 0, bottom: 0, zIndex: 99,
          background: 'rgba(10,12,14,.97)', backdropFilter: 'blur(16px)',
          padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'
        }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setOpen(false)}
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'var(--ink)', textDecoration: 'none', letterSpacing: '-.02em' }}>
              {l}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <a href="https://expo.dev/accounts/moonknight7005/projects/farmdirect-buyer/builds/f9549c15-c739-4f1d-9d48-10c8be296da1" target="_blank" className="btn btn-solid" style={{ alignSelf: 'flex-start' }}>
              Download User App <Ico.Arrow />
            </a>
            <a href="https://expo.dev/accounts/moonknight7005/projects/farm-direct/builds/a79876e2-2190-4715-ab0f-9d10f9abe4c4" target="_blank" className="btn btn-amber" style={{ alignSelf: 'flex-start' }}>
              Download Farmer App <Ico.Arrow />
            </a>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Portal Hero ─────────────────────────────────────────────────────────────
function PortalHero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0) // 0–1 progress

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const { top, height } = el.getBoundingClientRect()
      const scrollable = height - window.innerHeight
      const progress = Math.max(0, Math.min(1, -top / scrollable))
      setP(progress)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Panel: open in first 55% of scroll
  const panelP = Math.min(1, p / 0.55)
  const leftX  = -(panelP * 110)   // % translate
  const rightX =   panelP * 110

  // Image: scales from 1.08 to 1.0
  const imgScale = 1.08 - panelP * 0.08

  // Wordmark: grows + tightens + spans split
  const wScale  = 1 + panelP * 0.45
  const wSpacing = -0.02 + panelP * -0.055
  const spanOff  = panelP * 42 // vw %

  // Accent dots travel outward
  const dotAX = panelP * 38  // vw
  const dotBX = -(panelP * 38)

  // Below-fold content fades in after panel is open
  const contentP = Math.max(0, (p - 0.6) / 0.4)

  return (
    <div ref={sectionRef} className="portal-section" id="portal-hero">
      <div className="portal-stage">
        {/* Full-bleed image */}
        <div
          className="portal-image"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1600&h=900&fit=crop&auto=format)`,
            transform: `scale(${imgScale})`,
            backgroundColor: 'var(--ground-2)',
          }}
        />

        {/* Duotone overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: `linear-gradient(135deg, rgba(46,107,114,.18), rgba(232,145,60,.12))`,
          mixBlendMode: 'overlay',
          opacity: panelP,
          pointerEvents: 'none',
        }} />

        {/* Radial veil */}
        <div className="portal-veil" />

        {/* Panels */}
        <div className="portal-panel portal-panel-left"
          style={{ transform: `translateX(${leftX}%)` }} />
        <div className="portal-panel portal-panel-right"
          style={{ transform: `translateX(${rightX}%)` }} />

        {/* Accent dots */}
        <div className="portal-accent-dot"
          style={{ background: 'var(--amber)', transform: `translate(calc(-3px + ${dotAX}vw), -3px)`, opacity: panelP * 0.9 }} />
        <div className="portal-accent-dot"
          style={{ background: 'var(--teal)', transform: `translate(calc(3px + ${dotBX}vw), 3px)`, opacity: panelP * 0.9 }} />

        {/* Wordmark */}
        <div className="portal-wordmark">
          <div className="portal-wordmark-inner"
            style={{ transform: `scale(${wScale})`, letterSpacing: `${wSpacing}em` }}>
            <span style={{ display: 'inline-block', transform: `translateX(-${spanOff}%)` }}>Farm</span>
            <span style={{ display: 'inline-block', transform: `translateX(${spanOff}%)` }}>
              Direct<span className="amber-dot">.</span>
            </span>
          </div>
        </div>

        {/* Corner meta */}
        <div className="portal-meta-top" style={{ top: '5.5rem' }}>
          <div>
            <div className="label label-teal" style={{ marginBottom: '.25rem' }}>Est. 2026</div>
            <div className="label" style={{ color: 'var(--muted)' }}>Agritech Marketplace</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="label label-amber" style={{ marginBottom: '.25rem' }}>India</div>
            <div className="label" style={{ color: 'var(--muted)' }}>Farm → Buyer</div>
          </div>
        </div>
        <div className="portal-meta-bottom">
          <div>
            <div className="label" style={{ color: 'var(--muted)', marginBottom: '.25rem' }}>↓ Scroll to open</div>
            <div className="label label-amber">Direct Sourcing · AI Scanner · Transparency</div>
          </div>
          <a href="#how-it-works" className="btn" style={{ fontSize: 10 }}>Explore <Ico.Arrow s={12} /></a>
        </div>
      </div>

      {/* Below-portal content (reveals as portal finishes) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '30vh', display: 'flex', alignItems: 'center',
        padding: '0 2.5rem',
        opacity: contentP, transform: `translateY(${(1 - contentP) * 24}px)`,
        transition: 'none',
      }}>
        <div style={{ maxWidth: 640 }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(1.3rem, 3vw, 2rem)', letterSpacing: '-.02em', lineHeight: 1.2 }}>
            Fresh produce, directly from farmers.<br />
            <span style={{ color: 'var(--amber)' }}>Transparent by design.</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Ticker ──────────────────────────────────────────────────────────────────
function Ticker() {
  const items = ['Fresh Tomatoes', 'Farm Potatoes', 'Green Capsicum', 'Spinach', 'Red Onions', 'Carrots', 'Sweet Corn', 'Cold-Press Oils', 'Alphonso Mangoes', 'Drumsticks']
  const doubled = [...items, ...items]
  return (
    <div className="hairline-b" style={{ borderTop: '1px solid var(--hairline)', overflow: 'hidden', background: 'var(--ground-2)', padding: '.7rem 0' }}>
      <div className="animate-ticker" style={{ display: 'inline-flex', gap: '3.5rem', whiteSpace: 'nowrap' }}>
        {doubled.map((item, i) => (
          <span key={i} className="label" style={{ color: 'var(--muted)', gap: '.6rem', display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ color: 'var(--amber)', fontSize: 8 }}>◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Statement Fold ───────────────────────────────────────────────────────────
function StatementFold() {
  const ref = useReveal()
  return (
    <section style={{ padding: '7rem 2.5rem', background: 'var(--ground-2)', borderBottom: '1px solid var(--hairline)', position: 'relative', overflow: 'hidden' }}>
      {/* Ghost numeral */}
      <div style={{
        position: 'absolute', right: '-2rem', top: '50%', transform: 'translateY(-50%)',
        fontFamily: 'Syne, sans-serif', fontWeight: 800,
        fontSize: 'clamp(10rem, 25vw, 22rem)',
        color: 'transparent',
        WebkitTextStroke: '1px rgba(237,231,220,.07)',
        lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
        letterSpacing: '-.04em',
      }}>01</div>

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div ref={ref} style={{ maxWidth: 640 }}>
          <span className="label label-amber" style={{ display: 'block', marginBottom: '1.5rem' }}>
            ◆ The Problem
          </span>
          <h2 className="display" style={{ fontSize: 'clamp(1.6rem, 3.6vw, 3.2rem)', lineHeight: 1.1, marginBottom: '2.5rem' }}>
            Buying fresh produce<br />
            <span style={{ color: 'var(--amber)' }}>shouldn't feel like guesswork.</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { n: '01', title: 'Unknown Source', desc: 'Customers rarely know which farm their produce comes from.' },
              { n: '02', title: 'Limited Information', desc: 'Quality, seller, and pricing data is often unclear or absent.' },
              { n: '03', title: 'One-Way Shopping', desc: 'Traditional markets create distance between farmer and buyer.' },
            ].map((item, i) => (
              <div key={i} className="row-item r-up" style={{ gap: '2rem' }}>
                <span className="label label-amber" style={{ minWidth: 28 }}>{item.n}</span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', letterSpacing: '-.015em', minWidth: 160 }}>{item.title}</span>
                <span style={{ color: 'var(--ink-2)', fontSize: '14px', lineHeight: 1.6 }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Trust Strip ─────────────────────────────────────────────────────────────
function TrustStrip() {
  const items = [
    { label: '01', title: 'Direct From Farmers', desc: 'Products sourced directly from participating growers.' },
    { label: '02', title: 'Transparent Info',    desc: 'Seller, product, pricing, and quality — all visible.' },
    { label: '03', title: 'AI-Powered Scan',     desc: 'Explore visible produce characteristics via camera.' },
    { label: '04', title: 'Farm-to-Home',        desc: 'Follow your order from checkout to delivery.' },
  ]

  return (
    <section style={{ background: 'var(--ground)', padding: '5rem 2.5rem', borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0' }} className="trust-grid">
          {items.map((item, i) => (
            <div key={i} className="r-up"
              style={{
                padding: '2rem 1.75rem',
                borderLeft: i > 0 ? '1px solid var(--hairline)' : 'none',
              }}>
              <span className="label label-amber" style={{ display: 'block', marginBottom: '1rem' }}>{item.label}</span>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', letterSpacing: '-.02em', marginBottom: '.5rem' }}>{item.title}</h3>
              <p style={{ color: 'var(--ink-2)', fontSize: '13.5px', lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:700px){.trust-grid{grid-template-columns:1fr 1fr!important;}}`}</style>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const titleRef = useReveal()
  const steps = [
    { n: '01', title: 'Discover',   desc: 'Browse fresh produce from participating farmers.' },
    { n: '02', title: 'Understand', desc: 'View seller, product, pricing, and quality data.' },
    { n: '03', title: 'Scan',       desc: 'Use the AI vegetable scanner on any produce item.' },
    { n: '04', title: 'Shop',       desc: 'Add to cart, checkout, and track the delivery.' },
  ]

  return (
    <section id="how-it-works" style={{ padding: '6rem 2.5rem', background: 'var(--ground-2)', borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={titleRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}>
            From Farm to Doorstep.
          </h2>
          <span className="label label-amber">◆ Process</span>
        </div>

        {steps.map((s, i) => (
          <div key={i} className="row-item r-up" style={{ justifyContent: 'space-between', cursor: 'default' }}>
            <span className="label label-amber" style={{ minWidth: 28 }}>{s.n}</span>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(1rem,2vw,1.35rem)', letterSpacing: '-.02em', flex: '0 0 200px' }}>{s.title}</span>
            <span style={{ color: 'var(--ink-2)', fontSize: '14px', lineHeight: 1.65, flex: 1 }}>{s.desc}</span>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>→</span>
          </div>
        ))}

        {/* Journey strip */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--hairline)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {['Farm', '—', 'Product', '—', 'AI Scan', '—', 'Buyer'].map((item, i) => (
            <span key={i} style={{
              fontFamily: item === '—' ? 'inherit' : 'Syne, sans-serif',
              fontWeight: item === '—' ? 400 : 700,
              fontSize: item === '—' ? '1rem' : '0.875rem',
              letterSpacing: '-.01em',
              color: item === '—' ? 'var(--muted)' : i === 0 ? 'var(--teal)' : i === 6 ? 'var(--amber)' : 'var(--ink)',
            }}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── AI Scanner ───────────────────────────────────────────────────────────────
function AIScanner() {
  const ref = useReveal()
  const scanRef = useRef<HTMLDivElement>(null)

  return (
    <section id="ai-scanner" style={{ padding: '6rem 2.5rem', background: 'var(--ground)', borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }} className="scanner-grid">
          <div ref={ref}>
            <span className="label label-teal" style={{ display: 'block', marginBottom: '1.25rem' }}>◆ AI Feature</span>
            <h2 className="display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', marginBottom: '1.5rem', lineHeight: 1.05 }}>
              A smarter way to look at{' '}
              <span style={{ color: 'var(--teal)' }}>fresh produce.</span>
            </h2>
            <p style={{ color: 'var(--ink-2)', fontSize: '15px', lineHeight: 1.75, marginBottom: '2rem', maxWidth: 400 }}>
              Point your phone at a vegetable. FarmDirect's AI scanner reads visible characteristics from the image — surface, color, shape, blemishes.
            </p>

            {/* Observations list */}
            {['Surface appearance', 'Visible blemishes', 'Color characteristics', 'Shape characteristics'].map((obs, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.6rem 0', borderBottom: '1px solid var(--hairline)' }}>
                <span style={{ color: 'var(--teal)', fontSize: 10 }}>◆</span>
                <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}>{obs}</span>
              </div>
            ))}

            <div style={{ marginTop: '1.75rem', padding: '1rem 1.25rem', border: '1px solid var(--hairline)', borderRadius: '.5rem', background: 'var(--ground-2)' }}>
              <span className="label label-amber" style={{ display: 'block', marginBottom: '.4rem' }}>⚠ AI Limitation</span>
              <p style={{ color: 'var(--muted)', fontSize: '12.5px', lineHeight: 1.6 }}>
                Observations are image estimates. They do not determine freshness, pesticide levels, or food safety. Not a substitute for professional inspection.
              </p>
            </div>

            <a href="#marketplace" className="btn btn-amber" style={{ marginTop: '2rem' }}>Explore AI Scanner <Ico.Arrow /></a>
          </div>

          {/* Scanner phone */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 260, height: 520,
              background: 'var(--ground-2)',
              border: '1px solid var(--hairline)',
              borderRadius: '2rem',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,.5)',
              position: 'relative',
            }}>
              {/* Notch */}
              <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 56, height: 5, background: 'var(--ground-3)', borderRadius: 3, zIndex: 5 }} />

              {/* Header */}
              <div style={{ padding: '2rem 1rem .6rem', background: 'var(--ground-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.875rem', letterSpacing: '-.015em', color: 'var(--ink)' }}>
                  AI Scanner
                </span>
                <div style={{ background: 'rgba(46,107,114,.25)', borderRadius: 999, padding: '.15rem .5rem', border: '1px solid rgba(46,107,114,.4)' }}>
                  <span className="label label-teal" style={{ fontSize: 9 }}>● LIVE</span>
                </div>
              </div>

              {/* Camera viewport */}
              <div ref={scanRef} style={{ position: 'relative', height: 210, background: '#060a07', overflow: 'hidden' }}>
                {/* Grid */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'linear-gradient(rgba(46,107,114,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(46,107,114,.08) 1px,transparent 1px)',
                  backgroundSize: '22px 22px',
                }} />
                {/* Focus corners */}
                {[{ top: '22%', left: '18%' }, { top: '22%', right: '18%' }, { bottom: '22%', left: '18%' }, { bottom: '22%', right: '18%' }]
                  .map((pos, i) => (
                    <div key={i} style={{
                      position: 'absolute', width: 18, height: 18, ...pos,
                      borderTop: i < 2 ? `1.5px solid var(--teal)` : 'none',
                      borderBottom: i >= 2 ? `1.5px solid var(--teal)` : 'none',
                      borderLeft: i % 2 === 0 ? `1.5px solid var(--teal)` : 'none',
                      borderRight: i % 2 === 1 ? `1.5px solid var(--teal)` : 'none',
                    }} />
                  ))}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '3.2rem' }}>🍅</div>
                {/* Scan line */}
                <div style={{
                  position: 'absolute', left: '14%', right: '14%', height: 1.5,
                  background: `linear-gradient(to right, transparent, var(--teal), transparent)`,
                  boxShadow: '0 0 10px var(--teal)',
                  animation: 'scanline 2.6s ease-in-out infinite',
                }} />
                {/* Detection label */}
                <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)' }}>
                  <div style={{ background: 'rgba(10,12,14,.85)', backdropFilter: 'blur(8px)', borderRadius: 6, padding: '.25rem .7rem', border: '1px solid rgba(46,107,114,.4)' }}>
                    <span className="label label-teal" style={{ fontSize: 9 }}>Tomato detected · 94%</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div style={{ padding: '.75rem 1rem', background: 'var(--ground-2)' }}>
                <span className="label label-amber" style={{ display: 'block', marginBottom: '.5rem', fontSize: 9 }}>Visible Observations</span>
                {['Surface: Smooth, uniform', 'Color: Deep red', 'Blemishes: None detected', 'Shape: Round, firm'].map((o, i) => (
                  <div key={i} style={{ display: 'flex', gap: '.4rem', padding: '.25rem 0', borderBottom: '1px solid var(--hairline)', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--teal)', fontSize: 8, marginTop: 1, flexShrink: 0 }}>◆</span>
                    <span style={{ color: 'var(--ink-2)', fontSize: '11px', lineHeight: 1.4 }}>{o}</span>
                  </div>
                ))}
                <div style={{ marginTop: '.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="label" style={{ fontSize: 9, color: 'var(--muted)' }}>09:41 AM</span>
                  <button className="btn" style={{ fontSize: 9, padding: '.2rem .5rem', borderRadius: 6 }}>Retry ↺</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scanline { 0%{top:14%} 50%{top:82%} 100%{top:14%} }
        @media(max-width:820px){.scanner-grid{grid-template-columns:1fr!important;gap:3rem!important;}}
      `}</style>
    </section>
  )
}

// ─── Throwable Deck ───────────────────────────────────────────────────────────
interface DeckCard {
  emoji: string; name: string; farm: string; location: string; price: string; quality: string
}

function ThrowableDeck({ cards, size }: { cards: DeckCard[]; size: number }) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i))
  const [thrown, setThrown] = useState<{ idx: number; dir: number } | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; currentX: number; pointerId: number } | null>(null)
  const [dragState, setDragState] = useState<{ x: number; rotate: number } | null>(null)
  const deckRef = useRef<HTMLDivElement>(null)

  const throwCard = useCallback((dir: number) => {
    if (order.length < 2) return
    const topIdx = order[order.length - 1]
    setThrown({ idx: topIdx, dir })
    setTimeout(() => {
      setOrder(prev => {
        const next = [...prev]
        next.splice(next.indexOf(topIdx), 1)
        next.unshift(topIdx)
        return next
      })
      setThrown(null)
    }, 420)
  }, [order])

  const onPointerDown = (e: ReactPointerEvent) => {
    if (order.length < 2 || thrown) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, currentX: e.clientX, pointerId: e.pointerId }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setDragState({ x: 0, rotate: 0 })
  }
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    dragRef.current.currentX = e.clientX
    setDragState({ x: dx, rotate: dx * 0.06 })
  }
  const onPointerUp = (e: ReactPointerEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    dragRef.current = null
    setDragState(null)
    if (Math.abs(dx) > size * 0.12) throwCard(dx > 0 ? 1 : -1)
  }

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowRight') throwCard(1)
    if (e.key === 'ArrowLeft') throwCard(-1)
  }

  return (
    <div ref={deckRef} style={{ position: 'relative', width: size, height: size + 60, margin: '0 auto' }}
      onKeyDown={onKeyDown} tabIndex={0} role="listbox" aria-label="Product deck. Use arrow keys to browse.">
      {order.map((cardIdx, stackPos) => {
        const isTop = stackPos === order.length - 1
        const isThrowing = thrown && thrown.idx === cardIdx

        const depth = order.length - 1 - stackPos
        const baseX = depth * 4
        const baseY = -depth * 4
        const baseRot = -depth * 1.4
        const baseScale = 1 - depth * 0.04

        let transform = `translate(${baseX}px, ${baseY}px) rotate(${baseRot}deg) scale(${baseScale})`
        let transition = 'transform .28s cubic-bezier(.22,1,.36,1)'
        let zIdx = stackPos

        if (isTop && dragState && !isThrowing) {
          transform = `translate(${dragState.x}px, 0px) rotate(${dragState.rotate}deg) scale(1.01)`
          transition = 'none'
          zIdx = 99
        }
        if (isThrowing) {
          transform = `translate(${thrown.dir * (size + 80)}px, -20px) rotate(${thrown.dir * 22}deg) scale(0.96)`
          transition = 'transform .42s cubic-bezier(.22,1,.36,1), opacity .42s ease'
          zIdx = 99
        }

        const card = cards[cardIdx]
        return (
          <div key={cardIdx} className="deck-card"
            style={{ width: size, height: size, transform, transition, zIndex: zIdx, boxShadow: isTop ? '0 20px 56px rgba(0,0,0,.5)' : 'none' }}
            onPointerDown={isTop ? onPointerDown : undefined}
            onPointerMove={isTop ? onPointerMove : undefined}
            onPointerUp={isTop ? onPointerUp : undefined}>
            <div style={{ height: size * 0.55, background: 'var(--ground-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.28, borderBottom: '1px solid var(--hairline)' }}>
              {card.emoji}
            </div>
            <div style={{ padding: '1.25rem' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-.02em', marginBottom: '.25rem' }}>{card.name}</h3>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '.15rem' }}>{card.farm}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '.75rem' }}>
                <span style={{ color: 'var(--teal)', marginRight: '.3rem', fontSize: 9 }}>◆</span>{card.location}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-2)', marginBottom: '1rem', lineHeight: 1.5, borderLeft: '2px solid var(--hairline)', paddingLeft: '.6rem' }}>{card.quality}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--amber)' }}>{card.price}</span>
                <button className="btn btn-solid" style={{ fontSize: 10, padding: '.4rem .9rem' }}>Add +</button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Hint + dots */}
      <div style={{ position: 'absolute', bottom: -50, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
        <div style={{ display: 'flex', gap: '.4rem' }}>
          {cards.map((_, i) => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%',
              background: order[order.length - 1] === i ? 'var(--amber)' : 'var(--hairline-strong)',
              transition: 'background .25s',
            }} />
          ))}
        </div>
        <span className="label" style={{ color: 'var(--muted)', fontSize: 10 }}>Drag or use arrow keys →</span>
      </div>
    </div>
  )
}

// ─── Marketplace ─────────────────────────────────────────────────────────────
function Marketplace() {
  const ref = useReveal()
  const cards: DeckCard[] = [
    { emoji: '🍅', name: 'Fresh Tomatoes',  farm: 'Rajan Farms',    location: 'Nashik, MH',       price: '₹42/kg',    quality: 'Visually uniform, deep red, smooth surface' },
    { emoji: '🥔', name: 'Farm Potatoes',   farm: 'Kumar Agri',     location: 'Agra, UP',          price: '₹28/kg',    quality: 'Firm, minimal blemishes, dry outer skin' },
    { emoji: '🫑', name: 'Green Capsicum',  farm: 'Dev Harvest',    location: 'Bengaluru, KA',     price: '₹65/kg',    quality: 'Bright green, smooth, firm walls' },
    { emoji: '🥬', name: 'Fresh Spinach',   farm: 'Priya Greens',   location: 'Pune, MH',          price: '₹35/bunch', quality: 'Vibrant dark green leaves, fresh cut' },
    { emoji: '🧅', name: 'Red Onions',      farm: 'Sharma Farms',   location: 'Lasalgaon, MH',     price: '₹22/kg',    quality: 'Firm, dry papery outer skin, uniform size' },
    { emoji: '🥕', name: 'Fresh Carrots',   farm: 'Hill Valley Farm', location: 'Ooty, TN',        price: '₹48/kg',    quality: 'Uniform orange, straight, crisp texture' },
  ]

  return (
    <section id="marketplace" style={{ padding: '6rem 2.5rem', background: 'var(--ground-2)', borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'start' }} className="market-grid">
          {/* Left: copy */}
          <div ref={ref}>
            <span className="label label-amber" style={{ display: 'block', marginBottom: '1.25rem' }}>◆ Marketplace</span>
            <h2 className="display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', marginBottom: '1.5rem', lineHeight: 1.05 }}>
              Built around<br />
              <span style={{ color: 'var(--teal)' }}>transparency.</span>
            </h2>
            <p style={{ color: 'var(--ink-2)', fontSize: '15px', lineHeight: 1.75, marginBottom: '2rem', maxWidth: 380 }}>
              Every product card shows the farmer, location, price, and AI-observed quality data — no hidden information, no fake certifications.
            </p>

            {/* Feature rows */}
            {['Farmer-verified listings', 'AI-scanned visible quality', 'Transparent pricing', 'Direct farm sourcing'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.5rem 0', borderBottom: '1px solid var(--hairline)' }}>
                <span style={{ color: 'var(--amber)', fontSize: 9 }}>◆</span>
                <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}>{f}</span>
              </div>
            ))}

            <a href="#" className="btn btn-amber" style={{ marginTop: '2rem' }}>Explore Marketplace <Ico.Arrow /></a>
            <p style={{ marginTop: '1rem', fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>
              Demo data only. No fabricated certifications.
            </p>
          </div>

          {/* Right: throwable deck */}
          <div style={{ paddingTop: '1rem' }}>
            <ThrowableDeck cards={cards} size={340} />
          </div>
        </div>
      </div>
      <style>{`@media(max-width:820px){.market-grid{grid-template-columns:1fr!important;gap:3rem!important;}}`}</style>
    </section>
  )
}

// ─── Farmer Connection ────────────────────────────────────────────────────────
function FarmerConnection() {
  const ref = useReveal()
  const steps = [
    { label: 'Farmer', emoji: '👨‍🌾', desc: 'Participating growers list their produce.' },
    { label: 'FarmDirect', emoji: '🌿', desc: 'Digital marketplace, AI tools, delivery tracking.' },
    { label: 'Buyer', emoji: '🏠', desc: 'Informed customers shop with confidence.' },
  ]

  return (
    <section style={{ padding: '6rem 2.5rem', background: 'var(--ground)', borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={ref} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}>
            Closer to the people<br />
            <span style={{ color: 'var(--amber)' }}>who grow your food.</span>
          </h2>
          <span className="label label-teal">◆ Connection</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: '0', alignItems: 'stretch' }} className="conn-grid">
          {steps.map((s, i) => (
            <Fragment key={i}>
              <div style={{ padding: '2rem', background: 'var(--ground-2)', border: '1px solid var(--hairline)', borderRadius: '.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{s.emoji}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '.95rem', letterSpacing: '-.015em', marginBottom: '.4rem' }}>{s.label}</h3>
                <p style={{ color: 'var(--ink-2)', fontSize: '13px', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
              {i < 2 && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.25rem' }}>
                    <div style={{ width: 1, height: 20, background: 'var(--hairline)' }} />
                    <span style={{ color: i === 0 ? 'var(--teal)' : 'var(--amber)', fontSize: 12 }}>◆</span>
                    <div style={{ width: 1, height: 20, background: 'var(--hairline)' }} />
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <a href="#" className="btn btn-amber">Discover Farmers <Ico.Arrow /></a>
        </div>
      </div>
      <style>{`@media(max-width:700px){.conn-grid{grid-template-columns:1fr!important;}}`}</style>
    </section>
  )
}

// ─── Order Timeline ───────────────────────────────────────────────────────────
function OrderTimeline() {
  const ref = useReveal()
  const steps = [
    { n: '01', label: 'Order Placed',       active: true  },
    { n: '02', label: 'Farmer Confirms',    active: true  },
    { n: '03', label: 'Processing',         active: false },
    { n: '04', label: 'Out for Delivery',   active: false },
    { n: '05', label: 'Delivered',          active: false },
  ]

  return (
    <section style={{ padding: '6rem 2.5rem', background: 'var(--ground-2)', borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={ref} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}>
            Know what happens<br />
            <span style={{ color: 'var(--teal)' }}>after you tap Buy.</span>
          </h2>
          <span className="label label-amber">◆ Order Experience</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1px', background: 'var(--hairline)' }} className="timeline-grid">
          {steps.map((s, i) => (
            <div key={i} style={{ background: 'var(--ground-2)', padding: '1.5rem 1.25rem', textAlign: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: s.active ? 'transparent' : 'var(--ground-3)',
                border: `1px solid ${s.active ? 'var(--amber)' : 'var(--hairline)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                <span className="label" style={{ color: s.active ? 'var(--amber)' : 'var(--muted)', fontSize: 10 }}>{s.n}</span>
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '.85rem', letterSpacing: '-.01em', color: s.active ? 'var(--ink)' : 'var(--muted)' }}>
                {s.label}
              </div>
              {s.active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--amber)', margin: '.6rem auto 0', animation: 'blink 1.4s ease-in-out infinite' }} />}
            </div>
          ))}
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
          Designed to make the buying journey easier to understand — from checkout to delivery. <em>Demo mode, no live backend.</em>
        </p>
      </div>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        @media(max-width:700px){.timeline-grid{grid-template-columns:1fr 1fr!important;}}
      `}</style>
    </section>
  )
}

// ─── Technology ───────────────────────────────────────────────────────────────
function TechSection() {
  const ref = useReveal()
  const cards = [
    { n: '01', title: 'AI Vision',            desc: 'Computer vision for produce image analysis.' },
    { n: '02', title: 'Digital Marketplace',  desc: 'Connecting products, farmers, and buyers.' },
    { n: '03', title: 'Secure Transactions',  desc: 'Reliable checkout and payment integration.' },
    { n: '04', title: 'Smart Notifications',  desc: 'Order updates delivered to buyers in real time.' },
  ]

  return (
    <section style={{ padding: '6rem 2.5rem', background: 'var(--ground)', borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={ref} style={{ marginBottom: '3rem' }}>
          <span className="label label-teal" style={{ display: 'block', marginBottom: '1.25rem' }}>◆ Technology</span>
          <h2 className="display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}>
            Traditional agriculture.<br />
            <span style={{ color: 'var(--teal)' }}>Modern technology.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0', background: 'var(--hairline)' }} className="tech-grid">
          {cards.map((c, i) => (
            <div key={i} className="r-up" style={{ background: 'var(--ground)', padding: '2rem 1.75rem' }}>
              <span className="label label-amber" style={{ display: 'block', marginBottom: '1rem' }}>{c.n}</span>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', letterSpacing: '-.02em', marginBottom: '.5rem' }}>{c.title}</h3>
              <p style={{ color: 'var(--ink-2)', fontSize: '13.5px', lineHeight: 1.65 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:700px){.tech-grid{grid-template-columns:1fr 1fr!important;}}`}</style>
    </section>
  )
}

// ─── Trust ────────────────────────────────────────────────────────────────────
function TrustSection() {
  const ref = useReveal()
  const items = [
    { title: 'Transparent Pricing',          desc: 'Clear product and pricing information.' },
    { title: 'Honest Quality Information',   desc: 'Only data supported by available evidence.' },
    { title: 'Clear AI Limitations',         desc: 'AI observations are estimates, labelled as such.' },
    { title: 'Buyer Privacy',                desc: 'Personal and transaction data is protected.' },
  ]

  return (
    <section style={{ padding: '6rem 2.5rem', background: 'var(--ground-2)', borderBottom: '1px solid var(--hairline)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={ref} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}>
            Trust built<br />
            <span style={{ color: 'var(--amber)' }}>into the product.</span>
          </h2>
          <span className="label label-teal">◆ Commitment</span>
        </div>

        {items.map((item, i) => (
          <div key={i} className="row-item r-up" style={{ justifyContent: 'space-between' }}>
            <span className="label label-amber" style={{ minWidth: 28 }}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(.9rem,2vw,1.15rem)', letterSpacing: '-.015em', flex: '0 0 240px' }}>{item.title}</span>
            <span style={{ color: 'var(--ink-2)', fontSize: '14px', lineHeight: 1.65, flex: 1 }}>{item.desc}</span>
          </div>
        ))}

        <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', border: '1px solid var(--hairline)', borderRadius: '.5rem', display: 'inline-block' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            No fake certifications. No hidden claims. No pretending demo data is live data.
          </span>
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  const ref = useReveal()
  return (
    <section style={{ padding: '8rem 2.5rem 6rem', background: 'var(--ground)', position: 'relative', overflow: 'hidden' }}>
      {/* Ghost numeral */}
      <div style={{
        position: 'absolute', right: '-3rem', bottom: '-4rem',
        fontFamily: 'Syne, sans-serif', fontWeight: 800,
        fontSize: 'clamp(12rem, 32vw, 28rem)',
        color: 'transparent', WebkitTextStroke: '1px rgba(237,231,220,.05)',
        lineHeight: 1, pointerEvents: 'none', userSelect: 'none', letterSpacing: '-.04em',
      }}>FD</div>

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div ref={ref}>
          <span className="label label-amber" style={{ display: 'block', marginBottom: '1.5rem' }}>◆ Get Started</span>
          <h2 className="display" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1.0, marginBottom: '1.5rem', maxWidth: 700 }}>
            Fresh food starts with<br />
            <span style={{ color: 'var(--amber)' }}>better information.</span>
          </h2>
          <p style={{ color: 'var(--ink-2)', fontSize: '15px', lineHeight: 1.75, maxWidth: 440, marginBottom: '2.5rem' }}>
            Discover FarmDirect and experience a more transparent way to shop from farms to home.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="https://expo.dev/accounts/moonknight7005/projects/farmdirect-buyer/builds/f9549c15-c739-4f1d-9d48-10c8be296da1" target="_blank" className="btn btn-solid">Download User App <Ico.Arrow /></a>
            <a href="https://expo.dev/accounts/moonknight7005/projects/farm-direct/builds/a79876e2-2190-4715-ab0f-9d10f9abe4c4" target="_blank" className="btn btn-amber">Download Farmer App <Ico.Arrow /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const links = ['Marketplace', 'AI Scanner', 'For Farmers', 'About', 'Support', 'Privacy', 'Terms']
  return (
    <footer style={{ background: 'var(--ground)', borderTop: '1px solid var(--hairline)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--hairline)' }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-.025em', marginBottom: '.5rem' }}>
              FarmDirect<span style={{ color: 'var(--amber)' }}>.</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>Fresh From Farms. Trusted By You.</div>
          </div>
          {/* Links */}
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {links.map(l => (
              <a key={l} href="#" className="label" style={{ textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--amber)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                {l}
              </a>
            ))}
          </div>
        </div>
        {/* Copyright */}
        <div style={{ padding: '1.25rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span className="label" style={{ fontSize: 10 }}>© 2026 FarmDirect. All rights reserved.</span>
          <span className="label" style={{ fontSize: 10 }}>Demo project — data is illustrative only.</span>
        </div>
      </div>

      {/* Full-width cropped wordmark */}
      <div style={{
        overflow: 'hidden', borderTop: '1px solid var(--hairline)', lineHeight: 1,
        transform: 'translateY(28%)',
      }}>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 'clamp(5rem, 18vw, 14rem)',
          letterSpacing: '-.04em', color: 'transparent',
          WebkitTextStroke: '1px rgba(237,231,220,.1)',
          padding: '0 2.5rem', whiteSpace: 'nowrap',
          userSelect: 'none',
        }}>
          FarmDirect<span style={{ WebkitTextStrokeColor: 'rgba(232,145,60,.2)' }}>.</span>
        </div>
      </div>
    </footer>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // Initialize scroll reveals globally
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      document.querySelectorAll('.r-up').forEach(el => el.classList.add('in'))
      return
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in') } })
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' })
    document.querySelectorAll('.r-up').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ground)' }}>
      <Navbar />
      <PortalHero />
      <Ticker />
      <TrustStrip />
      <StatementFold />
      <HowItWorks />
      <AIScanner />
      <Marketplace />
      <FarmerConnection />
      <OrderTimeline />
      <TechSection />
      <TrustSection />
      <FinalCTA />
      <Footer />
    </div>
  )
}

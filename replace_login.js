const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'web-app/src/pages/LoginPage.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Replace state
content = content.replace(
  "const [mode, setMode] = useState<'pick' | 'buyer-email' | 'buyer-otp' | 'buyer-profile' | 'farmer'>('pick')",
  "const [mode, setMode] = useState<'pick' | 'email' | 'otp' | 'profile'>('pick')\n  const [selectedRole, setSelectedRole] = useState<'buyer'|'farmer'>('buyer')"
);

// 2. Replace farmer email/pwd states
content = content.replace(/const \[farmerEmail.*\n.*farmerPwd.*\n.*showPwd.*\n.*farmerMode.*\n/g, "");

// 3. Replace sendOtp
content = content.replace(
  "setMode('buyer-otp')",
  "setMode('otp')"
);

// 4. Replace verifyOtp
content = content.replace(
  /async function verifyOtp\(\) \{[\s\S]*?async function completeBuyerProfile/m,
`async function verifyOtp() {
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

  async function completeProfile`
);

// 5. Replace completeBuyerProfile
content = content.replace(
  /async function completeProfile\(\) \{[\s\S]*?async function demoLogin/m,
`async function completeProfile() {
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

  async function demoLogin`
);

// 6. Delete farmerAuth
content = content.replace(/async function farmerAuth\(\) \{[\s\S]*?\}\n\n/m, "");

// 7. Update UI: 'pick'
content = content.replace(
  "onClick={() => setMode('farmer')}",
  "onClick={() => { setSelectedRole('farmer'); setMode('email') }}"
);
content = content.replace(
  "onClick={() => setMode('buyer-email')}",
  "onClick={() => { setSelectedRole('buyer'); setMode('email') }}"
);

// 8. Update UI: 'buyer-email' -> 'email'
content = content.replace(
  "{mode === 'buyer-email' && (",
  "{mode === 'email' && ("
);
content = content.replace(
  "<h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '.35rem' }}>Buyer Sign In</h2>",
  "<h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '.35rem' }}>{selectedRole === 'farmer' ? 'Farmer Sign In' : 'Buyer Sign In'}</h2>"
);

// 9. Update UI: 'buyer-otp' -> 'otp'
content = content.replace(
  "{mode === 'buyer-otp' && (",
  "{mode === 'otp' && ("
);
content = content.replace(
  "onClick={() => { setMode('buyer-email'); setError('') }}",
  "onClick={() => { setMode('email'); setError('') }}"
);

// 10. Update UI: 'buyer-profile' -> 'profile'
content = content.replace(
  "{mode === 'buyer-profile' && (",
  "{mode === 'profile' && ("
);
content = content.replace(
  /onClick=\{completeBuyerProfile\}/g,
  "onClick={completeProfile}"
);

// We need to inject the Farm Name input if selectedRole is farmer inside profile
content = content.replace(
  `{ label: 'Delivery Address', val: address, set: setAddress, ph: 'Flat no., Street, City, State', icon: <Home size={14} /> },`,
  `{ label: 'Delivery Address', val: address, set: setAddress, ph: 'Flat no., Street, City, State', icon: <Home size={14} /> },
                ...(selectedRole === 'farmer' ? [{ label: 'Farm Name', val: farmName, set: setFarmName, ph: 'Green Valley Farm', icon: <span style={{fontSize:14}}>🌾</span> }] : []),`
);

// 11. Delete mode === 'farmer' section
content = content.replace(/\{\/\* ── FARMER: EMAIL \+ PASSWORD ──[\s\S]*?Use demo account instead\n                <\/button>\n              <\/div>\n            <\/div>\n          \)\}/m, "");

fs.writeFileSync(file, content);
console.log('done');

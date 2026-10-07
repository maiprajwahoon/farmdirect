const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'web-app/src/pages/LoginPage.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace sendOtp
content = content.replace(
  /async function sendOtp\(\) \{[\s\S]*?setLoading\(false\); setMode\('otp'\)\n  \}/m,
`async function sendOtp() {
    if (!email.includes('@')) return err('Enter a valid email address.')
    setLoading(true); setError('')
    
    // DEVELOPER BYPASS
    if (email === 'littobiju1982@gmail.com') {
      setTimeout(() => {
        setLoading(false); setMode('otp');
      }, 500);
      return;
    }

    const { error: e } = await supabase.auth.signInWithOtp({ email })
    if (e) return err(e.message)
    setLoading(false); setMode('otp')
  }`
);

// Replace verifyOtp
content = content.replace(
  /async function verifyOtp\(\) \{[\s\S]*?setLoading\(false\); setMode\('profile'\)\n    \}\n  \}/m,
`async function verifyOtp() {
    if (otp.length < 6) return err('Enter the 6-digit OTP sent to your email.')
    setLoading(true); setError('')

    // DEVELOPER BYPASS
    if (email === 'littobiju1982@gmail.com') {
      setTimeout(() => {
        const fakeSession = {
          access_token: \`dev-\${Date.now()}\`,
          user: { id: 'littobiju1982', email: 'littobiju1982@gmail.com', user_metadata: {} }
        } as any;
        setSupaSession(fakeSession);
        setLoading(false);
        setMode('profile');
      }, 500);
      return;
    }

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
  }`
);

fs.writeFileSync(file, content);
console.log('done');

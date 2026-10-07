import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, FlatList, Image, KeyboardAvoidingView, Modal, Platform,
  Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from './src/theme';
import { api } from './src/services/mockApi';
import { Asset } from 'expo-asset';

const resolveLocal = (img) => Asset.fromModule(img).uri;
import { categories, demoOrders, products } from './src/data';

import NearbyScreen from './src/screens/Nearby';
import FarmerProductsScreen from './src/screens/FarmerProducts';

const STORAGE = { intro: 'fd_intro_seen', user: 'fd_user', cart: 'fd_cart', wishlist: 'fd_wishlist' };

function MainApp() {
  const [booting, setBooting] = useState(true);
  const [introSeen, setIntroSeen] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [tab, setTab] = useState('Home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [screen, setScreen] = useState(null);
  const [screenData, setScreenData] = useState(null);
  const [liveProducts, setLiveProducts] = useState(products);
  const [orders, setOrders] = useState(demoOrders);
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Order is out for delivery', body: 'FD-240924-081 is on the way.', time: '12 min ago', read: false, type: 'order' },
    { id: 'n2', title: 'Fresh spinach restocked', body: 'Village Greens added new harvest stock.', time: '2 hrs ago', read: false, type: 'product' },
    { id: 'n3', title: 'Welcome to FarmDirect', body: 'Shop directly from local agricultural communities.', time: 'Today', read: true, type: 'info' }
  ]);

  const fetchLiveProducts = async () => {
    try {
      const data = await api.searchProducts('');
      if (data && Array.isArray(data) && data.length > 0) {
        setLiveProducts(data);
        // Sync global products array in-memory
        products.length = 0;
        products.push(...data);
      }
    } catch (e) {}
  };

  const fetchLiveOrders = async () => {
    try {
      const data = await api.getOrders();
      if (data && Array.isArray(data)) {
        setOrders(prev => {
          const map = new Map();
          // Server orders first
          data.forEach(o => {
            map.set(o.id, {
              ...o,
              total: Number(o.total !== undefined ? o.total : (o.totalAmount || 0)),
              farmer: o.farmer || 'Green Valley Farm',
            });
          });
          // Keep local demo orders that aren't on server
          prev.forEach(o => {
            if (!map.has(o.id)) map.set(o.id, o);
          });
          return Array.from(map.values());
        });
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchLiveProducts();
    fetchLiveOrders();
    const interval = setInterval(() => {
      fetchLiveProducts();
      fetchLiveOrders();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [intro, storedUser, storedCart, storedWishlist] = await Promise.all([
          AsyncStorage.getItem(STORAGE.intro), AsyncStorage.getItem(STORAGE.user), AsyncStorage.getItem(STORAGE.cart), AsyncStorage.getItem(STORAGE.wishlist)
        ]);
        setIntroSeen(intro === '1');
        setUser(storedUser ? JSON.parse(storedUser) : null);
        setCart(storedCart ? JSON.parse(storedCart) : {});
        setWishlist(storedWishlist ? JSON.parse(storedWishlist) : []);
      } finally { setBooting(false); }
    })();
  }, []);

  useEffect(() => { if (!booting) AsyncStorage.setItem(STORAGE.cart, JSON.stringify(cart)); }, [cart, booting]);
  useEffect(() => { if (!booting) AsyncStorage.setItem(STORAGE.wishlist, JSON.stringify(wishlist)); }, [wishlist, booting]);

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);
  const go = (name, data = null) => { setScreen(name); setScreenData(data); };
  const back = () => { setScreen(null); setScreenData(null); };

  const finishIntro = async () => { setIntroSeen(true); await AsyncStorage.setItem(STORAGE.intro, '1'); };
  const onAuth = async (nextUser) => { setUser(nextUser); await AsyncStorage.setItem(STORAGE.user, JSON.stringify(nextUser)); setTab('Home'); };
  
  const logout = async () => { 
    try {
      const { supabase } = require('./src/services/supabase');
      await supabase.auth.signOut();
    } catch(e) {} 
    setUser(null); 
    await AsyncStorage.removeItem(STORAGE.user); 
    setScreen(null); 
  };

  const addToCart = (productId, qty = 1, productData = null) => {
    if (productData) {
      const exists = products.find(p => p.id === productId);
      if (!exists) products.push(productData);
    }
    setCart((c) => ({ ...c, [productId]: Math.max(0, (c[productId] || 0) + qty) }));
  };
  const setQty = (productId, qty) => setCart((c) => ({ ...c, [productId]: Math.max(0, qty) }));
  const toggleWishlist = (productId) => setWishlist((w) => w.includes(productId) ? w.filter((id) => id !== productId) : [...w, productId]);

  if (booting) return <SplashBoot />;
  if (!introSeen) return <Onboarding onDone={finishIntro} />;
  if (!user) return <AuthScreen onAuth={onAuth} />;

  if (screen) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
        <View style={styles.appContainer}>
          {screen === 'product' && <ProductDetail product={screenData} back={back} cartCount={cartCount} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} go={go} />}
          {screen === 'cart' && <CartScreen back={back} cart={cart} setQty={setQty} go={go} products={liveProducts} />}
          {screen === 'checkout' && <CheckoutScreen back={back} cart={cart} setCart={setCart} addOrder={(o) => setOrders((x) => [o, ...x])} go={go} products={liveProducts} user={user} />}
          {screen === 'confirmation' && <Confirmation order={screenData} go={go} back={back} />}
          {screen === 'order' && <OrderDetails order={orders.find(o => o.id === screenData?.id || o.orderNumber === screenData?.id || o.id === screenData?.orderNumber) || screenData} back={back} />}
          {screen === 'notifications' && <Notifications items={notifications} setItems={setNotifications} back={back} />}
          {screen === 'wishlist' && <Wishlist wishlist={wishlist} products={liveProducts} toggleWishlist={toggleWishlist} addToCart={addToCart} go={go} back={back} />}
          {screen === 'support' && <Support back={back} />}
          {screen === 'settings' && <SettingsScreen back={back} logout={logout} />}
          {screen === 'farmerProducts' && <FarmerProductsScreen farmer={screenData.farmer} back={back} addToCart={addToCart} />}
          {screen === 'scan' && <Scanner go={go} back={back} products={liveProducts} addToCart={addToCart} />}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
      <View style={styles.appContainer}>
        <View style={{ flex: 1 }}>
          {tab === 'Home' && <Home user={user} products={liveProducts} go={go} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} cartCount={cartCount} notifications={notifications} setTab={setTab} onSelectCategory={(cat) => { setSelectedCategory(cat); setTab('Explore'); }} onRefreshProducts={fetchLiveProducts} />}
          {tab === 'Explore' && <Explore products={liveProducts} go={go} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} cartCount={cartCount} category={selectedCategory} setCategory={setSelectedCategory} />}
          {tab === 'Nearby' && <NearbyScreen go={go} />}
          {tab === 'Orders' && <Orders orders={orders} go={go} cartCount={cartCount} notificationsCount={notifications.filter(x=>!x.read).length} />}
          {tab === 'Profile' && <Profile user={user} go={go} logout={logout} wishlistCount={wishlist.length} ordersCount={orders.length} />}
        </View>
        <BottomNav tab={tab} setTab={setTab} cartCount={cartCount} />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

function SplashBoot() {
  return <View style={styles.splash}><View style={styles.brandMark}><Ionicons name="leaf" size={38} color={colors.surface} /></View><Text style={styles.splashTitle}>FarmDirect</Text><Text style={styles.splashSub}>Fresh From Farms. Trusted By You.</Text></View>;
}

function Onboarding({ onDone }) {
  const [page, setPage] = useState(0);
  const slides = [
    { icon: '🌾', title: 'Know Where Your Food Comes From', body: 'Discover fresh produce sourced directly from farmers and local agricultural communities.' },
    { icon: '📷', title: 'Check Quality With AI', body: 'Use the AI-powered scanner to explore visible produce quality indicators and make informed shopping decisions.' },
    { icon: '🧺', title: 'Freshness, Delivered', body: 'Shop quality-checked produce and track your order from farm to doorstep.' }
  ];
  const item = slides[page];
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.appContainer}>
        <View style={styles.onboardTop}><Text style={styles.logoText}>FarmDirect</Text><Pressable onPress={onDone}><Text style={styles.linkText}>Skip</Text></Pressable></View>
        <View style={styles.onboardCenter}><View style={styles.onboardVisual}><Text style={{ fontSize: 82 }}>{item.icon}</Text></View><Text style={styles.onboardTitle}>{item.title}</Text><Text style={styles.onboardBody}>{item.body}</Text></View>
        <View style={styles.onboardBottom}><View style={styles.dots}>{slides.map((_, i) => <View key={i} style={[styles.dot, i === page && styles.dotActive]} />)}</View><Pressable style={styles.primaryButton} onPress={() => page < slides.length - 1 ? setPage(page + 1) : onDone()}><Text style={styles.primaryButtonText}>{page < 2 ? 'Next' : 'Get Started'}</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></Pressable></View>
      </View>
    </SafeAreaView>
  );
}

function AuthScreen({ onAuth }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  
  // Login state
  const [email, setEmail] = useState(''); 
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  
  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtp, setRegOtp] = useState('');
  
  const [busy, setBusy] = useState(false); 
  const [error, setError] = useState('');
  
  const handleSendOtp = async () => { 
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setBusy(true); setError(''); 
    try { 
      await api.sendOtp(email.trim());
      setOtpSent(true);
    } catch(e) { 
      setError(e.message); 
    } finally { 
      setBusy(false); 
    } 
  };

  const handleVerifyOtp = async () => { 
    if (!otp.trim()) {
      setError('Please enter the OTP sent to your email.');
      return;
    }
    setBusy(true); setError(''); 
    try { 
      const u = await api.verifyOtp(email.trim(), otp.trim());
      await onAuth(u); 
    } catch(e) { 
      setError(e.message); 
    } finally { 
      setBusy(false); 
    } 
  };

  const handleCreateUser = async () => {
    if (!regName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() && !regPhone.trim()) {
      setError('Please provide an email or phone number.');
      return;
    }

    if (!regOtpSent) {
      setBusy(true); setError('');
      // Simulate sending OTP
      setTimeout(() => {
        setBusy(false);
        setRegOtpSent(true);
      }, 1000);
      return;
    }

    if (!regOtp.trim() || (regOtp !== '1234' && regOtp !== '123456')) {
      setError('Invalid OTP. For demo purposes, enter 1234.');
      return;
    }

    setBusy(true); setError('');
    try {
      const newUser = await api.registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        address: regAddress.trim(),
      });
      await onAuth(newUser);
    } catch (e) {
      setError(e.message || 'Failed to create account.');
    } finally {
      setBusy(false);
    }
  };

  const handleDemoLogin = async () => {
    setBusy(true); setError('');
    try {
      const demoUser = await api.demoLogin();
      await onAuth(demoUser);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.appContainer}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex:1}}>
          <ScrollView contentContainerStyle={styles.authWrap} keyboardShouldPersistTaps="handled">
            <View style={styles.authBrand}>
              <View style={styles.brandMark}>
                <Ionicons name="leaf" size={30} color={colors.surface} />
              </View>
              <Text style={styles.authTitle}>FarmDirect</Text>
              <Text style={styles.authSub}>Fresh from farms. Trusted by you.</Text>
            </View>

            {/* Auth Mode Switcher */}
            <View style={{ flexDirection: 'row', backgroundColor: '#E9EFEA', borderRadius: 14, padding: 4, marginBottom: 20 }}>
              <Pressable
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderRadius: 11,
                  backgroundColor: tab === 'login' ? '#FFF' : 'transparent',
                  shadowColor: '#000',
                  shadowOpacity: tab === 'login' ? 0.08 : 0,
                  shadowRadius: 4,
                  elevation: tab === 'login' ? 2 : 0,
                }}
                onPress={() => { setTab('login'); setError(''); }}
              >
                <Text style={{ fontWeight: '800', fontSize: 14, color: tab === 'login' ? colors.primary : colors.muted }}>
                  Sign In
                </Text>
              </Pressable>

              <Pressable
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderRadius: 11,
                  backgroundColor: tab === 'register' ? '#FFF' : 'transparent',
                  shadowColor: '#000',
                  shadowOpacity: tab === 'register' ? 0.08 : 0,
                  shadowRadius: 4,
                  elevation: tab === 'register' ? 2 : 0,
                }}
                onPress={() => { setTab('register'); setError(''); }}
              >
                <Text style={{ fontWeight: '800', fontSize: 14, color: tab === 'register' ? colors.primary : colors.muted }}>
                  Create New User
                </Text>
              </Pressable>
            </View>

            {tab === 'login' ? (
              <>
                <Text style={styles.authHeading}>Login with OTP</Text>
                
                {!otpSent ? (
                  <>
                    <Field label="Email" value={email} setValue={setEmail} placeholder="you@example.com" keyboard="email-address" autoCapitalize="none" />
                    {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
                    <Pressable style={styles.primaryButton} onPress={handleSendOtp} disabled={busy || !email}>
                      {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Send OTP</Text>}
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Field label="OTP Code" value={otp} setValue={setOtp} placeholder="123456" keyboard="number-pad" />
                    {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
                    <Pressable style={styles.primaryButton} onPress={handleVerifyOtp} disabled={busy || !otp}>
                      {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Verify & Login</Text>}
                    </Pressable>
                    <Pressable onPress={() => {setOtpSent(false); setError('');}}><Text style={styles.switchAuth}>Use a different email</Text></Pressable>
                  </>
                )}
                
                <Text style={styles.demoHint}>An OTP will be sent to your email.</Text>

                {/* Quick Demo Buyer Login */}
                <View style={{ marginTop: 22, paddingTop: 18, borderTopWidth: 1, borderColor: colors.border }}>
                  <Pressable
                    style={[styles.secondaryButtonWide, { marginTop: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}
                    onPress={handleDemoLogin}
                    disabled={busy}
                  >
                    <Ionicons name="sparkles-outline" size={17} color={colors.primary} />
                    <Text style={styles.secondaryButtonText}>Quick Login as Demo Buyer</Text>
                  </Pressable>
                  <Text style={{ textAlign: 'center', fontSize: 11, color: colors.muted, marginTop: 7 }}>
                    Instant access as Sunita Patil • No OTP needed
                  </Text>
                </View>

                {/* Switch to Register */}
                <Pressable onPress={() => { setTab('register'); setError(''); }} style={{ marginTop: 16 }}>
                  <Text style={{ textAlign: 'center', color: colors.ink, fontSize: 13 }}>
                    Don't have an account? <Text style={{ color: colors.primary, fontWeight: '800' }}>Create New User</Text>
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.authHeading}>Create New Account</Text>
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: -12, marginBottom: 16 }}>
                  Register to buy organic and farm-fresh produce directly from local growers.
                </Text>

                {!regOtpSent ? (
                  <>
                    <Field label="Full Name *" value={regName} setValue={setRegName} placeholder="e.g. Priya Sharma" />
                    <Field label="Email Address *" value={regEmail} setValue={setRegEmail} placeholder="you@example.com" keyboard="email-address" autoCapitalize="none" />
                    <Field label="Mobile Number" value={regPhone} setValue={setRegPhone} placeholder="+91 98201 45829" keyboard="phone-pad" />
                    <Field label="Delivery Address / City" value={regAddress} setValue={setRegAddress} placeholder="e.g. Flat 302, Andheri West, Mumbai" />
                  </>
                ) : (
                  <>
                    <Field label="OTP Code *" value={regOtp} setValue={setRegOtp} placeholder="123456" keyboard="number-pad" />
                    <Text style={{ color: colors.primary, fontSize: 12, marginBottom: 16, marginTop: -6 }}>
                      An OTP has been sent to your email / phone.
                    </Text>
                  </>
                )}

                {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

                <Pressable
                  style={[styles.primaryButton, (!regName.trim() || (!regEmail.trim() && !regPhone.trim()) || (regOtpSent && !regOtp.trim()) || busy) && { opacity: 0.6 }]}
                  onPress={handleCreateUser}
                  disabled={busy || !regName.trim() || (!regEmail.trim() && !regPhone.trim()) || (regOtpSent && !regOtp.trim())}
                >
                  {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{regOtpSent ? 'Verify OTP & Create Account' : 'Send OTP'}</Text>}
                </Pressable>

                {regOtpSent && (
                  <Pressable onPress={() => { setRegOtpSent(false); setRegOtp(''); setError(''); }} style={{ marginTop: 12, alignItems: 'center' }}>
                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>Back to edit details</Text>
                  </Pressable>
                )}

                <Pressable onPress={() => { setTab('login'); setError(''); }} style={{ marginTop: 16 }}>
                  <Text style={{ textAlign: 'center', color: colors.ink, fontSize: 13 }}>
                    Already have an account? <Text style={{ color: colors.primary, fontWeight: '800' }}>Sign In</Text>
                  </Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, value, setValue, placeholder, secure, keyboard }) { return <View style={{marginBottom:12}}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={setValue} placeholder={placeholder} placeholderTextColor="#9AA19C" secureTextEntry={secure} keyboardType={keyboard} autoCapitalize="none" style={styles.input} /></View>; }

function Header({ name, cartCount, onCart, onNotifications, notificationsCount = 0 }) {
  return <View style={styles.header}><View><Text style={styles.greeting}>Good morning,</Text><Text style={styles.headerName}>{name || 'Buyer'} 👋</Text><View style={styles.locationRow}><Ionicons name="location-outline" size={14} color={colors.primary} /><Text style={styles.locationText}>Virar, Maharashtra</Text><Ionicons name="chevron-down" size={12} color={colors.muted} /></View></View><View style={styles.headerActions}><IconButton icon="notifications-outline" onPress={onNotifications} badge={notificationsCount} /><IconButton icon="cart-outline" onPress={onCart} badge={cartCount} /></View></View>;
}
function IconButton({ icon, onPress, badge }) { return <Pressable onPress={onPress} style={styles.iconButton}><Ionicons name={icon} size={23} color={colors.ink} />{badge ? <View style={styles.badge}><Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text></View> : null}</Pressable>; }
function SearchBar({ value, setValue, placeholder='Search vegetables, fruits & fresh produce...', onScan }) {
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search" size={20} color={colors.muted}/>
      <TextInput value={value} onChangeText={setValue} placeholder={placeholder} placeholderTextColor="#929B95" style={styles.searchInput}/>
      {value ? (
        <Pressable onPress={() => setValue('')}><Ionicons name="close-circle" size={18} color="#A0A9A3" /></Pressable>
      ) : onScan ? (
        <Pressable onPress={onScan} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EAF4EE', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 }}>
          <Ionicons name="scan-outline" size={16} color={colors.primary} />
          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>AI Scan</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Home({ user, products, go, addToCart, wishlist, toggleWishlist, cartCount, notifications, setTab, onSelectCategory, onRefreshProducts }) {
  const [query, setQuery] = useState(''); const [refreshing, setRefreshing] = useState(false);
  const visible = useMemo(() => query ? products.filter(p => (p.name + p.category + p.farmer).toLowerCase().includes(query.toLowerCase())) : products, [query, products]);
  const featured = visible.slice(0, 8);
  return <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => {setRefreshing(true); if (onRefreshProducts) await onRefreshProducts(); setRefreshing(false);}} tintColor={colors.primary} />}><Header name={user.name} cartCount={cartCount} notificationsCount={notifications?.filter(x=>!x.read).length || 0} onCart={() => go('cart')} onNotifications={() => go('notifications')} /><SearchBar value={query} setValue={setQuery} onScan={() => go('scan')}/><View style={styles.hero}><View style={{flex:1}}><Text style={styles.heroEyebrow}>FRESH • LOCAL • TRANSPARENT</Text><Text style={styles.heroTitle}>Fresh From Local Farms</Text><Text style={styles.heroBody}>Quality produce with prices and seller details you can understand.</Text><Pressable style={styles.heroButton} onPress={() => setTab ? setTab('Explore') : {}}><Text style={styles.heroButtonText}>Shop now</Text><Ionicons name="arrow-forward" size={16} color={colors.primaryDark}/></Pressable></View><View style={styles.heroArt}><Text style={{fontSize:64}}>🥬</Text><Text style={{fontSize:48, position:'absolute', right:-5, bottom:-8}}>🍅</Text></View></View><SectionHeader title="Shop by category" action="See all" onPress={() => setTab ? setTab('Explore') : {}}/><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingBottom:4}}>{categories.map(c => <Pressable key={c.key} style={styles.categoryBubble} onPress={() => onSelectCategory ? onSelectCategory(c.key) : go('product', products.find(p => p.category === c.key) || products[0])}><Text style={{fontSize:26}}>{c.icon}</Text><Text style={styles.categoryText} numberOfLines={1}>{c.key}</Text></Pressable>)}</ScrollView><View style={styles.quickRow}><QuickCard icon="scan-outline" title="AI Scan" body="Check visible quality" onPress={() => go('scan')}/><QuickCard icon="people-outline" title="Local Farmers" body="Explore sellers" onPress={() => setTab ? setTab('Explore') : {}}/></View><SectionHeader title="Featured produce" action="View all" onPress={() => setTab ? setTab('Explore') : {}}/><View style={styles.grid}>{featured.map(p => <ProductCard key={p.id} product={p} onPress={() => go('product', p)} addToCart={() => addToCart(p.id)} wished={wishlist.includes(p.id)} toggleWish={() => toggleWishlist(p.id)} />)}</View></ScrollView>;
}
function SectionHeader({ title, action, onPress }) { return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{action ? <Pressable onPress={onPress}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}</View>; }
function QuickCard({ icon, title, body, onPress }) { return <Pressable style={styles.quickCard} onPress={onPress}><View style={styles.quickIcon}><Ionicons name={icon} size={22} color={colors.primary}/></View><View style={{flex:1}}><Text style={styles.quickTitle}>{title}</Text><Text style={styles.quickBody}>{body}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted}/></Pressable>; }

function ProductCard({ product, onPress, addToCart, wished, toggleWish }) {
  const isOutOfStock = (product.quantity !== undefined && product.quantity <= 0) || product.available === false;
  return (
    <Pressable onPress={onPress} style={[styles.productCard, isOutOfStock && { opacity: 0.65 }]}>
      <View style={styles.productImageWrap}>
        <Image source={{uri: product.image}} style={styles.productImage}/>
        <View style={styles.aiTagBadge}>
          <Ionicons name="sparkles" size={10} color="#7C3AED" />
          <Text style={styles.aiTagBadgeText}>AI Photo</Text>
        </View>
        <Pressable style={styles.wishBtn} onPress={(e)=>{e?.stopPropagation?.();toggleWish();}}>
          <Ionicons name={wished ? 'heart' : 'heart-outline'} size={18} color={wished ? colors.danger : colors.ink}/>
        </Pressable>
        {isOutOfStock ? (
          <View style={[styles.verifiedBadge, { backgroundColor: '#EF4444' }]}>
            <Text style={[styles.verifiedText, { color: '#FFF' }]}>Sold Out</Text>
          </View>
        ) : product.quality === 'Verified' ? (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={11} color={colors.success}/>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : null}
      </View>
      <View style={{paddingTop:9}}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.productMeta}>{product.farmer} • {product.location}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.priceText}>₹{product.price}<Text style={styles.unitText}>/{product.unit}</Text></Text>
          <Pressable 
            style={[styles.addButton, isOutOfStock && { backgroundColor: '#9CA3AF' }]} 
            onPress={(e)=>{
              e?.stopPropagation?.();
              if (!isOutOfStock) addToCart();
            }}
            disabled={isOutOfStock}
          >
            <Ionicons name={isOutOfStock ? "ban" : "add"} size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function Explore({ products, go, addToCart, wishlist, toggleWishlist, cartCount, category = 'All', setCategory }) {
  const [q, setQ] = useState(''); const [sort, setSort] = useState('default');
  const [cat, setCat] = useState(category || 'All');
  useEffect(() => { if (category) setCat(category); }, [category]);
  const handleCategory = (c) => { setCat(c); if (setCategory) setCategory(c); };
  const filtered = useMemo(() => { let list = products.filter(p => (cat === 'All' || p.category === cat) && (p.name + p.category + p.farmer + p.location).toLowerCase().includes(q.toLowerCase())); if (sort === 'price') list = [...list].sort((a,b)=>a.price-b.price); if (sort === 'fresh') list = [...list].sort((a,b)=> a.harvest === 'Today' ? -1 : 1); return list; }, [q, cat, sort]);
  return <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}><View style={styles.simpleHeader}><View><Text style={styles.screenEyebrow}>MARKETPLACE</Text><Text style={styles.screenTitle}>Explore fresh produce</Text></View><IconButton icon="cart-outline" onPress={() => go('cart')} badge={cartCount || 0}/></View><SearchBar value={q} setValue={setQ} onScan={() => go('scan')}/><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8, paddingVertical:12}}>{['All', ...categories.map(c=>c.key)].map(c => <Pressable key={c} onPress={()=>handleCategory(c)} style={[styles.chip, cat===c && styles.chipActive]}><Text style={[styles.chipText, cat===c && styles.chipTextActive]}>{c}</Text></Pressable>)}</ScrollView><View style={styles.filterRow}><Text style={styles.resultsText}>{filtered.length} products</Text><Pressable style={styles.sortBtn} onPress={()=>setSort(sort==='default' ? 'price' : sort==='price' ? 'fresh' : 'default')}><Ionicons name="swap-vertical" size={16} color={colors.ink}/><Text style={styles.sortText}>{sort === 'default' ? 'Sort' : sort === 'price' ? 'Price' : 'Freshness'}</Text></Pressable></View><View style={styles.grid}>{filtered.map(p => <ProductCard key={p.id} product={p} onPress={()=>go('product', p)} addToCart={()=>addToCart(p.id)} wished={wishlist.includes(p.id)} toggleWish={()=>toggleWishlist(p.id)} />)}</View></ScrollView>;
}

function ProductDetail({ product, back, cartCount, addToCart, wishlist, toggleWishlist, go }) {
  const [qty, setQty] = useState(1);
  const handleAdd = () => { addToCart(product.id, qty); Alert.alert('Added to Cart', `${qty} × ${product.name} added to your cart.`); };
  return <ScrollView style={styles.screen} contentContainerStyle={{paddingBottom:30}}><View style={styles.detailImageWrap}><Image source={{uri: product.image}} style={styles.detailImage}/>{product.isAiGenerated && <View style={styles.detailAiPill}><Ionicons name="sparkles" size={12} color="#7C3AED" /><Text style={styles.detailAiPillText}>AI Studio Produce Photography</Text></View>}<Pressable style={styles.floatingBack} onPress={back}><Ionicons name="arrow-back" size={22} color={colors.ink}/></Pressable><Pressable style={styles.floatingCart} onPress={()=>go('cart')}><Ionicons name="cart-outline" size={22} color={colors.ink}/>{cartCount ? <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View> : null}</Pressable></View><View style={styles.detailBody}><View style={styles.rowBetween}><View style={{flex:1}}><Text style={styles.detailTitle}>{product.name}</Text><Text style={styles.detailSub}>{product.farmer} • {product.location}</Text></View><Pressable style={styles.detailWish} onPress={()=>toggleWishlist(product.id)}><Ionicons name={wishlist.includes(product.id) ? 'heart' : 'heart-outline'} size={24} color={wishlist.includes(product.id) ? colors.danger : colors.ink}/></Pressable></View><View style={styles.priceLine}><Text style={styles.detailPrice}>₹{product.price}</Text><Text style={styles.detailUnit}> / {product.unit}</Text><View style={[styles.statusPill, product.quality==='Verified' ? styles.successPill : product.quality==='Pending' ? styles.warnPill : styles.neutralPill]}><Text style={[styles.statusText, product.quality==='Verified' ? styles.successText : product.quality==='Pending' ? styles.warnText : styles.neutralText]}>{product.quality}</Text></View></View><Text style={styles.detailDesc}>{product.description}</Text><InfoSection title="Quality information"><InfoRow icon="shield-checkmark-outline" title="Quality status" value={product.quality}/><InfoRow icon="leaf-outline" title="Harvest date" value={product.harvest}/><Text style={styles.disclaimer}>AI estimates and seller-provided details are informational and do not replace professional inspection or food-safety testing.</Text></InfoSection><InfoSection title="From the farmer"><InfoRow icon="person-outline" title="Farm" value={product.farmer}/><InfoRow icon="location-outline" title="Location" value={product.location}/></InfoSection><View style={styles.qtyBox}><Text style={styles.qtyLabel}>Quantity</Text><View style={styles.qtyControls}><Pressable onPress={()=>setQty(Math.max(1, qty-1))} style={styles.qtyBtn}><Ionicons name="remove" size={18} color={colors.ink}/></Pressable><Text style={styles.qtyValue}>{qty}</Text><Pressable onPress={()=>setQty(qty+1)} style={styles.qtyBtn}><Ionicons name="add" size={18} color={colors.ink}/></Pressable></View></View><View style={styles.actionRow}><Pressable style={styles.secondaryButton} onPress={handleAdd}><Ionicons name="cart-outline" size={19} color={colors.primary}/><Text style={styles.secondaryButtonText}>Add to Cart</Text></Pressable><Pressable style={styles.primaryButtonFlex} onPress={()=>{addToCart(product.id, qty); go('cart')}}><Text style={styles.primaryButtonText}>Buy Now</Text></Pressable></View></View></ScrollView>;
}
function InfoSection({ title, children }) { return <View style={styles.infoSection}><Text style={styles.infoSectionTitle}>{title}</Text>{children}</View>; }
function InfoRow({ icon, title, value }) { return <View style={styles.infoRow}><Ionicons name={icon} size={19} color={colors.primary}/><View style={{flex:1}}><Text style={styles.infoTitle}>{title}</Text><Text style={styles.infoValue}>{value}</Text></View></View>; }

function CartScreen({ back, cart, setQty, go }) {
  const items = Object.entries(cart).filter(([,q])=>q>0).map(([id,qty])=>({product:products.find(p=>p.id===id),qty})).filter(x=>x.product);
  const subtotal = items.reduce((s,{product,qty})=>s+product.price*qty,0); const delivery = subtotal ? 30 : 0; const total = subtotal+delivery;
  return <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}><SimpleBack title="Your cart" back={back}/>{items.length===0 ? <EmptyState icon="cart-outline" title="Your cart is empty" body="Add a few fresh picks from the marketplace to get started." action="Explore produce" onPress={back}/> : <><Text style={styles.smallMuted}>{items.length} item groups</Text>{items.map(({product,qty})=><View key={product.id} style={styles.cartItem}><Image source={{uri:product.image}} style={styles.cartImage}/><View style={{flex:1}}><Text style={styles.cartName}>{product.name}</Text><Text style={styles.cartMeta}>{product.farmer}</Text><Text style={styles.cartPrice}>₹{product.price} / {product.unit}</Text><View style={styles.cartBottom}><View style={styles.qtyControls}><Pressable onPress={()=>setQty(product.id, qty-1)} style={styles.qtyBtn}><Ionicons name="remove" size={16} color={colors.ink}/></Pressable><Text style={styles.qtyValue}>{qty}</Text><Pressable onPress={()=>setQty(product.id, qty+1)} style={styles.qtyBtn}><Ionicons name="add" size={16} color={colors.ink}/></Pressable></View><Text style={styles.itemSubtotal}>₹{product.price*qty}</Text></View></View></View>)}<View style={styles.summaryCard}><Text style={styles.summaryTitle}>Order summary</Text><SummaryRow label="Items subtotal" value={`₹${subtotal}`}/><SummaryRow label="Delivery" value={`₹${delivery}`}/><View style={styles.summaryDivider}/><SummaryRow label="Total" value={`₹${total}`} strong/></View><Pressable style={styles.secondaryButtonWide} onPress={back}><Text style={styles.secondaryButtonText}>Continue Shopping</Text></Pressable><Pressable style={styles.primaryButton} onPress={()=>go('checkout')}><Text style={styles.primaryButtonText}>Proceed to Checkout</Text><Ionicons name="arrow-forward" size={17} color="#fff"/></Pressable></>}</ScrollView>;
}
function SummaryRow({label,value,strong}) { return <View style={styles.rowBetween}><Text style={[styles.summaryRow, strong&&styles.summaryStrong]}>{label}</Text><Text style={[styles.summaryRow, strong&&styles.summaryStrong]}>{value}</Text></View>; }

function CheckoutScreen({ back, cart, setCart, addOrder, go, products: catalogProducts, user }) {
  const [step, setStep] = useState(1); 
  const [address, setAddress] = useState('Flat 402, Sai Residency, Virar East, Maharashtra'); 
  const [slot, setSlot] = useState('Today • 6:00 PM – 8:00 PM'); 
  const [payment, setPayment] = useState('UPI'); 
  const [busy, setBusy] = useState(false);
  const [upiPin, setUpiPin] = useState('');
  const prodList = catalogProducts && catalogProducts.length > 0 ? catalogProducts : products;
  const items = Object.entries(cart)
    .filter(([,q]) => q > 0)
    .map(([id, qty]) => ({ product: prodList.find(p => p.id === id) || products.find(p => p.id === id), qty }))
    .filter(x => x.product);

  const subtotal = items.reduce((s, x) => s + x.product.price * x.qty, 0); 
  const delivery = subtotal ? 30 : 0; 
  const total = subtotal + delivery;

  const place = async () => {
    try {
      setBusy(true); 
      const farmer = items[0]?.product?.farmer || 'Green Valley Farm';
      const buyerName = user?.name || 'Sunita Patil';
      const buyerPhone = user?.phone || '+91 98201 45829';
      const o = await api.checkout({
        items,
        total,
        address,
        slot,
        payment,
        status: 'Confirmed',
        buyerName,
        buyerPhone,
        farmer,
      }); 
      addOrder(o); 
      setCart({}); 
      go('confirmation', o);
    } catch (err) {
      const msg = err.message || 'Make sure your backend server is running and accessible.';
      if (Platform.OS === 'web') {
        window.alert(`Checkout Failed: ${msg}`);
      } else {
        Alert.alert('Checkout Failed', msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}>
      <SimpleBack title="Checkout" back={back} />
      <View style={styles.steps}>
        {['Address', 'Delivery', 'Payment', 'Review'].map((x, i) => {
          const n = i + 1;
          return (
            <View key={x} style={styles.stepItem}>
              <View style={[styles.stepCircle, n <= step && styles.stepCircleActive]}>
                <Text style={[styles.stepNo, n <= step && styles.stepNoActive]}>{n}</Text>
              </View>
              <Text style={[styles.stepLabel, n <= step && { color: colors.primary, fontWeight: '700' }]}>{x}</Text>
            </View>
          );
        })}
      </View>
      {step === 1 && (
        <CheckoutCard title="Delivery address">
          <TextInput value={address} onChangeText={setAddress} style={styles.textArea} multiline />
          <Text style={styles.demoHint}>Enter your delivery address for farm-fresh doorstep drop.</Text>
        </CheckoutCard>
      )}
      {step === 2 && (
        <CheckoutCard title="Delivery option">
          {['Today • 6:00 PM – 8:00 PM', 'Tomorrow • 9:00 AM – 12:00 PM'].map((x) => (
            <OptionRow key={x} label={x} selected={slot === x} onPress={() => setSlot(x)} icon="time-outline" />
          ))}
          <Text style={styles.demoHint}>Scheduled harvest dispatch directly from the farm.</Text>
        </CheckoutCard>
      )}
      {step === 3 && (
        <CheckoutCard title="Payment">
          {['UPI', 'Card', 'Cash on Delivery'].map((x) => (
            <OptionRow key={x} label={x} selected={payment === x} onPress={() => setPayment(x)} icon={x === 'UPI' ? 'phone-portrait-outline' : x === 'Card' ? 'card-outline' : 'cash-outline'} />
          ))}
          <Text style={styles.demoHint}>Select your preferred payment method.</Text>
        </CheckoutCard>
      )}
      {step === 4 && (
        <>
          <CheckoutCard title="Review order">
            <SummaryRow label="Items" value={`₹${subtotal}`} />
            <SummaryRow label="Delivery" value={`₹${delivery}`} />
            <SummaryRow label="Payment" value={payment} />
            <SummaryRow label="Slot" value={slot} />
            <SummaryRow label="Address" value={address} />
            <View style={styles.summaryDivider} />
            <SummaryRow label="Total" value={`₹${total}`} strong />
          </CheckoutCard>
          <View style={styles.trustBox}>
            <Ionicons name="shield-checkmark" size={21} color={colors.success} />
            <Text style={styles.trustText}>FarmDirect guarantees 100% direct-from-farm produce with transparent fair pricing.</Text>
          </View>
        </>
      )}
      {step === 5 && (
        <View style={{ alignItems: 'center', paddingVertical: 30 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 20 }}>Scan & Pay</Text>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
            <Ionicons name="phone-portrait-outline" size={60} color={colors.primary} style={{ opacity: 0.8 }} />
          </View>
          <Text style={{ fontSize: 32, fontWeight: '900', color: colors.primary, marginBottom: 4 }}>₹{total}</Text>
          <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 30 }}>FarmDirect UPI Gateway</Text>
          <View style={{ width: '100%', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.muted, marginBottom: 10 }}>ENTER UPI PIN</Text>
            <TextInput
              style={{ fontSize: 24, letterSpacing: 10, textAlign: 'center', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 15, borderWidth: 1, borderColor: colors.border }}
              secureTextEntry
              maxLength={6}
              keyboardType="number-pad"
              autoFocus
              value={upiPin}
              onChangeText={(v) => setUpiPin(v.replace(/\D/g, ''))}
              placeholder="••••"
            />
          </View>
        </View>
      )}
      <Pressable 
        style={[styles.primaryButton, (step === 5 && upiPin.length < 4) && { opacity: 0.5 }]} 
        onPress={() => {
          if (step < 4) setStep(step + 1);
          else if (step === 4 && payment === 'UPI') setStep(5);
          else place();
        }} 
        disabled={busy || (step === 5 && upiPin.length < 4)}
      >
        {busy ? <ActivityIndicator color="#fff" /> : (
          <>
            <Text style={styles.primaryButtonText}>
              {step < 4 ? 'Continue' : step === 4 ? (payment === 'UPI' ? 'Proceed to Pay' : 'Place Farm Order') : `Pay ₹${total} securely`}
            </Text>
            <Ionicons name={step === 5 ? 'checkmark-circle-outline' : 'arrow-forward'} size={17} color="#fff" />
          </>
        )}
      </Pressable>
      {step > 1 ? (
        <Pressable style={styles.centerLink} onPress={() => setStep(step - 1)}>
          <Text style={styles.sectionAction}>Back a step</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function CheckoutCard({ title, children }) { return <View style={styles.checkoutCard}><Text style={styles.infoSectionTitle}>{title}</Text>{children}</View>; }
function OptionRow({ label, selected, onPress, icon }) { return <Pressable style={[styles.optionRow, selected && styles.optionSelected]} onPress={onPress}><Ionicons name={icon} size={20} color={selected ? colors.primary : colors.muted} /><Text style={styles.optionLabel}>{label}</Text><Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={21} color={selected ? colors.primary : '#B9C1BC'} /></Pressable>; }

function Confirmation({ order, go, back }) {
  const total = Number(order.total !== undefined ? order.total : (order.totalAmount || 0));
  const orderId = order.orderNumber || order.id;
  const slot = order.deliverySlot || order.slot || 'Today • 6:00 PM – 8:00 PM';

  return (
    <View style={styles.confirmWrap}>
      <View style={styles.successCircle}>
        <Ionicons name="checkmark" size={42} color={colors.success} />
      </View>
      <Text style={styles.confirmTitle}>Order placed successfully!</Text>
      <Text style={styles.confirmBody}>The farmer has been notified and will prepare your fresh harvest.</Text>
      <View style={styles.summaryCard}>
        <SummaryRow label="Order ID" value={orderId} />
        <SummaryRow label="Total" value={`₹${total}`} strong />
        <SummaryRow label="Delivery" value={slot} />
        <SummaryRow label="Address" value={order.deliveryAddress || order.address || 'Virar East'} />
      </View>
      <Pressable style={styles.primaryButton} onPress={() => go('order', order)}>
        <Text style={styles.primaryButtonText}>View Order Details</Text>
        <Ionicons name="arrow-forward" size={17} color="#fff" />
      </Pressable>
      <Pressable style={styles.secondaryButtonWide} onPress={back}>
        <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
      </Pressable>
    </View>
  );
}

function normalizeStatus(status) {
  if (!status) return 'Confirmed';
  const s = String(status).toLowerCase().replace(/_/g, ' ');
  if (s === 'delivered') return 'Delivered';
  if (s === 'picked up' || s === 'out for delivery' || s === 'out_for_delivery') return 'Out for Delivery';
  if (s === 'accepted' || s === 'preparing' || s === 'ready' || s === 'processing') return 'Processing';
  if (s === 'cancelled' || s === 'rejected') return 'Cancelled';
  return 'Confirmed';
}

function StatusBadge({ status }) {
  const norm = normalizeStatus(status);
  const s = String(status || '').toLowerCase().replace(/_/g, ' ');
  let label = norm;
  if (s === 'accepted') label = 'Accepted';
  else if (s === 'preparing') label = 'Preparing';
  else if (s === 'ready') label = 'Ready for Pickup';

  const map = {
    Delivered: ['successPill', 'successText'],
    Confirmed: ['infoPill', 'infoText'],
    'Out for Delivery': ['warnPill', 'warnText'],
    Processing: ['neutralPill', 'neutralText'],
    Cancelled: ['dangerPill', 'dangerText'],
  };
  const [pillCls, textCls] = map[norm] || map.Confirmed;

  return (
    <View style={[styles.statusPill, styles[pillCls]]}>
      <Text style={[styles.statusText, styles[textCls]]}>{label}</Text>
    </View>
  );
}

function Orders({ orders, go, cartCount, notificationsCount }) {
  const [filter, setFilter] = useState('All');
  const list = orders.filter((o) => {
    if (filter === 'All') return true;
    return normalizeStatus(o.status) === filter;
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}>
      <View style={styles.simpleHeader}>
        <View>
          <Text style={styles.screenEyebrow}>MY ORDERS</Text>
          <Text style={styles.screenTitle}>Track every delivery</Text>
        </View>
        <IconButton icon="notifications-outline" onPress={() => go('notifications')} badge={notificationsCount || 0} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
        {['All', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((s) => (
          <Pressable key={s} style={[styles.chip, filter === s && styles.chipActive]} onPress={() => setFilter(s)}>
            <Text style={[styles.chipText, filter === s && styles.chipTextActive]}>{s}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {list.map((o) => (
        <OrderCard key={o.id || o.orderNumber} order={o} onPress={() => go('order', o)} />
      ))}
      {!list.length ? (
        <EmptyState icon="receipt-outline" title="No orders here" body="Orders from this status filter will appear here." />
      ) : null}
    </ScrollView>
  );
}

function OrderCard({ order, onPress }) {
  const resolvedItems = Array.isArray(order.items) && order.items.length > 0 
    ? order.items 
    : (order.buyer && Array.isArray(order.buyer.items) && order.buyer.items.length > 0 ? order.buyer.items : null);

  const itemsList = resolvedItems
    ? resolvedItems
    : (order.cropName ? [{ name: order.cropName, quantity: order.quantity, unit: order.quantityUnit }] : []);

  const totalAmount = Number(order.total !== undefined ? order.total : (order.totalAmount || 0));
  const itemsCount = itemsList.length || 1;
  const itemsSummary = itemsList.map((it) => it.productName || it.name || it.cropName || 'Fresh Produce').join(', ');
  const orderId = order.orderNumber || order.id;
  const farmerName = order.farmer || order.farmerName || 'Green Valley Farm';
  const orderDate = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Today');

  const previewPhoto = (order.photos && order.photos[0]) || (itemsList[0] && itemsList[0].image);

  return (
    <Pressable style={styles.orderCard} onPress={onPress}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.orderId}>#{orderId}</Text>
          <Text style={styles.orderDate}>{orderDate}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>
      <View style={styles.orderLine} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 }}>
        {previewPhoto ? (
          <Image source={{ uri: previewPhoto }} style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#E5E7EB' }} />
        ) : (
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#DEF7EC', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="leaf" size={22} color={colors.primary} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.orderItems} numberOfLines={1}>{itemsSummary || `${itemsCount} item group`}</Text>
          <Text style={styles.orderSeller}>{farmerName} • {order.slot || order.deliverySlot || 'Doorstep Delivery'}</Text>
        </View>
        <Text style={styles.orderTotal}>₹{totalAmount}</Text>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.linkText}>View details & tracking</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
}

function OrderDetails({ order, back }) {
  const steps = ['Confirmed', 'Processing', 'Out for Delivery', 'Delivered'];
  const norm = normalizeStatus(order.status);
  const current = Math.max(0, steps.indexOf(norm));

  const resolvedItems = Array.isArray(order.items) && order.items.length > 0 
    ? order.items 
    : (order.buyer && Array.isArray(order.buyer.items) && order.buyer.items.length > 0 ? order.buyer.items : null);

  const itemsList = resolvedItems
    ? resolvedItems
    : (order.cropName ? [{
        productName: order.cropName,
        variety: order.variety || 'Fresh Harvest',
        quantity: order.quantity || 1,
        unit: order.quantityUnit || 'kg',
        price: order.pricePerUnit || (order.total || order.totalAmount || 50),
        image: order.photos?.[0],
      }] : []);

  const totalAmount = Number(order.total !== undefined ? order.total : (order.totalAmount || 0));
  const subtotal = itemsList.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || it.qty || 1)), 0);
  const delivery = subtotal > 0 && totalAmount > subtotal ? (totalAmount - subtotal) : 30;
  const orderId = order.orderNumber || order.id;
  const deliveryAddress = order.deliveryAddress || order.address || 'Flat 402, Sai Residency, Virar East, Maharashtra';
  const deliverySlot = order.deliverySlot || order.slot || 'Today • 6:00 PM – 8:00 PM';
  const farmerName = order.farmer || 'Green Valley Farm';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}>
      <SimpleBack title="Order details" back={back} />
      
      {/* Hero Header */}
      <View style={styles.orderHero}>
        <View style={styles.rowBetween}>
          <Text style={styles.orderHeroId}>#{orderId}</Text>
          <StatusBadge status={order.status} />
        </View>
        <Text style={styles.orderEta}>
          <Ionicons name="time-outline" size={14} color="#EAF4EE" /> Expected: {deliverySlot}
        </Text>
      </View>

      {/* Live Timeline Tracking */}
      <InfoSection title="Delivery Tracking">
        <View style={{ marginTop: 8 }}>
          {steps.map((s, i) => {
            const isDone = i <= current;
            const isNow = i === current;
            return (
              <View key={s} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, isDone && styles.timelineDotActive]} />
                  {i < steps.length - 1 ? (
                    <View style={[styles.timelineLine, i < current && styles.timelineLineActive]} />
                  ) : null}
                </View>
                <View style={{ flex: 1, paddingBottom: 10 }}>
                  <Text style={[styles.timelineTitle, isDone && { color: colors.primary, fontWeight: '800' }]}>
                    {s}
                  </Text>
                  <Text style={styles.timelineSub}>
                    {isNow ? 'Current progress' : isDone ? 'Completed' : 'Pending'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </InfoSection>

      {/* Seller & Delivery Info */}
      <InfoSection title="Seller & Delivery Information">
        <InfoRow icon="person-outline" title="Farmer Seller" value={farmerName} />
        <InfoRow icon="location-outline" title="Delivery Address" value={deliveryAddress} />
        <InfoRow icon="time-outline" title="Scheduled Window" value={deliverySlot} />
        <InfoRow icon="card-outline" title="Payment Method" value={order.paymentMethod || order.payment || 'UPI'} />
      </InfoSection>

      {/* Items Breakdown with Thumbnails */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Ordered Produce ({itemsList.length})</Text>
        {itemsList.map((it, idx) => {
          const name = it.productName || it.name || 'Fresh Produce';
          const qty = Number(it.quantity || it.qty || 1);
          const unit = it.unit || 'kg';
          const price = Number(it.price || 0);
          const itemTotal = price * qty;
          const img = it.image || (order.photos && order.photos[idx]);

          return (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: idx < itemsList.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
              {img ? (
                <Image source={{ uri: img }} style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#E5E7EB' }} />
              ) : (
                <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#DEF7EC', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="leaf" size={18} color={colors.primary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.ink }}>{name}</Text>
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{qty} {unit} × ₹{price}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.ink }}>₹{itemTotal || totalAmount}</Text>
            </View>
          );
        })}
        
        <View style={styles.summaryDivider} />
        <SummaryRow label="Items Subtotal" value={`₹${subtotal || (totalAmount - delivery)}`} />
        <SummaryRow label="Delivery Charges" value={`₹${delivery}`} />
        <View style={styles.summaryDivider} />
        <SummaryRow label="Total Amount" value={`₹${totalAmount}`} strong />
      </View>

      <View style={styles.trustBox}>
        <Ionicons name="shield-checkmark" size={21} color={colors.success} />
        <Text style={styles.trustText}>All produce is fresh, farm-sourced, and quality verified before dispatch.</Text>
      </View>
    </ScrollView>
  );
}

function Scanner({ go, back, products, addToCart }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOn, setCameraOn] = useState(false);
  const [facing, setFacing] = useState('back');
  const [torch, setTorch] = useState(false);
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [procStep, setProcStep] = useState('Initializing scan...');
  const [result, setResult] = useState(null);
  const cameraRef = useRef(null);

  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let anim;
    if (cameraOn || processing) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(scanAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
        ])
      );
      anim.start();
    }
    return () => anim && anim.stop();
  }, [cameraOn, processing]);

  const runAnalysis = async (imgUri, hint = '', base64 = null) => {
    setImage(imgUri);
    setCameraOn(false);
    setProcessing(true);
    setResult(null);

    setProcStep('Scanning produce surface & identifying crop...');
    const t1 = setTimeout(() => setProcStep('Analyzing visible quality & defects...'), 500);
    const t2 = setTimeout(() => setProcStep('Evaluating freshness & market pricing...'), 1000);

    try {
      const res = await api.scanProduce(imgUri, hint, base64);
      setResult(res);
    } catch (e) {
      Alert.alert('Scan Analysis Notice', 'Using local high-precision produce analyzer.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setProcessing(false);
    }
  };

  const capture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6, base64: true });
      if (photo?.uri) {
        await runAnalysis(photo.uri, '', photo.base64);
      }
    } catch (e) {
      Alert.alert('Capture Error', 'Could not take photo from camera.');
    }
  };

  const gallery = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.6,
        base64: true,
        allowsEditing: true,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        const asset = res.assets[0];
        const uri = asset.uri;
        let hint = '';
        const lower = uri.toLowerCase();
        if (lower.includes('tomato') || lower.includes('tamatar')) hint = 'tomato';
        else if (lower.includes('spinach') || lower.includes('palak')) hint = 'spinach';
        else if (lower.includes('capsicum') || lower.includes('pepper')) hint = 'capsicum';
        else if (lower.includes('potato') || lower.includes('aloo')) hint = 'potato';
        else if (lower.includes('onion') || lower.includes('pyaz')) hint = 'onion';
        else if (lower.includes('carrot') || lower.includes('gajar')) hint = 'carrot';
        else if (lower.includes('banana') || lower.includes('kela')) hint = 'banana';
        else if (lower.includes('guava') || lower.includes('amrud')) hint = 'guava';
        else if (lower.includes('mango') || lower.includes('aam')) hint = 'mango';
        else if (lower.includes('cucumber') || lower.includes('kheera')) hint = 'cucumber';
        await runAnalysis(uri, hint, asset.base64);
      }
    } catch (e) {
      Alert.alert('Upload Error', 'Could not open photo library.');
    }
  };

  const SAMPLES = [
    { name: 'Tomatoes', emoji: '🍅', hint: 'tomato', img: resolveLocal(require('./assets/produce/tomatoes.jpg')) },
    { name: 'Spinach', emoji: '🥬', hint: 'spinach', img: resolveLocal(require('./assets/produce/spinach.jpg')) },
    { name: 'Capsicum', emoji: '🫑', hint: 'capsicum', img: resolveLocal(require('./assets/produce/capsicum.jpg')) },
    { name: 'Potatoes', emoji: '🥔', hint: 'potato', img: resolveLocal(require('./assets/produce/potatoes.jpg')) },
    { name: 'Onions', emoji: '🧅', hint: 'onion', img: resolveLocal(require('./assets/produce/onions.jpg')) },
    { name: 'Carrots', emoji: '🥕', hint: 'carrot', img: resolveLocal(require('./assets/produce/carrots.jpg')) },
  ];

  if (!permission && Platform.OS !== 'web') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // Camera View
  if (cameraOn && !image) {
    const translateY = scanAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [10, 260],
    });

    return (
      <View style={styles.cameraScreen}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          enableTorch={torch}
        />
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraTop}>
            <Pressable style={styles.cameraCircle} onPress={() => setCameraOn(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.cameraTitle}>AI Produce Scanner</Text>
              <Text style={{ fontSize: 11, color: '#D1FAE5', marginTop: 2 }}>Point at vegetable or fruit</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                style={[styles.cameraCircle, torch && { backgroundColor: 'rgba(255,255,255,0.4)' }]}
                onPress={() => setTorch(!torch)}
              >
                <Ionicons name={torch ? "flash" : "flash-outline"} size={20} color="#fff" />
              </Pressable>
              <Pressable
                style={styles.cameraCircle}
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
              >
                <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* Scanner Reticle Frame */}
          <View style={styles.scanFrame}>
            <View style={[styles.frameCorner, styles.ftl]} />
            <View style={[styles.frameCorner, styles.ftr]} />
            <View style={[styles.frameCorner, styles.fbl]} />
            <View style={[styles.frameCorner, styles.fbr]} />
            <Animated.View
              style={[
                styles.scanLaser,
                { transform: [{ translateY }] },
              ]}
            />
            <View style={styles.scanPillCenter}>
              <Ionicons name="sparkles" size={13} color="#fff" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>Analyzing Visible Characteristics</Text>
            </View>
          </View>

          {/* Camera Bottom Controls */}
          <View style={styles.cameraBottom}>
            <Text style={styles.cameraGuide}>Center produce inside frame under good lighting</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-around', paddingHorizontal: 30 }}>
              <Pressable style={styles.galleryFloatBtn} onPress={gallery}>
                <Ionicons name="images-outline" size={24} color="#fff" />
              </Pressable>
              <Pressable style={styles.captureButton} onPress={capture}>
                <View style={styles.captureInner} />
              </Pressable>
              <View style={{ width: 48 }} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Analyzing Overlay (while image is processing)
  if (processing) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}>
        <SimpleBack title="AI Produce Scanner" back={() => setProcessing(false)} />
        <View style={styles.analyzingCard}>
          {image ? (
            <View style={styles.analyzingImageWrap}>
              <Image source={{ uri: image }} style={styles.analyzingImage} />
              <View style={styles.analyzingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.analyzingTitle}>AI Quality Analysis</Text>
                <Text style={styles.analyzingStepText}>{procStep}</Text>
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.analyzingTitle}>Processing Produce...</Text>
              <Text style={styles.analyzingStepText}>{procStep}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // Result View
  if (result) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}>
        <View style={styles.simpleHeader}>
          <View>
            <Text style={styles.screenEyebrow}>AI SCAN REPORT</Text>
            <Text style={styles.screenTitle}>{result.cropName}</Text>
          </View>
          <Pressable
            onPress={() => {
              setImage(null);
              setResult(null);
            }}
            style={styles.rescanPill}
          >
            <Ionicons name="refresh" size={15} color={colors.primary} />
            <Text style={styles.rescanText}>Scan Again</Text>
          </Pressable>
        </View>

        <ScanResult
          result={result}
          image={image}
          products={products}
          addToCart={addToCart}
          go={go}
          onScanAgain={() => {
            setImage(null);
            setResult(null);
          }}
          onBack={back}
        />
      </ScrollView>
    );
  }

  // Intro / Selector View
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}>
      <SimpleBack title="AI Produce Scanner" back={back} />

      <View style={styles.scanIntroCard}>
        <View style={styles.scanIconBig}>
          <Ionicons name="scan" size={44} color={colors.primary} />
        </View>
        <Text style={styles.scanCardEyebrow}>AI-POWERED PRODUCE INSPECTION</Text>
        <Text style={styles.scanCardTitle}>Check Freshness & Grade Before You Buy</Text>
        <Text style={styles.scanBody}>
          Point your phone camera at fresh vegetables or fruits. Our computer vision evaluates surface integrity, color saturation, ripeness stage, and blemishes in real-time.
        </Text>

        <View style={styles.scanActionsWrap}>
          <Pressable
            style={styles.primaryButton}
            onPress={async () => {
              if (Platform.OS === 'web') {
                gallery();
                return;
              }
              const r = await requestPermission();
              if (r?.granted) {
                setCameraOn(true);
              } else {
                gallery();
              }
            }}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>
              {Platform.OS === 'web' ? 'Scan with Camera / Upload' : 'Launch Live Camera'}
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryButtonWide} onPress={gallery}>
            <Ionicons name="images-outline" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Choose Photo from Gallery</Text>
          </Pressable>
        </View>
      </View>

      {/* Quick Demo Test Produce Samples */}
      <View style={{ marginTop: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.ink }}>
            Interactive Demo: Quick Test Samples
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted, fontWeight: '600' }}>Tap to inspect</Text>
        </View>

        <View style={styles.sampleGrid}>
          {SAMPLES.map((s) => (
            <Pressable
              key={s.name}
              style={styles.sampleCard}
              onPress={() => runAnalysis(s.img, s.hint)}
            >
              <Text style={{ fontSize: 32 }}>{s.emoji}</Text>
              <Text style={styles.sampleCardName}>{s.name}</Text>
              <View style={styles.sampleScanPill}>
                <Ionicons name="sparkles" size={10} color={colors.primary} />
                <Text style={styles.sampleScanText}>AI Test</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Educational info card */}
      <View style={styles.trustCard}>
        <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.trustCardTitle}>How FarmDirect AI Scanner Works</Text>
          <Text style={styles.trustCardBody}>
            Our visual inspection model analyzes optical reflections, pigment uniformity, stem attachment, and skin defect ratios to give you transparent quality insights direct from harvest photos.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function ScanResult({ result, image, products, addToCart, go, onScanAgain, onBack }) {
  const matchedProduct = products?.find((p) => {
    if (result.buyerInsights?.matchedProductId && p.id === result.buyerInsights.matchedProductId) return true;
    const pName = (p.name || '').toLowerCase();
    const cName = (result.cropName || '').toLowerCase();
    return pName.includes(cName) || cName.includes(pName);
  });

  return (
    <View style={{ gap: 14 }}>
      {/* Photo with AI Inspection Badge */}
      <View style={styles.scanImageCard}>
        {image ? (
          <Image source={{ uri: image }} style={styles.scanResultImage} resizeMode="cover" />
        ) : (
          <View style={styles.scanPlaceholder}>
            <Ionicons name="leaf" size={48} color={colors.primary} />
          </View>
        )}
        <View style={styles.scanResultOverlayTag}>
          <Ionicons name="shield-checkmark" size={12} color="#059669" />
          <Text style={styles.scanResultOverlayText}>Visual Quality Inspected</Text>
        </View>
        <View style={styles.scanTimePill}>
          <Text style={styles.scanTimeText}>{result.displayTime || 'Scanned Just Now'}</Text>
        </View>
      </View>

      {/* Grade & Score Summary Hero Card */}
      <View style={styles.resultSummaryCard}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.resultCropTitle}>{result.cropName}</Text>
            <Text style={styles.resultVarietyText}>{result.variety} • {result.category}</Text>
          </View>
          <View style={styles.gradeBadgeLarge}>
            <Text style={styles.gradeBadgeText}>{result.grade}</Text>
            <Text style={styles.gradeSubText}>Score: {result.qualityScore}%</Text>
          </View>
        </View>

        {/* Confidence & Score Bar */}
        <View style={{ marginTop: 14, backgroundColor: '#F3F5F2', borderRadius: 12, padding: 12 }}>
          <View style={styles.rowBetween}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.ink }}>
              AI Detection Confidence
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primary }}>
              {Math.round((result.confidence || 0.95) * 100)}%
            </Text>
          </View>
          <View style={styles.scoreBarTrack}>
            <View style={[styles.scoreBarFill, { width: `${Math.round((result.confidence || 0.95) * 100)}%` }]} />
          </View>
        </View>
      </View>

      {/* Ripeness & Freshness Gauge */}
      <View style={styles.resultCard}>
        <View style={styles.resultCardHeader}>
          <Ionicons name="timer-outline" size={20} color={colors.primary} />
          <Text style={styles.resultCardTitle}>Ripeness & Harvest Freshness</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.ink }}>
              {result.ripeness?.level || 'Ripe & Ready'}
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
              {result.ripeness?.harvestWindow || `Freshness expected: ${result.shelfLifeDays || 5} days`}
            </Text>
          </View>
          <View style={styles.ripenessPill}>
            <Text style={styles.ripenessPillText}>{result.ripeness?.percentage || 94}% Maturity</Text>
          </View>
        </View>
      </View>

      {/* 4-Grid Physical Quality Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCardBox}>
          <Ionicons name="sparkles-outline" size={18} color="#7C3AED" />
          <Text style={styles.metricValBold}>{result.metrics?.surfaceGloss || '92%'}</Text>
          <Text style={styles.metricLabelSub}>Surface Sheen</Text>
        </View>
        <View style={styles.metricCardBox}>
          <Ionicons name="color-palette-outline" size={18} color="#D97706" />
          <Text style={styles.metricValBold}>{result.metrics?.colorUniformity || '94%'}</Text>
          <Text style={styles.metricLabelSub}>Color Uniformity</Text>
        </View>
        <View style={styles.metricCardBox}>
          <Ionicons name="fitness-outline" size={18} color="#2563EB" />
          <Text style={styles.metricValBold}>{result.metrics?.firmnessScore || '91%'}</Text>
          <Text style={styles.metricLabelSub}>Flesh Firmness</Text>
        </View>
        <View style={styles.metricCardBox}>
          <Ionicons name="checkmark-done-circle-outline" size={18} color="#059669" />
          <Text style={styles.metricValBold}>{result.metrics?.blemishFreeRatio || '97%'}</Text>
          <Text style={styles.metricLabelSub}>Blemish-Free</Text>
        </View>
      </View>

      {/* Detailed Observations */}
      <View style={styles.resultCard}>
        <View style={styles.resultCardHeader}>
          <Ionicons name="eye-outline" size={20} color={colors.primary} />
          <Text style={styles.resultCardTitle}>Visible Quality Observations</Text>
        </View>
        <View style={{ marginTop: 8, gap: 8 }}>
          {result.observations?.map((obs, idx) => (
            <View key={idx} style={styles.obsRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} style={{ marginTop: 1 }} />
              <Text style={styles.obsText}>{obs}</Text>
            </View>
          ))}
          {result.defects?.map((def, idx) => (
            <View key={`def-${idx}`} style={styles.defectRow}>
              <Ionicons name="information-circle" size={18} color="#D97706" style={{ marginTop: 1 }} />
              <Text style={styles.defectText}>Surface check: {def}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Buyer Culinary & Storage Advice */}
      <View style={styles.resultCard}>
        <View style={styles.resultCardHeader}>
          <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
          <Text style={styles.resultCardTitle}>Kitchen & Storage Recommendations</Text>
        </View>
        <View style={{ marginTop: 8, gap: 10 }}>
          <View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' }}>
              Best Culinary Use
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink, marginTop: 2 }}>
              {result.buyerInsights?.bestUse || 'Fresh salads, curries, and daily nutritious cooking.'}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' }}>
              Storage Tip
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink, marginTop: 2 }}>
              {result.buyerInsights?.storageTip || 'Keep in well-ventilated dry conditions.'}
            </Text>
          </View>
        </View>
      </View>

      {/* Marketplace Link / Add to Cart Card */}
      {matchedProduct ? (
        <View style={styles.matchedProduceCard}>
          <View style={styles.matchedHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="cart" size={16} color={colors.primary} />
              <Text style={styles.matchedEyebrow}>BUY THIS FRESH HARVEST DIRECT</Text>
            </View>
            <Text style={styles.matchedFarmerBadge}>{matchedProduct.farmer}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }}>
            <Image source={{ uri: matchedProduct.image }} style={styles.matchedThumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.matchedTitle}>{matchedProduct.name}</Text>
              <Text style={styles.matchedLoc}>{matchedProduct.location} • Sourced directly</Text>
              <Text style={styles.matchedPrice}>
                ₹{matchedProduct.price} <Text style={{ fontSize: 11, color: colors.muted }}>/{matchedProduct.unit}</Text>
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Pressable
              style={styles.matchedDetailsBtn}
              onPress={() => go('product', matchedProduct)}
            >
              <Text style={styles.matchedDetailsText}>View Produce</Text>
            </Pressable>
            <Pressable
              style={styles.matchedAddBtn}
              onPress={() => {
                addToCart(matchedProduct.id, 1, matchedProduct);
                Alert.alert('Produce Added', `1 ${matchedProduct.unit} of ${matchedProduct.name} added to your cart.`);
              }}
            >
              <Ionicons name="cart" size={16} color="#fff" />
              <Text style={styles.matchedAddText}>Add to Cart</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={{ marginTop: 6, gap: 10 }}>
        <Pressable style={styles.primaryButton} onPress={onScanAgain}>
          <Ionicons name="camera-outline" size={18} color="#fff" />
          <Text style={styles.primaryButtonText}>Scan Another Produce</Text>
        </Pressable>

        <Pressable style={styles.secondaryButtonWide} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Return to Marketplace</Text>
        </Pressable>
      </View>

      <Text style={styles.scanDisclaimerText}>
        {result.disclaimer || 'AI-generated visible surface quality estimate. Does not replace laboratory food-safety or chemical residue testing.'}
      </Text>
    </View>
  );
}

function Profile({ user, go, logout, wishlistCount, ordersCount }) { return <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}><View style={styles.profileHero}><View style={styles.avatar}><Text style={styles.avatarText}>{(user.name||'B').slice(0,1).toUpperCase()}</Text></View><Text style={styles.profileName}>{user.name}</Text><Text style={styles.profileEmail}>{user.email}</Text></View><View style={styles.profileStats}><Stat number={ordersCount} label="Orders"/><Stat number={wishlistCount} label="Wishlist"/><Stat number="3" label="Saved addresses"/></View><Text style={styles.profileSection}>Account</Text><ProfileRow icon="person-outline" title="Personal details" onPress={()=>Alert.alert('Personal details','Connect this panel to the authenticated buyer profile endpoint.')}/><ProfileRow icon="heart-outline" title="Wishlist" badge={wishlistCount} onPress={()=>go('wishlist')}/><ProfileRow icon="location-outline" title="Saved addresses" onPress={()=>Alert.alert('Saved addresses','Address management is scaffolded for backend integration.')}/><Text style={styles.profileSection}>Support & settings</Text><ProfileRow icon="notifications-outline" title="Notifications" onPress={()=>go('notifications')}/><ProfileRow icon="help-circle-outline" title="Help & Support" onPress={()=>go('support')}/><ProfileRow icon="settings-outline" title="Settings" onPress={()=>go('settings')}/><ProfileRow icon="document-text-outline" title="Privacy & Terms" onPress={()=>Alert.alert('Privacy & Terms','Add your final legal copy and links before production release.')}/><Pressable style={styles.logoutButton} onPress={logout}><Ionicons name="log-out-outline" size={18} color={colors.danger}/><Text style={styles.logoutText}>Log out</Text></Pressable></ScrollView>; }
function Stat({number,label}) { return <View style={{alignItems:'center',flex:1}}><Text style={styles.statNum}>{number}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function ProfileRow({icon,title,badge,onPress}) { return <Pressable style={styles.profileRow} onPress={onPress}><View style={styles.profileRowIcon}><Ionicons name={icon} size={20} color={colors.primary}/></View><Text style={styles.profileRowTitle}>{title}</Text>{badge ? <View style={styles.smallBadge}><Text style={styles.badgeText}>{badge}</Text></View>:null}<Ionicons name="chevron-forward" size={18} color={colors.muted}/></Pressable>; }

function Notifications({items,setItems,back}) { return <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}><SimpleBack title="Notifications" back={back}/><View style={styles.notificationActions}><Text style={styles.smallMuted}>{items.filter(x=>!x.read).length} unread</Text><Pressable onPress={()=>setItems(items.map(x=>({...x,read:true})))}><Text style={styles.sectionAction}>Mark all read</Text></Pressable></View>{items.map(n=><Pressable key={n.id} style={[styles.notificationCard,!n.read&&styles.notificationUnread]} onPress={()=>setItems(items.map(x=>x.id===n.id?{...x,read:true}:x))}><View style={styles.notificationIcon}><Ionicons name={n.type==='order'?'cube-outline':n.type==='product'?'leaf-outline':'sparkles-outline'} size={20} color={colors.primary}/></View><View style={{flex:1}}><View style={styles.rowBetween}><Text style={styles.notificationTitle}>{n.title}</Text>{!n.read?<View style={styles.unreadDot}/>:null}</View><Text style={styles.notificationBody}>{n.body}</Text><Text style={styles.notificationTime}>{n.time}</Text></View></Pressable>)}</ScrollView>; }

function Wishlist({wishlist,products,toggleWishlist,addToCart,go,back}) { const list=wishlist.map(id=>products.find(p=>p.id===id)).filter(Boolean); return <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}><SimpleBack title="Wishlist" back={back}/>{list.length?<View style={styles.grid}>{list.map(p=><ProductCard key={p.id} product={p} onPress={()=>go('product',p)} addToCart={()=>addToCart(p.id)} wished toggleWish={()=>toggleWishlist(p.id)}/>)}</View>:<EmptyState icon="heart-outline" title="Nothing saved yet" body="Tap the heart on any produce card to keep it here for later."/>}</ScrollView>; }

function Support({back}) { const faqs=['How are quality indicators shown?','Can I cancel an order?','How does the AI scanner work?','What happens if an item is unavailable?']; return <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}><SimpleBack title="Help & Support" back={back}/><View style={styles.supportHero}><Ionicons name="headset-outline" size={33} color={colors.primary}/><Text style={styles.supportTitle}>We’re here to help</Text><Text style={styles.supportBody}>Use these FAQs or connect this screen to your support/WhatsApp workflow.</Text></View><Text style={styles.profileSection}>FAQ</Text>{faqs.map(q=><Pressable key={q} style={styles.faqRow} onPress={()=>Alert.alert(q,'Add your final support answer or link this question to your help center.') }><Text style={styles.faqText}>{q}</Text><Ionicons name="chevron-forward" size={18} color={colors.muted}/></Pressable>)}<Text style={styles.profileSection}>Contact</Text><Pressable style={styles.contactCard} onPress={()=>Alert.alert('Support channel','Connect this CTA to your official support number or WhatsApp API.') }><Ionicons name="logo-whatsapp" size={26} color={colors.success}/><View style={{flex:1}}><Text style={styles.contactTitle}>WhatsApp support</Text><Text style={styles.contactBody}>Official integration hook</Text></View><Ionicons name="arrow-forward" size={18} color={colors.primary}/></Pressable><Pressable style={styles.contactCard} onPress={()=>Alert.alert('Issue report','Wire this action to your order/support endpoint.') }><Ionicons name="flag-outline" size={24} color={colors.accent}/><View style={{flex:1}}><Text style={styles.contactTitle}>Report an issue</Text><Text style={styles.contactBody}>Order, delivery or product issue</Text></View><Ionicons name="arrow-forward" size={18} color={colors.primary}/></Pressable></ScrollView>; }
function SettingsScreen({back,logout}) { const [language,setLanguage]=useState('English'); const [push,setPush]=useState(true); return <ScrollView style={styles.screen} contentContainerStyle={styles.screenPad}><SimpleBack title="Settings" back={back}/><Text style={styles.profileSection}>Preferences</Text><SettingRow icon="language-outline" title="Language" value={language} onPress={()=>setLanguage(language==='English'?'हिन्दी':'English')}/><SettingRow icon="notifications-outline" title="Push notifications" value={push?'On':'Off'} onPress={()=>setPush(!push)}/><SettingRow icon="moon-outline" title="Appearance" value="Light" onPress={()=>Alert.alert('Appearance','Dark mode can be added without changing the service layer.')}/><Text style={styles.profileSection}>Session</Text><Pressable style={styles.logoutButton} onPress={logout}><Ionicons name="log-out-outline" size={18} color={colors.danger}/><Text style={styles.logoutText}>Log out</Text></Pressable></ScrollView>; }
function SettingRow({icon,title,value,onPress}) { return <Pressable style={styles.profileRow} onPress={onPress}><View style={styles.profileRowIcon}><Ionicons name={icon} size={20} color={colors.primary}/></View><Text style={styles.profileRowTitle}>{title}</Text><Text style={styles.settingValue}>{value}</Text><Ionicons name="chevron-forward" size={18} color={colors.muted}/></Pressable>; }

function SimpleBack({title,back}) { return <View style={styles.simpleBack}><Pressable onPress={back} style={styles.backBtn}><Ionicons name="arrow-back" size={21} color={colors.ink}/></Pressable><Text style={styles.simpleBackTitle}>{title}</Text><View style={{width:42}}/></View>; }
function EmptyState({icon,title,body,action,onPress}) { return <View style={styles.emptyState}><View style={styles.emptyIcon}><Ionicons name={icon} size={35} color={colors.primary}/></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text>{action?<Pressable style={styles.primaryButton} onPress={onPress}><Text style={styles.primaryButtonText}>{action}</Text></Pressable>:null}</View>; }

function BottomNav({tab,setTab}) {
  const tabs=[['Home','home-outline','home'],['Explore','grid-outline','grid'],['Nearby','location-outline','location'],['Orders','receipt-outline','receipt'],['Profile','person-outline','person']];
  return (
    <View style={styles.floatingNavContainer}>
      <BlurView intensity={80} tint="light" style={styles.bottomNav}>
        {tabs.map(([label,outline,filled])=>{
          const active=tab===label;
          return (
            <Pressable key={label} style={styles.navItem} onPress={()=>setTab(label)}>
              <View style={[styles.navIcon,active&&styles.navIconActive]}>
                <Ionicons name={active?filled:outline} size={21} color={active?'#fff':colors.muted}/>
              </View>
              <Text style={[styles.navLabel,active&&styles.navLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:colors.cream}, screen:{flex:1}, screenPad:{padding:18,paddingBottom:100}, splash:{flex:1,backgroundColor:colors.cream,alignItems:'center',justifyContent:'center'}, brandMark:{width:74,height:74,borderRadius:24,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',shadowColor:'#000',shadowOpacity:.08,shadowRadius:20,elevation:4}, splashTitle:{fontSize:32,fontWeight:'800',color:colors.ink,marginTop:16}, splashSub:{fontSize:14,color:colors.muted,marginTop:7}, logoText:{fontSize:20,fontWeight:'800',color:colors.primary}, linkText:{color:colors.primary,fontWeight:'700'}, onboardTop:{padding:18,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}, onboardCenter:{flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:28}, onboardVisual:{width:230,height:230,borderRadius:70,backgroundColor:'#EEF3E8',alignItems:'center',justifyContent:'center',marginBottom:30}, onboardTitle:{fontSize:30,fontWeight:'800',color:colors.ink,textAlign:'center',lineHeight:36}, onboardBody:{fontSize:16,lineHeight:25,color:colors.muted,textAlign:'center',marginTop:14}, onboardBottom:{padding:20}, dots:{flexDirection:'row',gap:7,justifyContent:'center',marginBottom:18}, dot:{width:8,height:8,borderRadius:8,backgroundColor:'#D5D8D1'}, dotActive:{width:24,backgroundColor:colors.primary}, primaryButton:{minHeight:52,borderRadius:16,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8,paddingHorizontal:18,marginTop:12}, primaryButtonFlex:{flex:1,minHeight:52,borderRadius:16,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'}, primaryButtonText:{color:'#fff',fontWeight:'800',fontSize:15}, secondaryButton:{minHeight:52,borderRadius:16,borderWidth:1,borderColor:'#B8CBBF',alignItems:'center',justifyContent:'center',flexDirection:'row',gap:7,paddingHorizontal:16,flex:1}, secondaryButtonText:{color:colors.primary,fontWeight:'800',fontSize:15}, secondaryButtonWide:{minHeight:52,borderRadius:16,borderWidth:1,borderColor:'#B8CBBF',alignItems:'center',justifyContent:'center',flexDirection:'row',gap:7,paddingHorizontal:16,marginTop:10}, heroButton:{alignSelf:'flex-start',backgroundColor:'#FFF9EC',borderRadius:13,paddingHorizontal:14,paddingVertical:10,flexDirection:'row',gap:7,alignItems:'center',marginTop:13}, heroButtonText:{color:colors.primaryDark,fontWeight:'800'}, authWrap:{flexGrow:1,padding:24,justifyContent:'center'}, authBrand:{alignItems:'center',marginBottom:30}, authTitle:{fontSize:30,fontWeight:'900',color:colors.ink,marginTop:12}, authSub:{color:colors.muted,marginTop:5}, authHeading:{fontSize:23,fontWeight:'800',color:colors.ink,marginBottom:18}, fieldLabel:{fontSize:13,fontWeight:'700',color:colors.ink,marginBottom:7}, input:{height:52,borderWidth:1,borderColor:colors.border,backgroundColor:'#FFF',borderRadius:14,paddingHorizontal:15,fontSize:15,color:colors.ink}, errorBox:{backgroundColor:colors.dangerSoft,borderRadius:13,padding:12,marginTop:4}, errorText:{color:colors.danger,fontSize:13}, demoHint:{fontSize:12,color:colors.muted,lineHeight:18,marginTop:9}, switchAuth:{textAlign:'center',color:colors.primary,fontWeight:'800',marginTop:18}, header:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}, greeting:{fontSize:13,color:colors.muted}, headerName:{fontSize:24,fontWeight:'800',color:colors.ink,marginTop:2}, locationRow:{flexDirection:'row',alignItems:'center',gap:3,marginTop:6}, locationText:{fontSize:12,color:colors.muted}, headerActions:{flexDirection:'row',gap:8}, iconButton:{width:44,height:44,borderRadius:15,backgroundColor:'#FFF',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.border,position:'relative'}, badge:{position:'absolute',top:-3,right:-2,minWidth:17,height:17,paddingHorizontal:4,borderRadius:10,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center'}, badgeText:{fontSize:10,fontWeight:'800',color:'#fff'}, searchBox:{height:51,borderRadius:16,backgroundColor:'#FFF',borderWidth:1,borderColor:colors.border,flexDirection:'row',alignItems:'center',paddingHorizontal:14,gap:8,marginBottom:16}, searchInput:{flex:1,fontSize:14,color:colors.ink}, hero:{backgroundColor:colors.primary,borderRadius:24,padding:20,flexDirection:'row',overflow:'hidden',minHeight:186}, heroEyebrow:{fontSize:10,fontWeight:'800',letterSpacing:1.3,color:'#CDE6D7'}, heroTitle:{fontSize:25,fontWeight:'900',color:'#fff',lineHeight:30,marginTop:7,maxWidth:220}, heroBody:{fontSize:13,color:'#EAF4EE',lineHeight:19,marginTop:9,maxWidth:240}, heroArt:{flex:1,alignItems:'center',justifyContent:'center',position:'relative'}, sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:22,marginBottom:11}, sectionTitle:{fontSize:18,fontWeight:'800',color:colors.ink}, sectionAction:{fontSize:13,fontWeight:'800',color:colors.primary}, categoryBubble:{width:94,paddingVertical:13,paddingHorizontal:6,borderRadius:18,backgroundColor:'#FFF',borderWidth:1,borderColor:colors.border,alignItems:'center',marginRight:9}, categoryText:{fontSize:11,fontWeight:'700',color:colors.ink,marginTop:7,textAlign:'center'}, quickRow:{marginTop:16,gap:9}, quickCard:{flexDirection:'row',alignItems:'center',backgroundColor:'#FFF',borderRadius:18,padding:13,borderWidth:1,borderColor:colors.border,gap:11}, quickIcon:{width:39,height:39,borderRadius:13,backgroundColor:'#EEF6F0',alignItems:'center',justifyContent:'center'}, quickTitle:{fontWeight:'800',color:colors.ink}, quickBody:{fontSize:11,color:colors.muted,marginTop:2}, grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:0}, productCard:{width:'48.5%',backgroundColor:'#FFF',borderRadius:18,padding:9,marginBottom:12,borderWidth:1,borderColor:colors.border}, productImageWrap:{height:135,borderRadius:14,overflow:'hidden',position:'relative',backgroundColor:'#EEF0EB'}, productImage:{width:'100%',height:'100%'}, wishBtn:{position:'absolute',right:7,top:7,width:31,height:31,borderRadius:11,backgroundColor:'rgba(255,255,255,.92)',alignItems:'center',justifyContent:'center'}, verifiedBadge:{position:'absolute',bottom:7,left:7,borderRadius:10,backgroundColor:'#F1F8F3',paddingHorizontal:7,paddingVertical:4,flexDirection:'row',gap:3,alignItems:'center'}, verifiedText:{fontSize:9,fontWeight:'800',color:colors.success}, productName:{fontSize:14,fontWeight:'800',color:colors.ink}, productMeta:{fontSize:10,color:colors.muted,marginTop:3}, cardBottom:{marginTop:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}, priceText:{fontSize:16,fontWeight:'900',color:colors.primaryDark}, unitText:{fontSize:10,fontWeight:'600',color:colors.muted}, addButton:{width:34,height:34,borderRadius:12,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'}, simpleHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:13}, screenEyebrow:{fontSize:10,fontWeight:'800',letterSpacing:1.4,color:colors.primary}, screenTitle:{fontSize:24,fontWeight:'900',color:colors.ink,marginTop:3}, chip:{backgroundColor:'#FFF',borderRadius:12,paddingHorizontal:13,paddingVertical:9,borderWidth:1,borderColor:colors.border}, chipActive:{backgroundColor:colors.primary,borderColor:colors.primary}, chipText:{fontSize:12,color:colors.ink,fontWeight:'700'}, chipTextActive:{color:'#fff'}, filterRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}, resultsText:{fontSize:12,color:colors.muted}, sortBtn:{flexDirection:'row',alignItems:'center',gap:5,borderWidth:1,borderColor:colors.border,borderRadius:10,paddingHorizontal:10,paddingVertical:7,backgroundColor:'#FFF'}, sortText:{fontSize:12,fontWeight:'700',color:colors.ink}, detailImageWrap:{height:360,backgroundColor:'#EEF0EB',position:'relative'}, detailImage:{width:'100%',height:'100%'}, floatingBack:{position:'absolute',left:18,top:18,width:45,height:45,borderRadius:15,backgroundColor:'rgba(255,255,255,.94)',alignItems:'center',justifyContent:'center'}, floatingCart:{position:'absolute',right:18,top:18,width:45,height:45,borderRadius:15,backgroundColor:'rgba(255,255,255,.94)',alignItems:'center',justifyContent:'center'}, detailBody:{backgroundColor:colors.cream,borderTopLeftRadius:28,borderTopRightRadius:28,marginTop:-26,padding:20}, rowBetween:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10}, detailTitle:{fontSize:28,fontWeight:'900',color:colors.ink}, detailSub:{fontSize:13,color:colors.muted,marginTop:4}, detailWish:{width:48,height:48,borderRadius:15,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.border}, priceLine:{flexDirection:'row',alignItems:'center',marginTop:17}, detailPrice:{fontSize:26,fontWeight:'900',color:colors.primaryDark}, detailUnit:{fontSize:13,color:colors.muted,fontWeight:'600'}, statusPill:{borderRadius:999,paddingHorizontal:9,paddingVertical:5,marginLeft:9}, statusText:{fontSize:10,fontWeight:'800'}, successPill:{backgroundColor:colors.successSoft}, successText:{color:colors.success}, warnPill:{backgroundColor:colors.accentSoft}, warnText:{color:'#A66B0E'}, neutralPill:{backgroundColor:'#EEF0EC'}, neutralText:{color:'#637069'}, infoPill:{backgroundColor:colors.infoSoft}, infoText:{color:colors.info}, dangerPill:{backgroundColor:colors.dangerSoft}, dangerText:{color:colors.danger}, detailDesc:{fontSize:14,lineHeight:22,color:colors.muted,marginTop:14}, infoSection:{backgroundColor:'#FFF',borderRadius:19,padding:15,borderWidth:1,borderColor:colors.border,marginTop:13}, infoSectionTitle:{fontSize:15,fontWeight:'900',color:colors.ink,marginBottom:7}, infoRow:{flexDirection:'row',gap:11,alignItems:'flex-start',paddingVertical:8}, infoTitle:{fontSize:11,color:colors.muted}, infoValue:{fontSize:13,color:colors.ink,fontWeight:'700',marginTop:2,lineHeight:19}, disclaimer:{fontSize:11,color:colors.muted,lineHeight:17,marginTop:5}, qtyBox:{marginTop:15,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}, qtyLabel:{fontSize:14,fontWeight:'800',color:colors.ink}, qtyControls:{flexDirection:'row',alignItems:'center',gap:9}, qtyBtn:{width:34,height:34,borderRadius:11,borderWidth:1,borderColor:colors.border,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'}, qtyValue:{minWidth:23,textAlign:'center',fontWeight:'800',color:colors.ink}, actionRow:{flexDirection:'row',gap:10,marginTop:18}, cartItem:{backgroundColor:'#FFF',borderRadius:18,padding:11,borderWidth:1,borderColor:colors.border,flexDirection:'row',gap:11,marginTop:10}, cartImage:{width:92,height:92,borderRadius:14}, cartName:{fontSize:14,fontWeight:'800',color:colors.ink}, cartMeta:{fontSize:11,color:colors.muted,marginTop:3}, cartPrice:{fontSize:12,fontWeight:'800',color:colors.primaryDark,marginTop:7}, cartBottom:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:8}, itemSubtotal:{fontSize:16,fontWeight:'900',color:colors.ink}, summaryCard:{backgroundColor:'#FFF',borderRadius:19,padding:16,borderWidth:1,borderColor:colors.border,marginTop:15}, summaryTitle:{fontSize:16,fontWeight:'900',color:colors.ink,marginBottom:12}, summaryRow:{fontSize:13,color:colors.muted,paddingVertical:5}, summaryStrong:{fontSize:16,fontWeight:'900',color:colors.ink}, summaryDivider:{height:1,backgroundColor:colors.border,marginVertical:7}, simpleBack:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:18}, backBtn:{width:42,height:42,borderRadius:14,backgroundColor:'#FFF',borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center'}, simpleBackTitle:{fontSize:19,fontWeight:'900',color:colors.ink}, smallMuted:{fontSize:12,color:colors.muted}, emptyState:{alignItems:'center',paddingHorizontal:25,paddingVertical:60}, emptyIcon:{width:72,height:72,borderRadius:24,backgroundColor:'#ECF4EE',alignItems:'center',justifyContent:'center'}, emptyTitle:{fontSize:20,fontWeight:'900',color:colors.ink,marginTop:16}, emptyBody:{fontSize:13,color:colors.muted,textAlign:'center',lineHeight:20,marginTop:7}, checkoutCard:{backgroundColor:'#FFF',borderRadius:19,padding:16,borderWidth:1,borderColor:colors.border,marginBottom:13}, steps:{flexDirection:'row',justifyContent:'space-between',marginBottom:15}, stepItem:{alignItems:'center',flex:1}, stepCircle:{width:30,height:30,borderRadius:15,backgroundColor:'#E6EAE6',alignItems:'center',justifyContent:'center'}, stepCircleActive:{backgroundColor:colors.primary}, stepNo:{fontSize:12,fontWeight:'800',color:colors.muted}, stepNoActive:{color:'#fff'}, stepLabel:{fontSize:10,color:colors.muted,marginTop:5,fontWeight:'600'}, textArea:{minHeight:105,borderWidth:1,borderColor:colors.border,borderRadius:14,padding:13,color:colors.ink,fontSize:14,textAlignVertical:'top'}, optionRow:{flexDirection:'row',alignItems:'center',gap:10,borderWidth:1,borderColor:colors.border,borderRadius:14,padding:14,marginTop:8}, optionSelected:{borderColor:'#A9C9B5',backgroundColor:'#F1F7F2'}, optionLabel:{flex:1,fontSize:13,fontWeight:'700',color:colors.ink}, trustBox:{flexDirection:'row',gap:9,backgroundColor:'#F2F7F3',borderRadius:15,padding:13,marginBottom:12,alignItems:'flex-start'}, trustText:{flex:1,fontSize:12,color:colors.muted,lineHeight:18}, centerLink:{alignItems:'center',paddingVertical:12}, confirmWrap:{flex:1,padding:24,justifyContent:'center'}, successCircle:{width:86,height:86,borderRadius:43,backgroundColor:colors.successSoft,alignItems:'center',justifyContent:'center',alignSelf:'center'}, confirmTitle:{fontSize:28,fontWeight:'900',color:colors.ink,textAlign:'center',marginTop:18}, confirmBody:{fontSize:14,lineHeight:21,color:colors.muted,textAlign:'center',marginTop:8}, orderCard:{backgroundColor:'#FFF',borderRadius:18,padding:15,borderWidth:1,borderColor:colors.border,marginTop:10}, orderId:{fontSize:14,fontWeight:'900',color:colors.ink}, orderDate:{fontSize:11,color:colors.muted,marginTop:3}, orderLine:{height:1,backgroundColor:colors.border,marginVertical:12}, orderItems:{fontSize:12,fontWeight:'800',color:colors.ink}, orderSeller:{fontSize:11,color:colors.muted,marginTop:3}, orderTotal:{fontSize:18,fontWeight:'900',color:colors.primaryDark}, orderFooter:{flexDirection:'row',alignItems:'center',justifyContent:'flex-end',marginTop:10,gap:4}, orderHero:{backgroundColor:colors.primary,borderRadius:21,padding:18}, orderHeroId:{fontSize:20,fontWeight:'900',color:'#fff'}, orderEta:{fontSize:12,color:'#EAF4EE',marginTop:10}, timelineRow:{flexDirection:'row',gap:11,minHeight:62}, timelineRail:{width:22,alignItems:'center'}, timelineDot:{width:12,height:12,borderRadius:6,backgroundColor:'#D4DBD6',marginTop:4}, timelineDotActive:{backgroundColor:colors.primary}, timelineLine:{width:2,flex:1,backgroundColor:'#D9DFDA',marginVertical:3}, timelineLineActive:{backgroundColor:'#92B8A0'}, timelineTitle:{fontSize:13,fontWeight:'800',color:colors.muted}, timelineSub:{fontSize:11,color:colors.muted,marginTop:3}, notificationActions:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}, notificationCard:{backgroundColor:'#FFF',borderRadius:17,padding:14,borderWidth:1,borderColor:colors.border,marginTop:10,flexDirection:'row',gap:11}, notificationUnread:{backgroundColor:'#F6FBF7',borderColor:'#CDE1D2'}, notificationIcon:{width:42,height:42,borderRadius:13,backgroundColor:'#EEF6F0',alignItems:'center',justifyContent:'center'}, notificationTitle:{fontSize:13,fontWeight:'800',color:colors.ink,flex:1}, notificationBody:{fontSize:12,color:colors.muted,lineHeight:18,marginTop:5}, notificationTime:{fontSize:10,color:'#9AA39D',marginTop:6}, unreadDot:{width:8,height:8,borderRadius:8,backgroundColor:colors.accent,marginTop:5}, profileHero:{alignItems:'center',paddingTop:8}, avatar:{width:78,height:78,borderRadius:26,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'}, avatarText:{fontSize:34,color:'#fff',fontWeight:'900'}, profileName:{fontSize:24,fontWeight:'900',color:colors.ink,marginTop:13}, profileEmail:{fontSize:12,color:colors.muted,marginTop:3}, profileStats:{backgroundColor:'#FFF',borderRadius:19,borderWidth:1,borderColor:colors.border,marginTop:18,padding:16,flexDirection:'row'}, statNum:{fontSize:20,fontWeight:'900',color:colors.primaryDark}, statLabel:{fontSize:10,color:colors.muted,marginTop:3}, profileSection:{fontSize:12,fontWeight:'900',color:colors.muted,textTransform:'uppercase',letterSpacing:1.2,marginTop:22,marginBottom:8}, profileRow:{backgroundColor:'#FFF',borderRadius:15,borderWidth:1,borderColor:colors.border,minHeight:58,paddingHorizontal:13,flexDirection:'row',alignItems:'center',gap:10,marginTop:8}, profileRowIcon:{width:38,height:38,borderRadius:12,backgroundColor:'#EEF6F0',alignItems:'center',justifyContent:'center'}, profileRowTitle:{flex:1,fontSize:13,fontWeight:'700',color:colors.ink}, smallBadge:{minWidth:21,height:21,paddingHorizontal:5,borderRadius:9,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center'}, settingValue:{fontSize:12,fontWeight:'700',color:colors.muted}, logoutButton:{borderRadius:15,minHeight:52,borderWidth:1,borderColor:'#F2D0D0',backgroundColor:colors.dangerSoft,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:7,marginTop:20}, logoutText:{color:colors.danger,fontWeight:'900'}, scanIntro:{alignItems:'center',paddingTop:22}, scanIconBig:{width:92,height:92,borderRadius:28,backgroundColor:'#E8F3EB',alignItems:'center',justifyContent:'center'}, scanBody:{fontSize:14,lineHeight:22,color:colors.muted,textAlign:'center',marginTop:12}, cameraScreen:{flex:1,backgroundColor:'#000'}, cameraOverlay:{...StyleSheet.absoluteFill,justifyContent:'space-between'}, cameraTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:18,paddingTop:16}, cameraCircle:{width:44,height:44,borderRadius:15,backgroundColor:'rgba(0,0,0,.35)',alignItems:'center',justifyContent:'center'}, cameraTitle:{color:'#fff',fontWeight:'800',fontSize:16}, scanFrame:{alignSelf:'center',width:'78%',aspectRatio:1,borderRadius:28,position:'relative'}, frameCorner:{position:'absolute',width:44,height:44,borderColor:'#fff'}, ftl:{left:0,top:0,borderLeftWidth:3,borderTopWidth:3,borderTopLeftRadius:20}, ftr:{right:0,top:0,borderRightWidth:3,borderTopWidth:3,borderTopRightRadius:20}, fbl:{left:0,bottom:0,borderLeftWidth:3,borderBottomWidth:3,borderBottomLeftRadius:20}, fbr:{right:0,bottom:0,borderRightWidth:3,borderBottomWidth:3,borderBottomRightRadius:20}, cameraBottom:{alignItems:'center',paddingBottom:32}, cameraGuide:{color:'#fff',fontSize:12,marginBottom:18}, captureButton:{width:76,height:76,borderRadius:38,borderWidth:4,borderColor:'#fff',alignItems:'center',justifyContent:'center'}, captureInner:{width:60,height:60,borderRadius:30,backgroundColor:'#fff'}, galleryFloat:{position:'absolute',right:30,bottom:18,width:48,height:48,borderRadius:17,backgroundColor:'rgba(0,0,0,.38)',alignItems:'center',justifyContent:'center'}, processingOverlay:{...StyleSheet.absoluteFill,backgroundColor:'rgba(0,0,0,.56)',alignItems:'center',justifyContent:'center'}, processingText:{color:'#fff',fontWeight:'800',marginTop:13}, scanImageCard:{height:275,borderRadius:22,overflow:'hidden',backgroundColor:'#E9ECE7',marginTop:8}, scanResultImage:{width:'100%',height:'100%'}, scanPlaceholder:{flex:1,alignItems:'center',justifyContent:'center'}, resultHero:{backgroundColor:'#FFF',borderRadius:18,padding:15,borderWidth:1,borderColor:colors.border,marginTop:12,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}, resultName:{fontSize:24,fontWeight:'900',color:colors.ink,marginTop:3}, confidencePill:{backgroundColor:'#EDF6EF',borderRadius:12,paddingHorizontal:9,paddingVertical:7}, confidenceText:{fontSize:11,fontWeight:'800',color:colors.success}, supportHero:{backgroundColor:'#EEF6F0',borderRadius:21,padding:20,alignItems:'center'}, supportTitle:{fontSize:22,fontWeight:'900',color:colors.ink,marginTop:9}, supportBody:{fontSize:13,lineHeight:20,color:colors.muted,textAlign:'center',marginTop:6}, faqRow:{backgroundColor:'#FFF',borderRadius:15,borderWidth:1,borderColor:colors.border,padding:15,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,marginTop:8}, faqText:{fontSize:13,fontWeight:'700',color:colors.ink,flex:1}, contactCard:{backgroundColor:'#FFF',borderRadius:17,borderWidth:1,borderColor:colors.border,padding:14,flexDirection:'row',alignItems:'center',gap:11,marginTop:8}, contactTitle:{fontSize:13,fontWeight:'900',color:colors.ink}, contactBody:{fontSize:11,color:colors.muted,marginTop:3}
,
  appContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    backgroundColor: colors.cream,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
  },
  floatingNavContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  navIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  navIconActive: {
    backgroundColor: colors.primary,
  },
  navLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  aiTagBadge: {
    position: 'absolute',
    top: 7,
    left: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  aiTagBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7C3AED',
  },
  detailAiPill: {
    position: 'absolute',
    bottom: 38,
    left: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  detailAiPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6D28D9',
  },
  scanLaser: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    borderRadius: 2,
  },
  scanPillCenter: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  galleryFloatBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingCard: {
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  analyzingImageWrap: {
    width: '100%',
    height: 320,
    position: 'relative',
  },
  analyzingImage: {
    width: '100%',
    height: '100%',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  analyzingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 14,
  },
  analyzingStepText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    marginTop: 6,
    textAlign: 'center',
  },
  rescanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#EEF6F0',
  },
  rescanText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  scanIntroCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
  },
  scanCardEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.primary,
    marginTop: 14,
  },
  scanCardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 26,
  },
  scanActionsWrap: {
    width: '100%',
    marginTop: 18,
    gap: 6,
  },
  sampleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  sampleCard: {
    width: '31%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sampleCardName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 6,
    textAlign: 'center',
  },
  sampleScanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EEF6F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 5,
  },
  sampleScanText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
  },
  trustCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F3F7F4',
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    alignItems: 'flex-start',
  },
  trustCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  trustCardBody: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
    marginTop: 4,
  },
  scanResultOverlayTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scanResultOverlayText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  scanTimePill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scanTimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  resultSummaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultCropTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.ink,
  },
  resultVarietyText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
    fontWeight: '600',
  },
  gradeBadgeLarge: {
    backgroundColor: '#EAF7EF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C6E8D3',
  },
  gradeBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.success,
  },
  gradeSubText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: 1,
  },
  scoreBarTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resultCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  ripenessPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ripenessPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricCardBox: {
    width: '48.5%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricValBold: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 6,
  },
  metricLabelSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
    fontWeight: '600',
  },
  obsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  obsText: {
    fontSize: 13,
    color: colors.ink,
    flex: 1,
    lineHeight: 18,
  },
  defectRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  defectText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  matchedProduceCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  matchedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchedEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#15803D',
  },
  matchedFarmerBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  matchedThumb: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  matchedTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
  },
  matchedLoc: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  matchedPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryDark,
    marginTop: 3,
  },
  matchedDetailsBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchedDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  matchedAddBtn: {
    flex: 1.2,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  matchedAddText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  scanDisclaimerText: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
    paddingHorizontal: 12,
  },
});

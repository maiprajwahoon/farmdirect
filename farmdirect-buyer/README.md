# FarmDirect Buyer Mobile App

Premium buyer-facing mobile app built with React Native + Expo. The implementation follows the supplied FarmDirect buyer specification and keeps mock/demo behavior clearly separated from integration points.

## Included

- Onboarding and buyer authentication flow
- Home dashboard with search, categories, featured produce and cart/notification shortcuts
- Explore marketplace with category filters and sorting
- Product detail with quality status, seller data, quantity controls and cart actions
- Functional cart and step-by-step demo checkout
- Order confirmation, order history and tracking timeline
- AI vegetable scanner using the phone camera or gallery, with a demo inference adapter and explicit AI limitations
- Notifications center
- Wishlist with persistence
- Buyer profile, settings, help & support
- AsyncStorage persistence for buyer session, cart, wishlist and onboarding
- Backend-ready service layer in `src/services/mockApi.js`
- Premium green/cream FarmDirect visual system with touch-friendly mobile layout

## Run on your Mac

1. Install Node.js 20+.
2. In this folder run:

```bash
npm install
npx expo start
```

3. Scan the QR code with Expo Go, or use an Android/iOS emulator.

## Real backend integration points

Replace methods in `src/services/mockApi.js` with your FastAPI/API calls. Suggested production modules from the supplied specification:

- auth
- products
- categories
- cart
- orders
- payments
- AI scans
- notifications

The checkout intentionally says **Demo Order** so it does not pretend to process a real payment. Push notifications, WhatsApp support, real tracking, live inventory and AI inference should be connected to production services before deployment.

## AI scanner

The camera uses `expo-camera`, with `expo-image-picker` as a gallery fallback. The current scan result is intentionally a demo inference adapter. It must be replaced by the trained FarmDirect model/inference API and should not be presented as a food-safety, pesticide, or internal-freshness detector.

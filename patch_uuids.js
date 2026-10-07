const fs = require('fs');
const path = require('path');

const VALID_UUID = '11111111-1111-1111-1111-111111111111';

// 1. patch login.tsx
const loginFile = path.join(__dirname, 'happy-galileo/farm-direct/app/(auth)/login.tsx');
if (fs.existsSync(loginFile)) {
  let content = fs.readFileSync(loginFile, 'utf8');
  content = content.replace(/const newFarmerId = `farmer_\$\{Date\.now\(\)\}`;/g, `const newFarmerId = '${VALID_UUID}';`);
  fs.writeFileSync(loginFile, content);
}

// 2. patch register.tsx
const registerFile = path.join(__dirname, 'happy-galileo/farm-direct/app/(auth)/register.tsx');
if (fs.existsSync(registerFile)) {
  let content = fs.readFileSync(registerFile, 'utf8');
  content = content.replace(/const newFarmerId = `farmer_\$\{Date\.now\(\)\}`;/g, `const newFarmerId = '${VALID_UUID}';`);
  fs.writeFileSync(registerFile, content);
}

// 3. patch add-listing.tsx
const addListingFile = path.join(__dirname, 'happy-galileo/farm-direct/app/add-listing.tsx');
if (fs.existsSync(addListingFile)) {
  let content = fs.readFileSync(addListingFile, 'utf8');
  content = content.replace(/user\?\.id \|\| 'demo-farmer-1'/g, `user?.id?.includes('-') ? user.id : '${VALID_UUID}'`);
  fs.writeFileSync(addListingFile, content);
}

// 4. patch web-app/src/lib/api.ts
const webApiFile = path.join(__dirname, 'web-app/src/lib/api.ts');
if (fs.existsSync(webApiFile)) {
  let content = fs.readFileSync(webApiFile, 'utf8');
  content = content.replace(/farmer_id: 'local'/g, `farmer_id: '${VALID_UUID}'`);
  content = content.replace(/buyer_id: payload\.buyerId \|\| 'local'/g, `buyerId: payload.buyerId || '${VALID_UUID}'`);
  content = content.replace(/farmer_id: payload\.farmerId \|\| 'local'/g, `farmerId: payload.farmerId || '${VALID_UUID}'`);
  fs.writeFileSync(webApiFile, content);
}

// 5. patch farmdirect-buyer/src/services/mockApi.js
const mockApiFile = path.join(__dirname, 'farmdirect-buyer/src/services/mockApi.js');
if (fs.existsSync(mockApiFile)) {
  let content = fs.readFileSync(mockApiFile, 'utf8');
  content = content.replace(/buyerId: payload\.buyerId \|\| 'buyer-demo'/g, `buyerId: payload.buyerId || '${VALID_UUID}'`);
  content = content.replace(/farmerId: firstItemProduct\.farmerId \|\| payload\.farmerId \|\| 'demo-farmer-1'/g, `farmerId: firstItemProduct.farmerId || payload.farmerId || '${VALID_UUID}'`);
  content = content.replace(/farmerId: farmerId/g, `farmerId: farmerId?.includes('-') ? farmerId : '${VALID_UUID}'`);
  fs.writeFileSync(mockApiFile, content);
}

console.log('done');

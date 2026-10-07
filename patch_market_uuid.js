const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'happy-galileo/farm-direct/src/store/market.store.ts');
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/'demo-farmer-1'/g, "'11111111-1111-1111-1111-111111111111'");
fs.writeFileSync(file, content);
console.log('done');

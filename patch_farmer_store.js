const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'happy-galileo/farm-direct/src/store/market.store.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /cropName: p\.product_name,/g,
  `cropName: p.crop_name || p.product_name || p.name || 'Unknown',`
);

content = content.replace(
  /quantityUnit: \(p\.unit \|\| 'kg'\) as any,/g,
  `quantityUnit: (p.quantity_unit || p.unit || 'kg') as any,`
);

content = content.replace(
  /category: p\.category \|\| 'Vegetables',/g,
  `category: p.category || (p.is_organic ? 'Organic Produce' : 'Vegetables'),`
);

fs.writeFileSync(file, content);
console.log('done');

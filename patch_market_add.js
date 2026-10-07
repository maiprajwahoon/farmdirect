const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'happy-galileo/farm-direct/src/store/market.store.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /product_name: listing\.cropName,/g,
  `crop_name: listing.cropName,`
);

content = content.replace(
  /unit: listing\.quantityUnit,/g,
  `quantity_unit: listing.quantityUnit,`
);

fs.writeFileSync(file, content);
console.log('done');

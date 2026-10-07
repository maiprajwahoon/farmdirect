const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'happy-galileo/farm-direct/src/store/market.store.ts');
let content = fs.readFileSync(file, 'utf8');

// Revert addListing insert
content = content.replace(
  /crop_name: listing\.cropName,/g,
  `product_name: listing.cropName,`
);
content = content.replace(
  /quantity_unit: listing\.quantityUnit,/g,
  `unit: listing.quantityUnit,`
);

fs.writeFileSync(file, content);
console.log('done');

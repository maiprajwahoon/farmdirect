const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'farmdirect-buyer/src/services/mockApi.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /results = data\.map\(p => \(\{[\s\S]*?available: true,\n        \}\)\);/m,
`results = data.map(p => ({
          id: p.id,
          name: p.crop_name || p.product_name || p.name,
          category: p.category || (p.is_organic ? 'Organic Produce' : 'Vegetables'),
          variety: p.variety,
          unit: p.quantity_unit || p.unit || 'kg',
          price: p.price_per_unit || p.price || 0,
          farmer: p.farmer || 'Farmer', 
          location: p.location || 'Local',
          quality: p.quality_grade || p.quality || 'Verified',
          harvest: p.harvest || 'Recently',
          description: p.description || \`Fresh \${p.crop_name || p.product_name || p.name} sourced directly from our farm.\`,
          image: p.image || resolveLocalImage(p.crop_name || p.product_name || p.name),
          quantity: p.quantity_available || p.quantity || 0,
          isAiGenerated: false,
          available: p.available !== false
        }));`
);

fs.writeFileSync(file, content);
console.log('done');

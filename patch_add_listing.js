const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'happy-galileo/farm-direct/app/add-listing.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /await supabase\.from\('listings'\)\.insert\(\[\n\s*\{\n\s*product_name: form\.cropName\.trim\(\),\n\s*variety: form\.variety\.trim\(\) \|\| 'Regular',\n\s*quantity_available: qty,\n\s*unit: form\.unit,\n\s*price_per_unit: priceVal,\n\s*farmer_id: user\.id,\n\s*available: true,\n\s*\},\n\s*\]\);/m,
  `await supabase.from('listings').insert([{
            crop_name: form.cropName.trim(),
            variety: form.variety.trim() || 'Regular',
            quantity_available: qty,
            quantity_unit: form.unit,
            price_per_unit: priceVal,
            farmer_id: user.id,
            available: true,
            farmer: user.user_metadata?.farmName || user.user_metadata?.name || 'Farmer',
            location: 'Local Farm',
          }]);`
);

fs.writeFileSync(file, content);
console.log('done');

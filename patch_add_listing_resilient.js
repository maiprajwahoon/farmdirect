const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'happy-galileo/farm-direct/app/add-listing.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /await supabase\.from\('listings'\)\.insert\(\[\{\n\s*crop_name: form\.cropName\.trim\(\),[\s\S]*?location: 'Local Farm',\n\s*\}\]\);/m,
  `const payload = {
            crop_name: form.cropName.trim(),
            variety: form.variety.trim() || 'Regular',
            quantity_available: qty,
            quantity_unit: form.unit,
            price_per_unit: priceVal,
            farmer_id: user.id,
            available: true,
            farmer: user.user_metadata?.farmName || user.user_metadata?.name || 'Farmer',
            location: 'Local Farm',
          };
          let res = await supabase.from('listings').insert([payload]);
          if (res.error && res.error.code === '42703') {
            // Fallback for minimal schema
            res = await supabase.from('listings').insert([{
              crop_name: form.cropName.trim(),
              variety: form.variety.trim() || 'Regular',
              quantity_available: qty,
              quantity_unit: form.unit,
              price_per_unit: priceVal,
              farmer_id: user.id,
              available: true
            }]);
          }
          if (res.error) throw res.error;`
);

fs.writeFileSync(file, content);
console.log('done');

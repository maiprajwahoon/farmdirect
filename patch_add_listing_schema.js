const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'happy-galileo/farm-direct/app/add-listing.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const payload = \{[\s\S]*?if \(res\.error\) throw res\.error;/m,
  `const payload = {
            product_name: form.cropName.trim(),
            variety: form.variety.trim() || 'Regular',
            quantity_available: qty,
            unit: form.unit,
            price_per_unit: priceVal,
            farmer_id: fallbackFarmerId,
            available: true,
            farmer: user?.user_metadata?.farmName || user?.user_metadata?.name || 'Local Farmer',
            location: 'Local Farm',
          };
          let res = await supabase.from('listings').insert([payload]);
          if (res.error && res.error.code === '42703') {
            res = await supabase.from('listings').insert([{
              product_name: form.cropName.trim(),
              variety: form.variety.trim() || 'Regular',
              quantity_available: qty,
              unit: form.unit,
              price_per_unit: priceVal,
              farmer_id: fallbackFarmerId,
              available: true
            }]);
          }
          if (res.error) throw res.error;`
);

fs.writeFileSync(file, content);
console.log('done');

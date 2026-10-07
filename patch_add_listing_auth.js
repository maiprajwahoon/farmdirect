const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'happy-galileo/farm-direct/app/add-listing.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /if \(user\?\.id\) \{[\s\S]*?\}\n\s*\} catch \(e\) \{/m,
  `const fallbackFarmerId = user?.id || 'demo-farmer-1';
          const payload = {
            crop_name: form.cropName.trim(),
            variety: form.variety.trim() || 'Regular',
            quantity_available: qty,
            quantity_unit: form.unit,
            price_per_unit: priceVal,
            farmer_id: fallbackFarmerId,
            available: true,
            farmer: user?.user_metadata?.farmName || user?.user_metadata?.name || 'Local Farmer',
            location: 'Local Farm',
          };
          let res = await supabase.from('listings').insert([payload]);
          if (res.error && res.error.code === '42703') {
            res = await supabase.from('listings').insert([{
              crop_name: form.cropName.trim(),
              variety: form.variety.trim() || 'Regular',
              quantity_available: qty,
              quantity_unit: form.unit,
              price_per_unit: priceVal,
              farmer_id: fallbackFarmerId,
              available: true
            }]);
          }
          if (res.error) throw res.error;
    } catch (e) {`
);

fs.writeFileSync(file, content);
console.log('done');

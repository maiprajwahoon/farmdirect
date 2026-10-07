const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'farmdirect-buyer/src/services/mockApi.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /async searchProducts\(query\) \{[\s\S]*?console\.warn\('searchProducts error:', e\);\n      return \[\];\n    \}\n  \},/m,
`async searchProducts(query) {
    const q = (query || '').trim().toLowerCase();
    try {
      const { data, error } = await supabase.from('listings').select('*').eq('available', true);
      if (error) throw error;
      
      let results = data.map(p => ({
        id: p.id,
        name: p.crop_name || p.product_name || p.name || 'Unknown',
        category: p.category || (p.is_organic ? 'Organic Produce' : 'Vegetables'),
        variety: p.variety || 'Standard',
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
      }));

      if (q) {
        results = results.filter(p => 
          p.name.toLowerCase().includes(q) || 
          (p.category && p.category.toLowerCase().includes(q))
        );
      }
      return results;
    } catch (e) {
      console.warn('searchProducts error:', e);
      return [];
    }
  },`
);

fs.writeFileSync(file, content);
console.log('done');

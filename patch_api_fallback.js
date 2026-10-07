const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'web-app/src/lib/api.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /async addProduct\(p: Partial<Product>\): Promise<Product> \{[\s\S]*?return \{ \.\.\.p, id: data\.id \} as Product;\n    \}\n  \},/m,
`async addProduct(p: Partial<Product>): Promise<Product> {
    try {
      const data = await apiFetch('/api/products', { method: 'POST', body: JSON.stringify(p) })
      return data.product
    } catch (err) {
      console.warn("Node backend unreachable, adding product to Supabase directly");
      const richPayload = {
        farmer_id: 'local',
        crop_name: p.name,
        variety: p.variety,
        quantity_available: p.quantity,
        quantity_unit: p.unit,
        price_per_unit: p.price,
        location: p.location,
        quality_grade: p.quality,
        category: p.category,
        farmer: p.farmer,
        description: p.description,
        image: p.image,
        available: p.available !== false
      };
      let { data, error } = await supabase.from('listings').insert(richPayload).select().single();
      
      // Fallback if columns are missing
      if (error && error.code === '42703') {
        const minimalPayload = {
          farmer_id: 'local',
          crop_name: p.name,
          variety: p.variety,
          quantity_available: p.quantity,
          quantity_unit: p.unit,
          price_per_unit: p.price,
          is_organic: p.category?.toLowerCase().includes('organic') || false
        };
        const fallback = await supabase.from('listings').insert(minimalPayload).select().single();
        data = fallback.data;
        error = fallback.error;
      }
      
      if (error) throw error;
      return { ...p, id: data?.id || \`local-\$\{Date.now()\}\` } as Product;
    }
  },`
);

content = content.replace(
  /async updateProduct\(id: string, updates: Partial<Product>\): Promise<Product> \{[\s\S]*?return data\.product\n  \},/m,
`async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const data = await apiFetch(\`/api/products/\${id}\`, { method: 'PUT', body: JSON.stringify(updates) })
      return data.product
    } catch (err) {
      console.warn("Node backend unreachable, updating product in Supabase directly");
      
      const payload: any = {};
      if (updates.name !== undefined) payload.crop_name = updates.name;
      if (updates.quantity !== undefined) payload.quantity_available = updates.quantity;
      if (updates.price !== undefined) payload.price_per_unit = updates.price;
      if (updates.available !== undefined) payload.available = updates.available;
      
      let { data, error } = await supabase.from('listings').update(payload).eq('id', id).select().single();
      if (error) throw error;
      
      return { id, ...updates, ...data } as Product;
    }
  },`
);

fs.writeFileSync(file, content);
console.log('done');

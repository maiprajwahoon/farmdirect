const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'farmdirect-buyer/src/services/mockApi.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const \{ data, error \} = await supabase\.from\('orders'\)\.select\('\*'\);\n      if \(\!error && data\) \{\n        return data\.map\(o => \(\{\n          \.\.\.o,\n          total: Number\(o\.total \|\| o\.totalAmount \|\| 0\),\n          items: o\.items \|\| \(o\.buyer && o\.buyer\.items\) \|\| \[\],\n        \}\)\);\n      \}/m,
`const { data, error } = await supabase.from('orders').select('*');
      if (!error && data) {
        return data.map(o => {
          let parsedBuyer = o.buyer;
          if (typeof parsedBuyer === 'string') {
            try { parsedBuyer = JSON.parse(parsedBuyer); } catch(e) { parsedBuyer = {}; }
          }
          return {
            id: o.id,
            orderNumber: (o.id || 'FD-123').split('-')[0],
            buyerId: o.buyer_id || o.buyerId,
            farmerId: o.farmer_id || o.farmerId,
            status: o.status,
            cropName: o.crop_name || 'Order Items',
            quantity: o.quantity || 1,
            quantityUnit: o.quantity_unit || 'unit',
            pricePerUnit: o.price_per_unit || 0,
            totalAmount: o.total_amount || o.totalAmount || 0,
            total: Number(o.total_amount || o.totalAmount || 0),
            buyer: parsedBuyer || {},
            items: (parsedBuyer && parsedBuyer.items) || o.items || [{
              productId: 'local', productName: o.crop_name || 'Item', quantity: o.quantity || 1, unit: o.quantity_unit || 'unit', price: o.price_per_unit || 0, image: 'https://placehold.co/600x400/eeeeee/999999?text=Produce'
            }],
            createdAt: o.created_at || new Date().toISOString(),
          };
        });
      }`
);

fs.writeFileSync(file, content);
console.log('done');

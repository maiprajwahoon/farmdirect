const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://xkoewoyrlylsmogkexic.supabase.co', 'sb_publishable_7Z9aohcBPGOMTAQ2MkuMQQ_JhSlqOMT');

// Copy formatOrder from backend/server.js
function formatOrder(raw) {
  if (!raw) return raw;
  const buyerObj = typeof raw.buyer === 'object' && raw.buyer !== null ? raw.buyer : {};
  
  let items = Array.isArray(raw.items) && raw.items.length > 0 
    ? raw.items 
    : (Array.isArray(buyerObj.items) && buyerObj.items.length > 0 ? buyerObj.items : []);

  if (!items || items.length === 0) {
    const rawCrop = raw.cropName && raw.cropName !== 'Assorted Vegetables' ? raw.cropName : 'Fresh Produce';
    items = [
      {
        productId: raw.listingId || 'p1',
        productName: rawCrop,
        variety: raw.variety || 'Regular',
        quantity: Number(raw.quantity) || 1,
        unit: raw.quantityUnit || 'kg',
        price: Number(raw.pricePerUnit) || Number(raw.totalAmount) || 50,
      }
    ];
  } else {
    items = items.map(it => {
      const name = it.productName || it.name || 'Fresh Produce';
      return {
        productId: it.productId || it.id || 'p1',
        productName: name,
        variety: it.variety || 'Fresh Harvest',
        quantity: Number(it.quantity || it.qty || 1),
        unit: it.unit || 'kg',
        price: Number(it.price || 50),
      };
    });
  }

  return {
    ...raw,
    items: items,
  };
}

async function run() {
  const { data } = await supabase.from('orders').select('*').eq('id', 'FD-915065').single();
  const formatted = formatOrder(data);
  console.log(JSON.stringify(formatted.items, null, 2));
}

run();

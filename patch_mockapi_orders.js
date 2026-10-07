const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'farmdirect-buyer/src/services/mockApi.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const serverPayload = \{[\s\S]*?photos: \[\]\n    \};/m,
`const serverPayload = {
      id: orderNumber,
      buyer_id: payload.buyerId || 'buyer-demo',
      farmer_id: farmerId,
      crop_name: firstItemProduct.name || firstItemProduct.crop_name || 'Order Items',
      quantity: firstItemProduct.quantity || 1,
      quantity_unit: firstItemProduct.unit || 'unit',
      price_per_unit: firstItemProduct.price || 0,
      total_amount: payload.total || 0,
      status: 'new',
      buyer: {
        id: payload.buyerId || 'buyer-demo',
        name: payload.buyerName || 'Sunita Patil',
        phone: payload.buyerPhone || '+91 98201 45829',
        address: payload.address || 'Not specified',
        deliverySlot: payload.slot || 'Not specified',
        paymentMethod: payload.payment || 'UPI',
        items: items.map((item) => {
          const prod = item.product || item;
          return {
            productId: prod.id || prod.productId || null,
            productName: prod.name || prod.crop_name || 'Unknown Product',
            variety: prod.variety || 'Standard',
            quantity: item.cartQty || 1,
            unit: prod.unit || 'kg',
            price: prod.price || 0,
            image: prod.image || 'https://placehold.co/600x400/eeeeee/999999?text=Produce'
          };
        }),
      }
    };`
);

fs.writeFileSync(file, content);
console.log('done');

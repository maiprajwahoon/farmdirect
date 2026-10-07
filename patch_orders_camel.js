const fs = require('fs');
const path = require('path');

// 1. Patch farmdirect-buyer mockApi.js checkout payload
const mockApiFile = path.join(__dirname, 'farmdirect-buyer/src/services/mockApi.js');
let mockApiContent = fs.readFileSync(mockApiFile, 'utf8');

mockApiContent = mockApiContent.replace(
  /buyer_id: payload\.buyerId \|\| 'buyer-demo',\n\s*farmer_id: farmerId,\n\s*crop_name: firstItemProduct\.name[\s\S]*?total_amount:/m,
  `buyerId: payload.buyerId || 'buyer-demo',\n      farmerId: farmerId,\n      cropName: firstItemProduct.name || firstItemProduct.cropName || 'Order Items',\n      quantity: firstItemProduct.quantity || 1,\n      quantityUnit: firstItemProduct.unit || 'unit',\n      pricePerUnit: firstItemProduct.price || 0,\n      totalAmount:`
);

// getOrders
mockApiContent = mockApiContent.replace(/o\.buyer_id/g, "o.buyerId");
mockApiContent = mockApiContent.replace(/o\.farmer_id/g, "o.farmerId");
mockApiContent = mockApiContent.replace(/o\.crop_name/g, "o.cropName");
mockApiContent = mockApiContent.replace(/o\.quantity_unit/g, "o.quantityUnit");
mockApiContent = mockApiContent.replace(/o\.price_per_unit/g, "o.pricePerUnit");
mockApiContent = mockApiContent.replace(/o\.total_amount/g, "o.totalAmount");
mockApiContent = mockApiContent.replace(/o\.created_at/g, "o.createdAt");

fs.writeFileSync(mockApiFile, mockApiContent);

// 2. Patch web-app api.ts placeOrder payload
const webApiFile = path.join(__dirname, 'web-app/src/lib/api.ts');
let webApiContent = fs.readFileSync(webApiFile, 'utf8');

webApiContent = webApiContent.replace(
  /buyer_id: payload\.buyerId/g, "buyerId: payload.buyerId"
);
webApiContent = webApiContent.replace(
  /farmer_id: payload\.farmerId/g, "farmerId: payload.farmerId"
);
webApiContent = webApiContent.replace(
  /crop_name: payload\.cropName/g, "cropName: payload.cropName"
);
webApiContent = webApiContent.replace(
  /quantity_unit: payload\.quantityUnit/g, "quantityUnit: payload.quantityUnit"
);
webApiContent = webApiContent.replace(
  /price_per_unit: payload\.pricePerUnit/g, "pricePerUnit: payload.pricePerUnit"
);
webApiContent = webApiContent.replace(
  /total_amount: payload\.totalAmount/g, "totalAmount: payload.totalAmount"
);

fs.writeFileSync(webApiFile, webApiContent);

console.log('done');

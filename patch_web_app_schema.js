const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'web-app/src/lib/api.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/crop_name: p\.name/g, "product_name: p.name");
content = content.replace(/quantity_unit: p\.unit/g, "unit: p.unit");

content = content.replace(/crop_name: updates\.name/g, "product_name: updates.name");
content = content.replace(/quantity_unit: updates\.unit/g, "unit: updates.unit");

content = content.replace(/payload\.crop_name = updates\.name/g, "payload.product_name = updates.name");
content = content.replace(/payload\.quantity_unit = updates\.unit/g, "payload.unit = updates.unit");

fs.writeFileSync(file, content);
console.log('done');

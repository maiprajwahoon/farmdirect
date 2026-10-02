const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'server.js');
let code = fs.readFileSync(file, 'utf8');
code = code.replace("const PRODUCTS_FILE = path.join(__dirname, 'products.json');", "const PRODUCTS_FILE = process.env.VERCEL ? path.join('/tmp', 'products.json') : path.join(__dirname, 'products.json');");
code = code.replace("const ORDERS_FILE = path.join(__dirname, 'orders.json');", "const ORDERS_FILE = process.env.VERCEL ? path.join('/tmp', 'orders.json') : path.join(__dirname, 'orders.json');");
fs.writeFileSync(file, code);

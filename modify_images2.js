const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'server.js');
let code = fs.readFileSync(file, 'utf8');

// The previous script replaced http://localhost:3000 with ${process.env...} inside single quotes, e.g. '${process.env...}/images...'
// Let's replace '$\\{process.env.BACKEND_URL || \\'http://localhost:3000\\'\\}/images/...' with (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/...'
code = code.replace(/'\$\{process\.env\.BACKEND_URL \|\| 'http:\/\/localhost:3000'\}\/images\//g, "(process.env.BACKEND_URL || 'http://localhost:3000') + '/images/");

fs.writeFileSync(file, code);

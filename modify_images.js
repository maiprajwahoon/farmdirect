const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'server.js');
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/http:\/\/localhost:3000/g, "${process.env.BACKEND_URL || 'http://localhost:3000'}");
// Wait, the strings are in single quotes, so if we replace them with template literals it might break.
// Let's replace 'http://localhost:3000/images/...' with (process.env.BACKEND_URL || 'http://localhost:3000') + '/images/...'
fs.writeFileSync(file, code);

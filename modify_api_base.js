const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'web-app', 'src', 'lib', 'supabase.ts');
let code = fs.readFileSync(file, 'utf8');
code = code.replace("export const API_BASE = 'http://localhost:3000'", "export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'");
fs.writeFileSync(file, code);

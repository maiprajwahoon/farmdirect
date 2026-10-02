const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'server.js');
let code = fs.readFileSync(file, 'utf8');
code = code.replace("const PORT = 3000;\napp.listen(PORT, '0.0.0.0', () => {\n  console.log(`FarmDirect Integration Server running on http://0.0.0.0:${PORT}`);\n  console.log(`Waiting for orders from the buyer app & syncing products with farmer app...`);\n});", "if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {\n  const PORT = 3000;\n  app.listen(PORT, '0.0.0.0', () => {\n    console.log(`FarmDirect Integration Server running on http://0.0.0.0:${PORT}`);\n  });\n}\n\nmodule.exports = app;");
fs.writeFileSync(file, code);

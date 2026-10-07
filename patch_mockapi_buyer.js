const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'farmdirect-buyer/src/services/mockApi.js');
let content = fs.readFileSync(file, 'utf8');

// Completely remove the Node API fetch from searchProducts
content = content.replace(
  /try \{\n\s*\/\/ 1\. Try fetching from local backend first[\s\S]*?\/\/ 2\. Fallback to Supabase/m,
  `try {\n      // Always fetch from Supabase to ensure sync with Farmer App`
);
content = content.replace(
  /if \(results\.length === 0\) \{\n\s*const \{ data, error \} = await supabase\.from\('listings'\)\.select\('\*'\);/m,
  `const { data, error } = await supabase.from('listings').select('*');`
);

// Completely remove the Node API fetch from getOrders
content = content.replace(
  /try \{\n\s*let backendUrl = 'http:\/\/localhost:3000\/api\/orders';[\s\S]*?\/\/ 2\. Fallback to Supabase/m,
  `try {\n      // Always fetch from Supabase to ensure sync with Farmer App`
);

fs.writeFileSync(file, content);
console.log('done');

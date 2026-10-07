const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'happy-galileo/farm-direct/app/add-listing.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\} catch \(e\) \{\n\s*\/\/ Supabase RLS in demo mode will fail gracefully while local store retains it\n\s*console\.log\('Notice: Listing saved locally in store\.'\);\n\s*\}/m,
  `} catch (e) {
      console.log('Notice: Listing saved locally in store.', e);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert("Supabase Insert Failed: " + (e.message || JSON.stringify(e)));
      }
    }`
);

fs.writeFileSync(file, content);
console.log('done');

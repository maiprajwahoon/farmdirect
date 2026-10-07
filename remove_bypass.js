const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'web-app/src/pages/LoginPage.tsx');
let content = fs.readFileSync(file, 'utf8');

// Remove sendOtp bypass
content = content.replace(
  /\s*\/\/ DEVELOPER BYPASS\n\s*if \(email === 'littobiju1982@gmail\.com'\) \{\n\s*setTimeout\(\(\) => \{\n\s*setLoading\(false\); setMode\('otp'\);\n\s*\}, 500\);\n\s*return;\n\s*\}/m,
  ""
);

// Remove verifyOtp bypass
content = content.replace(
  /\s*\/\/ DEVELOPER BYPASS\n\s*if \(email === 'littobiju1982@gmail\.com'\) \{\n\s*setTimeout\(\(\) => \{\n\s*const fakeSession = \{\n\s*access_token: `dev-\$\{Date\.now\(\)\}`,\n\s*user: \{ id: 'littobiju1982', email: 'littobiju1982@gmail\.com', user_metadata: \{\} \}\n\s*\} as any;\n\s*setSupaSession\(fakeSession\);\n\s*setLoading\(false\);\n\s*setMode\('profile'\);\n\s*\}, 500\);\n\s*return;\n\s*\}/m,
  ""
);

// Remove completeProfile bypass
content = content.replace(
  /if \(supaSession\.user\.id !== 'littobiju1982'\) \{\n\s*await supabase\.auth\.updateUser\(\{ data: \{ name: name\.trim\(\), phone, address, farmName: farmName\.trim\(\), role: selectedRole \} \}\)\n\s*\}/m,
  "await supabase.auth.updateUser({ data: { name: name.trim(), phone, address, farmName: farmName.trim(), role: selectedRole } })"
);

fs.writeFileSync(file, content);
console.log('done');

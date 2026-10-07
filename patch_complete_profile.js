const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'web-app/src/pages/LoginPage.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /await supabase\.auth\.updateUser\(\{ data: \{ name: name\.trim\(\), phone, address, farmName: farmName\.trim\(\), role: selectedRole \} \}\)/,
  `if (supaSession.user.id !== 'littobiju1982') {
      await supabase.auth.updateUser({ data: { name: name.trim(), phone, address, farmName: farmName.trim(), role: selectedRole } })
    }`
);

fs.writeFileSync(file, content);
console.log('done');

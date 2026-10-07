const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://xkoewoyrlylsmogkexic.supabase.co';
const supabaseKey = 'sb_publishable_7Z9aohcBPGOMTAQ2MkuMQQ_JhSlqOMT'; 
const supabase = createClient(supabaseUrl, supabaseKey);
async function test() {
  const { data, error } = await supabase.from('listings').select('*').limit(1);
  console.log('Listings:', data, error);
}
test();

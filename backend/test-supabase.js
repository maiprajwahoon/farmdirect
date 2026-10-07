const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://xkoewoyrlylsmogkexic.supabase.co';
const supabaseKey = 'sb_publishable_7Z9aohcBPGOMTAQ2MkuMQQ_JhSlqOMT'; 
const supabase = createClient(supabaseUrl, supabaseKey);
async function test() {
  const { data: pData, error: pErr } = await supabase.from('products').select('*').limit(1);
  console.log('Products:', pData, pErr);
  const { data: oData, error: oErr } = await supabase.from('orders').select('*').limit(1);
  console.log('Orders:', oData, oErr);
}
test();

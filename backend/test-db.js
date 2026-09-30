const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://xkoewoyrlylsmogkexic.supabase.co';
const supabaseKey = 'sb_publishable_7Z9aohcBPGOMTAQ2MkuMQQ_JhSlqOMT'; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('listings').insert([
    { product_name: 'Test', quantity_available: 1, unit: 'kg', price_per_unit: 10, farmer_id: 'demo-farmer-1', available: true }
  ]);
  console.log("Error details:", error);
}
test();

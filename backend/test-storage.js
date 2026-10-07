const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://xkoewoyrlylsmogkexic.supabase.co';
const supabaseKey = 'sb_publishable_7Z9aohcBPGOMTAQ2MkuMQQ_JhSlqOMT'; 
const supabase = createClient(supabaseUrl, supabaseKey);
async function test() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log('Buckets:', data, error);
}
test();

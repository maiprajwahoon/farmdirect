const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'web-app/src/lib/api.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /async updateOrderStatus\(id: string, status: string, note\?: string\): Promise<Order> \{[\s\S]*?return data\.order\n  \},/m,
`async updateOrderStatus(id: string, status: string, note?: string): Promise<Order> {
    try {
      const data = await apiFetch(\`/api/orders/\${id}\`, {
        method: 'PUT',
        body: JSON.stringify({ status, note }),
      })
      return data.order
    } catch (err) {
      console.warn("Node backend unreachable, updating order in Supabase directly");
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return data as unknown as Order;
    }
  },`
);

fs.writeFileSync(file, content);
console.log('done');

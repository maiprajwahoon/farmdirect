const item = { product: { id: "p1", quantity: 200 }, qty: 2 };
const prod = item.product || item;
const q = Number(item.quantity_available || item.quantity || item.qty) || 1;
console.log(q);

import { db, ref, push, set, runTransaction } from "../firebase.js";

export async function createUsageAndReduceStock(pid, { dateISO, createdByUid, items, note }){
  const usageRef = push(ref(db, `projects/${pid}/materials/usage/${dateISO}`));
  const usageId = usageRef.key;

  // transaction per item/variant (stock should never go negative)
  for(const it of items){
    const { itemId, variantId, qty } = it;
    await runTransaction(ref(db, `projects/${pid}/materials/stock/${itemId}/${variantId}`), (current)=>{
      const cur = current || { quantity:0 };
      const q = Number(cur.quantity || 0);
      const delta = Number(qty || 0);
      const newQ = q - delta;
      return { ...cur, quantity: newQ < 0 ? 0 : newQ };
    });
  }

  await set(usageRef, {
    createdBy: createdByUid,
    createdAt: new Date().toISOString(),
    note: note || "",
    items: items.map(x=>({
      itemId: x.itemId,
      variantId: x.variantId,
      qty: Number(x.qty || 0),
      unit: x.unit || "",
      volume: x.volume ?? null
    }))
  });

  return usageId;
}

import { db, ref, get, set, push, update } from "../firebase.js";

export async function getTargets(pid, dateISO){
  const snap = await get(ref(db, `projects/${pid}/targets/${dateISO}`));
  return snap.exists() ? snap.val() : {};
}

export async function upsertTarget(pid, dateISO, target){
  const id = target.id || null;
  if(!id){
    const newRef = push(ref(db, `projects/${pid}/targets/${dateISO}`));
    id = newRef.key;
  }
  await set(ref(db, `projects/${pid}/targets/${dateISO}/${id}`), {
    workItem: target.workItem,
    unit: target.unit,
    plannedQty: Number(target.plannedQty || 0),
    dueDate: target.dueDate || "",
    updatedAt: new Date().toISOString(),
    updatedBy: target.updatedBy || null
  });
  return id;
}

export async function listDailyProgress(pid, dateISO){
  const snap = await get(ref(db, `projects/${pid}/dailyProgress/${dateISO}`));
  return snap.exists() ? snap.val() : {};
}

export async function upsertDailyProgress(pid, dateISO, key, payload){
  await update(ref(db, `projects/${pid}/dailyProgress/${dateISO}/${key}`), {
    ...payload,
    updatedAt: new Date().toISOString()
  });
}

export async function getConstraints(pid, dateISO){
  const snap = await get(ref(db, `projects/${pid}/constraints/${dateISO}`));
  return snap.exists() ? snap.val() : {};
}

export async function createConstraint(pid, dateISO, payload){
  const newRef = push(ref(db, `projects/${pid}/constraints/${dateISO}`));
  await set(newRef, {
    title: payload.title,
    status: payload.status || "Baru",
    solution: payload.solution || "",
    updatedBy: payload.updatedBy || null,
    createdAt: new Date().toISOString()
  });
  return newRef.key;
}

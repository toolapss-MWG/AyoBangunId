import { db, ref, get, set, update } from "../firebase.js";

export async function getAttendance(pid, dateISO){
  const snap = await get(ref(db, `projects/${pid}/attendance/${dateISO}`));
  return snap.exists() ? snap.val() : {};
}

export async function setAttendanceItem(pid, dateISO, uid, payload){
  await update(ref(db, `projects/${pid}/attendance/${dateISO}/${uid}`), payload);
}

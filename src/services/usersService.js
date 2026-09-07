import { auth, db, ref, get, set, update, createUserWithEmailAndPassword } from "../firebase.js";

export function usernameToEmail(username, suffix){
  return `${String(username).trim()}${suffix}`;
}

export async function getMyRole(){
  const uid = auth.currentUser?.uid;
  if(!uid) return null;
  const snap = await get(ref(db, `roles/${uid}`));
  return snap.exists() ? snap.val() : null;
}

export async function ensureRole(uid, data){
  await set(ref(db, `roles/${uid}`), data);
}

export async function listMandorsByProject(pid){
  const snap = await get(ref(db, "roles"));
  const roles = snap.exists() ? snap.val() : {};
  const out = [];
  for(const [uid, r] of Object.entries(roles)){
    if(r?.role === "mandor" && r?.projectId === pid){
      out.push({ uid, username:r.username, displayName:r.displayName || r.username, projectId:r.projectId });
    }
  }
  out.sort((a,b)=> (a.username||"").localeCompare(b.username||""));
  return out;
}

export async function createMandor({ username, password, displayName, projectId }, { emailSuffix }){
  const email = usernameToEmail(username, emailSuffix);
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  await set(ref(db, `roles/${uid}`), {
    role: "mandor",
    username,
    displayName: displayName || username,
    projectId,
    createdAt: new Date().toISOString()
  });
  return uid;
}

export async function updateMyPassword(newPassword){
  // owner can do
  // updatePassword is handled in main view with auth current user.
  return true;
}

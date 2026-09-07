js

import { db, ref, onValue, get } from "../firebase.js";  export function watchProjects(callback){   return onValue(ref(db, "projects"), (snap)=>{     const obj = snap.val() || {};     const projects = Object.entries(obj).map(([id, v]) => ({ id, meta: v?.meta || {} }));     callback(projects);   }); }  export async function getProject(pid){   const snap = await get(ref(db, projects/${pid}/meta));   return snap.exists() ? snap.val() : {}; }

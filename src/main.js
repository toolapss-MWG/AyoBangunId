import { auth, db, onAuthStateChanged, signOut, ref, get, onValue } from "./firebase.js";
import { APP } from "./config.js";
import { toastFactory, formatDateISO } from "./utils.js";
import { renderLogin } from "./views/loginView.js";
import { renderShell } from "./views/shellView.js";
import { renderAttendanceView } from "./views/attendanceView.js";
import { renderReportsView } from "./views/reportsView.js";
import { renderMaterialsView } from "./views/materialsView.js";
import { renderProgressView } from "./views/progressView.js";
import { renderAdminView } from "./views/adminView.js";

const $ = (id) => document.getElementById(id);
const toast = toastFactory();

const state = { me:null, role:null, projects:[], activeProjectId:null, members:[], activeTab:"attendance", listeners:[] };

function clearListeners(){ while(state.listeners.length){ try{ state.listeners.pop()(); }catch(e){} } }

async function loadMeRole(){
  const roleSnap = await get(ref(db, `roles/${state.me.uid}`));
  const r = roleSnap.exists() ? roleSnap.val() : null;
  state.role = r?.role || null;
  state.activeProjectId = state.role === "mandor" ? (r?.projectId || null) : (state.activeProjectId || null);
}

function renderApp(){
  renderShell($("root"), {
    me: state.me,
    role: state.role,
    projectOptions: state.projects,
    activeProjectId: state.activeProjectId
  }, {
    onNavigate: (action, payload) => {
      if(action === "setProject"){ state.activeProjectId = payload; renderApp(); return; }
      state.activeTab = action;
      renderMain();
    },
    onLogout: async () => { await signOut(auth); }
  });
  renderMain();
}

function renderMain(){
  const root = document.getElementById("mainView");
  if(!root) return;
  const p = state.projects.find(x=>x.id===state.activeProjectId) || {meta:{}};
  switch(state.activeTab){
    case "attendance": return renderAttendanceView(root, { members: state.members, pid: state.activeProjectId, dateISO: formatDateISO(new Date()), onDateChange: ()=>{}, meUid: state.me?.uid });
    case "reports": return renderReportsView(root, { pid: state.activeProjectId, projectMeta: p.meta, members: state.members });
    case "materials": return renderMaterialsView(root, { pid: state.activeProjectId });
    case "progress": return renderProgressView(root, { pid: state.activeProjectId });
    case "admin": return renderAdminView(root, { pid: state.activeProjectId, role: state.role, me: state.me });
    default: root.innerHTML = `<div class="small">Tab belum tersedia.</div>`;
  }
}

function watchProjects(){
  const unsub = onValue(ref(db, "projects"), (snap)=>{
    const obj = snap.val() || {};
    state.projects = Object.entries(obj).map(([id,v])=>({id, meta:v?.meta||{}}));
    state.projects.sort((a,b)=>(a.meta?.name||"").localeCompare(b.meta?.name||""));
    if(!state.activeProjectId && state.projects.length) state.activeProjectId = state.projects[0].id;
    renderApp();
  });
  state.listeners.push(unsub);
}

function watchMembers(){
  const unsub = onValue(ref(db, "roles"), (snap)=>{
    const obj = snap.val() || {};
    state.members = Object.entries(obj).filter(([uid,r])=>r?.role==="mandor" && r?.projectId===state.activeProjectId).map(([uid,r])=>({uid, username:r.username, displayName:r.displayName || r.username}));
    renderMain();
  });
  state.listeners.push(unsub);
}

onAuthStateChanged(auth, async (user)=>{
  clearListeners();
  if(!user){
    state.me = null; state.role = null; state.projects=[]; state.members=[]; state.activeProjectId=null;
    renderLogin($("root"));
    return;
  }
  state.me = { uid:user.uid, email:user.email, username:(user.email||"").replace(APP.emailSuffix,"") };
  await loadMeRole();
  watchProjects();
  watchMembers();
  renderApp();
});

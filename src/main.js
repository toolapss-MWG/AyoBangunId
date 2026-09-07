import "./firebase.js"; // memastikan module load (opsional)
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  ref,
  get,
  onValue,
  set,
  update
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

import { APP } from "./config.js";
import { escapeHtml, toastFactory } from "./utils.js";

import { renderLogin } from "./views/loginView.js";
import { renderShell } from "./views/shellView.js";

// View (sesuaikan dengan file kamu)
import { renderAttendanceView } from "./views/attendanceView.js";
import { renderReportsView } from "./views/reportsView.js";
import { renderMaterialsView } from "./views/materialsView.js";
import { renderProgressView } from "./views/progressView.js";
import { renderAdminView } from "./views/adminView.js";

const $ = (id) => document.getElementById(id);

const toast = toastFactory();

const state = {
  me: null,               // {uid, username, email}
  role: null,             // owner/admin/mandor
  activeProjectId: null, // owner/admin bisa pilih, mandor fixed
  projects: [],           // [{id, meta}]
  members: [],            // list tenaga kerja (buat absensi)
  activeDateISO: null,
  activeTab: "attendance",
  listeners: [],
};

function setSyncIndicator(/* optional */) {
  // Kalau kamu mau indikator sync, bisa ditambahkan di shell
}

function clearListeners() {
  while (state.listeners.length) {
    try { state.listeners.pop()(); } catch (e) {}
  }
}

function navTo(tab) {
  state.activeTab = tab;
  rerenderMainView();
}

function getActiveProject() {
  return state.projects.find(p => p.id === state.activeProjectId) || null;
}

function computeMembersFromRoles(rolesObj) {
  // Policy sederhana:
  // - Mandor: tampil untuk absensi
  // - Owner/Admin (yang tidak punya projectId tetap) tidak dimasukkan kecuali kamu mau
  const pid = state.activeProjectId;
  const members = [];

  for (const [uid, r] of Object.entries(rolesObj || {})) {
    if (r?.role === "mandor" && r?.projectId === pid) {
      members.push({
        uid,
        username: r?.username || "",
        displayName: r?.displayName || r?.username || "",
        role: r?.role,
      });
    }
  }

  members.sort((a, b) => (a.username || "").localeCompare(b.username || ""));
  return members;
}

async function loadRoleAndProjectsOnce() {
  const user = state.me;
  if (!user) return;

  // load role
  const roleSnap = await get(ref(db, `roles/${user.uid}`));
  const r = roleSnap.exists() ? roleSnap.val() : null;

  state.role = r?.role || null;
  if (!state.role) {
    toast("Role belum ada. Hubungi owner/admin.");
    return;
  }

  // Mandor project fixed
  if (state.role === "mandor") {
    state.activeProjectId = r?.projectId || null;
  } else {
    state.activeProjectId = null; // owner/admin bisa pilih dari dropdown
  }
}

function setupProjectsRealtime() {
  clearListeners();

  const projectsRef = ref(db, "projects");
  const unsub = onValue(projectsRef, (snap) => {
    const obj = snap.val() || {};
    state.projects = Object.entries(obj).map(([id, v]) => ({
      id,
      meta: v?.meta || {}
    }));

    state.projects.sort((a, b) => (a.meta?.name || "").localeCompare(b.meta?.name || ""));

    // set default aktif
    if (!state.activeProjectId) {
      if (state.projects.length) state.activeProjectId = state.projects[0].id;
    }

    rerenderShellAndMain();
  });

  state.listeners.push(unsub);
}

function setupMembersRealtime() {
  const rolesRef = ref(db, "roles");
  const unsub = onValue(rolesRef, async (snap) => {
    const rolesObj = snap.val() || {};
    state.members = computeMembersFromRoles(rolesObj);
    rerenderMainView();
  });
  state.listeners.push(unsub);
}

function rerenderShellAndMain() {
  const projectMeta = getActiveProject()?.meta || {};

  const projectOptions = state.projects.map(p => ({
    id: p.id,
    meta: p.meta
  }));

  renderShell($("root"), {
    me: state.me,
    role: state.role,
    projects: state.projects,
    projectOptions,
    activeProjectId: state.activeProjectId,
    onNavigate: (tab) => navTo(tab),
    onLogout: async () => {
      await signOut(auth);
      toast("Logout berhasil.");
    }
  });

  rerenderMainView();

  // reset sync indicator (optional)
  setSyncIndicator(true);

  // if mandor and no activeProjectId, warn
  if (state.role === "mandor" && !state.activeProjectId) {
    toast("Mandor belum punya projectId. Hubungi admin/owner.");
  }

  // Default tab behavior
  if (!state.activeDateISO) {
    const d = new Date();
    state.activeDateISO = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  // show role-appropriate tabs
  if (state.role === "mandor") {
    state.activeTab = "attendance";
  }
}

function rerenderMainView() {
  const root = $("mainView") || document.getElementById("mainView");
  if (!root) {
    // renderShell belum selesai / shell belum buat main container
    return;
  }

  const pid = state.activeProjectId;
  const projectMeta = getActiveProject()?.meta || {};

  // Guard
  if (!pid && (state.role === "owner" || state.role === "admin")) {
    root.innerHTML = `<div class="section-title">Proyek belum dipilih</div><div class="small">Pilih proyek di panel.</div>`;
    return;
  }
  if (!pid && state.role === "mandor") {
    root.innerHTML = `<div class="section-title">Mandor tidak punya proyek</div><div class="small">Hubungi admin/owner.</div>`;
    return;
  }

  switch (state.activeTab) {
    case "attendance":
      renderAttendanceView(root, {
        members: state.members,
        pid,
        dateISO: state.activeDateISO,
        onDateChange: (newISO) => {
          state.activeDateISO = newISO;
          rerenderMainView();
        },
        meUid: state.me?.uid
      });
      break;

    case "reports":
      renderReportsView(root, {
        pid,
        projectMeta,
        members: state.members
      });
      break;

    case "materials":
      renderMaterialsView(root, { pid });
      break;

    case "progress":
      renderProgressView(root, { pid });
      break;

    case "admin":
      renderAdminView(root, { pid, role: state.role, me: state.me });
      break;

    default:
      root.innerHTML = `<div class="small">Tab belum tersedia.</div>`;
  }
}

function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}

function startAppAfterAuth() {
  // realtime: projects + members
  setupProjectsRealtime();
  setupMembersRealtime();

  rerenderShellAndMain();
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    state.me = null;
    state.role = null;
    state.activeProjectId = null;
    state.projects = [];
    state.members = [];
    state.activeTab = "attendance";
    clearListeners();

    // render login
    renderLogin($("root"), {
      onAuthed: () => startAppAfterAuth()
    });
    return;
  }

  // user authed
  const email = user.email || "";
  const username = email.replace(APP.emailSuffix, "");

  state.me = {
    uid: user.uid,
    email: user.email,
    username
  };

  // load role once, lalu setup realtime
  loadRoleAndProjectsOnce().then(() => {
    if (!state.role) {
      renderLogin($("root"), { onAuthed: () => {} });
      return;
    }
    state.activeTab = "attendance";
    startAppAfterAuth();
  });
});

// register PWA SW
registerSW();

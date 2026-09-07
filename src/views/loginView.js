import { signInWithEmailAndPassword, createUserWithEmailAndPassword, auth, db, set, ref } from "../firebase.js";
import { APP } from "../config.js";
import { escapeHtml, toastFactory } from "../utils.js";

const $ = (id) => document.getElementById(id);
const usernameToEmail = (u) => `${u}${APP.emailSuffix}`;

export function renderLogin(root){
  root.innerHTML = `
    <div class="container">
      <div class="card" style="padding:16px;">
        <div class="header" style="border-bottom:none; padding:0; margin-bottom:12px;">
          <div class="brand">
            <img src="./assets/logo-ayo-bangun.jpeg" alt="logo"/>
            <div class="title">
              <h1>Ayo Bangun.ID Contractor</h1>
              <p>PWA • Absensi • Material • Progres • WA Report</p>
            </div>
          </div>
        </div>

        <div class="section-title">Login</div>
        <div class="small" style="margin-bottom:14px;">
          Login pakai <b>username</b> (bukan email). Default DEV:
          admin/0000 dan owner/${escapeHtml(APP.devSetup.owner.password)}
        </div>

        <div class="grid2">
          <div class="field">
            <label>Username</label>
            <input id="inUsername" placeholder="admin / owner / mandor1" autocomplete="username"/>
          </div>
          <div class="field">
            <label>Password</label>
            <input id="inPassword" type="password" placeholder="password" autocomplete="current-password"/>
          </div>
        </div>

        <div style="height:12px;"></div>
        <button class="primary" id="btnLogin" type="button" style="width:100%;">Login</button>

        <div style="height:14px;"></div>
        <div class="card" style="border-radius:14px; padding:12px; background: rgba(255,255,255,.015); border: 1px dashed rgba(202,162,75,.35);">
          <div class="section-title" style="margin:0 0 10px 0; font-size:14px;">DEV Setup</div>
          <div class="field">
            <label>Setup code</label>
            <input id="inSetupCode" placeholder="AYOBANGUN_SETUP_2026"/>
          </div>
          <div style="height:10px;"></div>
          <button class="ok" id="btnSetup" type="button" style="width:100%;">Buat admin & owner default</button>
        </div>
      </div>
    </div>
  `;

  const toast = toastFactory();

  $("btnLogin").onclick = async () => {
    const username = $("inUsername").value.trim();
    const password = $("inPassword").value;
    if (!username || !password) return toast("Isi username & password.");

    try {
      await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
      toast("Login berhasil.");
    } catch (e) {
      console.error(e);
      toast("Login gagal.");
    }
  };

  $("btnSetup").onclick = async () => {
    const code = $("inSetupCode").value.trim();
    if (code !== APP.devSetup.code) return toast("Setup code salah.");

    async function createRoleUser(username, password, role){
      try{
        const cred = await createUserWithEmailAndPassword(auth, usernameToEmail(username), password);
        await set(ref(db, `roles/${cred.user.uid}`), {
          role,
          username,
          displayName: username,
          projectId: null,
          createdAt: new Date().toISOString()
        });
        toast(`${role} dibuat: ${username}`);
      }catch(e){
        console.warn(e);
        toast(`${username} mungkin sudah ada.`);
      }
    }

    await createRoleUser(APP.devSetup.admin.username, APP.devSetup.admin.password, "admin");
    await createRoleUser(APP.devSetup.owner.username, APP.devSetup.owner.password, "owner");
  };
}

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, auth, db, set, ref } from "../firebase.js";
import { APP } from "../config.js";
import { escapeHtml, formatDateISO, toastFactory } from "../utils.js";

export function renderLogin(root, onAuthed){
  root.innerHTML = `
    <div class="container">
      <div class="card" style="padding:16px;">
        <div class="header" style="border-bottom:none; padding:0; margin-bottom:12px;">
          <div class="brand">
            <img src="./assets/logo-ayo-bangun.jpeg" alt="logo"/>
            <div class="title">
              <h1>Ayo Bangun.ID Contractor</h1>
              <p>PWA • Absensi & Laporan WA</p>
            </div>
          </div>
        </div>

        <div class="section-title">Login</div>
        <div class="small" style="margin-bottom:14px;">
          Login pakai <b>username</b> (bukan email). Internal untuk aplikasi.<br/>
          Default DEV: admin/0000 dan owner/${escapeHtml(APP.devSetup.owner.password)}
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
        <div class="row">
          <button class="primary" id="btnLogin" type="button" style="flex:1;">Login</button>
        </div>

        <div style="height:14px;"></div>
        <div class="card" style="border-radius:14px; padding:12px; background: rgba(255,255,255,.015); border: 1px dashed rgba(202,162,75,.35);">
          <div class="section-title" style="margin:0 0 10px 0; font-size:14px;">DEV Setup (opsional)</div>
          <div class="field">
            <label>Setup code</label>
            <input id="inSetupCode" placeholder="AYOBANGUN_SETUP_2026"/>
          </div>
          <div style="height:10px;"></div>
          <button class="ok" id="btnSetup" type="button" style="width:100%;">Buat admin & owner default</button>
          <div class="small" style="margin-top:8px;">
            Buat user pertama agar aplikasi bisa login.<br/>
            Setelah produksi, nonaktifkan ini.
          </div>
        </div>
      </div>
    </div>
  `;

  const toast = toastFactory();
  const emailSuffix = APP.emailSuffix;

  function usernameToEmail(u){ return `${u}${emailSuffix}`; }

  $("btnLogin").onclick = async ()=>{
    const username = $("inUsername").value.trim();
    const password = $("inPassword").value;
    if(!username || !password) return toast("Isi username & password.");

    const email = usernameToEmail(username);
    try{
      await signInWithEmailAndPassword(auth, email, password);
      toast("Login berhasil.");
    }catch(e){
      console.error(e);
      toast("Login gagal. cek password/username.");
    }
  };

  $("btnSetup").onclick = async ()=>{
    const code = $("inSetupCode").value.trim();
    if(code !== APP.devSetup.code) return toast("Setup code salah.");

    // Create default users (owner/admin) + set roles
    const adminEmail = usernameToEmail(APP.devSetup.admin.username);
    const ownerEmail = usernameToEmail(APP.devSetup.owner.username);

    async function ensure(email, username, role, projectId=null){
      try{
        const cred = await createUserWithEmailAndPassword(auth, email, arguments[3]);
      }catch(e){}
    }

    async function createAndRole({ username, password, role }){
      try{
        const email = usernameToEmail(username);
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(db, `roles/${cred.user.uid}`), {
          role,
          username,
          displayName: username,
          projectId: projectId || null,
          createdAt: new Date().toISOString()
        });
        toast(`User ${role} dibuat: ${username}`);
      }catch(e){
        toast(`User ${role} mungkin sudah ada (skip).`);
      }
    }

    await createAndRole({ username: APP.devSetup.admin.username, password: APP.devSetup.admin.password, role:"admin" });
    await createAndRole({ username: APP.devSetup.owner.username, password: APP.devSetup.owner.password, role:"owner" });

    // Make demo project if none exists is handled elsewhere (admin view)
  };
}

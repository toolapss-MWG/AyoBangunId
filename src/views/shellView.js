import { escapeHtml } from "../utils.js";
const $ = (id) => document.getElementById(id);

export function renderShell(root, { me, role, projectOptions, activeProjectId }, { onNavigate, onLogout }){
  const isAdmin = role === "admin" || role === "owner";
  const navItems = [
    { id:"attendance", label:"Absensi" },
    { id:"materials", label:"Material" },
    { id:"progress", label:"Progres" },
    { id:"reports", label:"Laporan WA" },
  ];
  if(isAdmin) navItems.splice(2, 0, { id:"admin", label:"Admin" });

  root.innerHTML = `
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="brand">
            <img src="./assets/logo-ayo-bangun.jpeg" alt="Logo"/>
            <div class="title">
              <h1>Ayo Bangun.ID Contractor</h1>
              <p>POS Proyek Konstruksi • Firebase Realtime • PWA</p>
            </div>
          </div>
          <div class="pill">
            <span class="dot"></span>
            <span>${escapeHtml(me?.username || "-")} • ${escapeHtml(role || "-")}</span>
          </div>
        </div>
        <div class="main">
          <div id="mainView"></div>
          <div class="card" style="border-radius:16px;">
            <div style="padding:16px;">
              <div class="section-title">Kontrol</div>
              <div class="small">Proyek aktif: <b id="activeProjectLabel">${escapeHtml(activeProjectId || "-")}</b></div>
              ${isAdmin ? `
                <div style="height:12px;"></div>
                <div class="field">
                  <label>Ganti Proyek</label>
                  <select id="projectSelect">
                    ${(projectOptions || []).map(p => `<option value="${p.id}" ${p.id===activeProjectId ? "selected":""}>${escapeHtml(p.meta?.name || p.id)}</option>`).join("")}
                  </select>
                </div>
              ` : `<div style="height:12px;"></div><div class="small">Mandor: proyek tetap.</div>`}
              <div style="height:12px;"></div>
              <button class="ghost" id="btnLogout" style="width:100%;">Logout</button>
            </div>
          </div>
        </div>
        <div id="spacerbottom" class="spacerbottom"></div>
        <div class="navbottom" id="navbottom">
          ${navItems.map(x => `<button class="navbtn" data-tab="${x.id}">${x.label}</button>`).join("")}
        </div>
      </div>
    </div>
  `;

  if(isAdmin){
    $("#projectSelect").onchange = () => onNavigate("setProject", $("#projectSelect").value);
  }
  $("#btnLogout").onclick = onLogout;
  document.querySelectorAll(".navbtn").forEach(btn => btn.onclick = () => onNavigate(btn.dataset.tab));
}

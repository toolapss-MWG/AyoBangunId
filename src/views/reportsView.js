import { db, ref, get } from "../firebase.js";
import { enumerateDays, formatDateISO, parseISO, openWA } from "../utils.js";
import { fetchAttendanceRange, buildAttendanceReportText } from "../services/reportsService.js";
import { escapeHtml, toastFactory } from "../utils.js";

const $ = (id) => document.getElementById(id);

export function renderReportsView(root, { pid, projectMeta, members }){
  const toast = toastFactory();
  root.innerHTML = `
    <div class="section-title">Laporan WhatsApp</div>
    <div class="card" style="padding:14px; border-radius:16px;">
      <div class="grid2">
        <div class="card" style="padding:12px; border-radius:14px;">
          <div style="font-weight:900; margin-bottom:10px;">Harian</div>
          <div class="field"><label>Tanggal</label><input id="repDaily" type="date"/></div>
          <div style="height:10px;"></div>
          <button class="primary" id="btnDaily" style="width:100%;">Kirim ke WA</button>
        </div>
        <div class="card" style="padding:12px; border-radius:14px;">
          <div style="font-weight:900; margin-bottom:10px;">Mingguan</div>
          <div class="field"><label>Tanggal mulai</label><input id="repWeekly" type="date"/></div>
          <div style="height:10px;"></div>
          <button class="primary" id="btnWeekly" style="width:100%;">Kirim ke WA</button>
        </div>
        <div class="card" style="padding:12px; border-radius:14px; grid-column:1/-1;">
          <div style="font-weight:900; margin-bottom:10px;">Bulanan</div>
          <div class="grid2">
            <div class="field"><label>Bulan</label><input id="repMonthly" type="month"/></div>
            <div class="field"><label>Nomor WA proyek</label><input id="repWa" value="${escapeHtml(projectMeta?.waNumber || "")}"/></div>
          </div>
          <div style="height:10px;"></div>
          <textarea id="repPreview" readonly></textarea>
          <div style="height:10px;"></div>
          <button class="primary" id="btnMonthly" style="width:100%;">Kirim ke WA</button>
        </div>
      </div>
    </div>
  `;

  const today = new Date();
  $("repDaily").value = formatDateISO(today);
  $("repWeekly").value = formatDateISO(today);
  $("repMonthly").value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;

  async function rolesMap(){
    const snap = await get(ref(db, "roles"));
    return snap.exists() ? snap.val() : {};
  }

  $("btnDaily").onclick = async () => {
    const dateISO = $("repDaily").value;
    const dates = [dateISO];
    const amap = await fetchAttendanceRange(pid, dates);
    const rmap = await rolesMap();
    const txt = buildAttendanceReportText({ pid, projectName: projectMeta?.name, dateList: dates, attendanceMap: amap, rolesMap: rmap });
    try { openWA($("repWa").value, txt); } catch(e){ toast(e.message); }
  };

  $("btnWeekly").onclick = async () => {
    const start = $("repWeekly").value;
    const startD = parseISO(start);
    const endD = new Date(startD); endD.setDate(endD.getDate()+6);
    const dates = enumerateDays(formatDateISO(startD), formatDateISO(endD));
    const amap = await fetchAttendanceRange(pid, dates);
    const rmap = await rolesMap();
    const txt = buildAttendanceReportText({ pid, projectName: projectMeta?.name, dateList: dates, attendanceMap: amap, rolesMap: rmap });
    try { openWA($("repWa").value, txt); } catch(e){ toast(e.message); }
  };

  async function updatePreview(){
    const ym = $("repMonthly").value;
    if(!ym) return;
    const [y,m] = ym.split("-").map(Number);
    const start = new Date(y, m-1, 1);
    const end = new Date(y, m, 0);
    const dates = enumerateDays(formatDateISO(start), formatDateISO(end));
    const amap = await fetchAttendanceRange(pid, dates);
    const rmap = await rolesMap();
    $("repPreview").value = buildAttendanceReportText({ pid, projectName: projectMeta?.name, dateList: dates, attendanceMap: amap, rolesMap: rmap });
  }
  $("repMonthly").onchange = updatePreview;
  updatePreview();

  $("btnMonthly").onclick = async () => {
    const ym = $("repMonthly").value;
    const [y,m] = ym.split("-").map(Number);
    const start = new Date(y, m-1, 1);
    const end = new Date(y, m, 0);
    const dates = enumerateDays(formatDateISO(start), formatDateISO(end));
    const amap = await fetchAttendanceRange(pid, dates);
    const rmap = await rolesMap();
    const txt = buildAttendanceReportText({ pid, projectName: projectMeta?.name, dateList: dates, attendanceMap: amap, rolesMap: rmap });
    try { openWA($("repWa").value, txt); } catch(e){ toast(e.message); }
  };
}

import { getAttendance, setAttendanceItem } from "../services/attendanceService.js";
import { uidKey, escapeHtml } from "../utils.js";

const ATT = { hadir:"Hadir", sakit:"Sakit", izin:"Izin", alpha:"Alpha" };
const $ = (id) => document.getElementById(id);

export function renderAttendanceView(root, { members, pid, dateISO, onDateChange, meUid }){
  root.innerHTML = `
    <div class="section-title">Absensi Tenaga Kerja</div>
    <div class="card" style="padding:14px; border-radius:16px;">
      <div class="row" style="justify-content: space-between;">
        <div class="row">
          <div class="field" style="max-width:220px; min-width:220px;">
            <label>Tanggal</label>
            <input type="date" id="attDate" value="${escapeHtml(dateISO)}"/>
          </div>
          <button class="ghost" id="btnLoad" type="button">Muat</button>
        </div>
        <div class="small" style="text-align:right;">Edit absensi: semua user boleh.</div>
      </div>
      <div style="height:12px;"></div>
      <div style="overflow:auto;">
        <table>
          <thead><tr><th style="width:42%;">Tenaga Kerja</th><th style="width:28%;">Status</th><th>Aksi</th></tr></thead>
          <tbody id="attBody"></tbody>
        </table>
      </div>
      <div class="small" style="margin-top:10px;" id="attMeta">—</div>
    </div>
  `;

  const attBody = root.querySelector("#attBody");
  const attMeta = root.querySelector("#attMeta");
  const attDate = root.querySelector("#attDate");
  attDate.onchange = ()=> onDateChange(attDate.value);

  async function load(){
    const data = await getAttendance(pid, attDate.value);
    attMeta.textContent = `Tanggal: ${attDate.value}`;
    attBody.innerHTML = "";
    for(const m of members){
      const rec = data?.[m.uid] || {};
      const status = rec.status || "";
      const note = rec.note || "";
      attBody.innerHTML += `
        <tr>
          <td><div style="font-weight:900;">${escapeHtml(m.displayName || m.username)}</div><div class="small">${escapeHtml(m.username)}</div></td>
          <td>
            <select id="attSel_${uidKey(m.uid)}">
              ${Object.values(ATT).map(st=>`<option value="${st}" ${st===status?"selected":""}>${st}</option>`).join("")}
            </select>
          </td>
          <td>
            <input id="attNote_${uidKey(m.uid)}" placeholder="catatan (opsional)" value="${escapeHtml(note)}" style="width:100%; margin-bottom:8px;"/>
            <button class="ok" type="button" style="width:100%;" data-uid="${escapeHtml(m.uid)}">Simpan</button>
          </td>
        </tr>
      `;
    }
    attBody.querySelectorAll("button[data-uid]").forEach(btn=>{
      btn.onclick = async ()=>{
        const uid = btn.dataset.uid;
        const status = root.querySelector(`#attSel_${uidKey(uid)}`).value;
        const note = root.querySelector(`#attNote_${uidKey(uid)}`).value.trim();
        await setAttendanceItem(pid, attDate.value, uid, { status, note, updatedAt: new Date().toISOString(), updatedBy: meUid });
        load();
      };
    });
  }

  root.querySelector("#btnLoad").onclick = load;
  load();
}

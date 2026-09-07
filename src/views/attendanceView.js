import { getAttendance, setAttendanceItem } from "../services/attendanceService.js";  
import { uidKey, escapeHtml, formatDateISO, parseISO } from "../utils.js";  

const ATT = { hadir:"Hadir", sakit:"Sakit", izin:"Izin", alpha:"Alpha" };  

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
          <thead>  
            <tr>  
              <th style="width:42%;">Tenaga Kerja</th>  
              <th style="width:28%;">Status</th>  
              <th>Aksi</th>  
            </tr>  
          </thead>  
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

  function statusClass(status){  
    if(status==="Hadir") return "status-hadir";  
    if(status==="Sakit") return "status-sakit";  
    if(status==="Izin") return "status-izin";  
    return "status-alpha";  
  }  

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
          <td>  
            <div style="font-weight:900;">${escapeHtml(m.displayName || m.username)}</div>  
            <div class="small">${escapeHtml(m.username)}</div>  
          </td>  
          <td>  
            <select id="attSel_${uidKey(m.uid)}">  
              ${Object.values(ATT).map(st=>{  
                const sel = st===status ? "selected":"";  
                return `<option value="${st}" ${sel}>${st}</option>`;  
              }).join("")}  
            </select>  
            <div class="small" style="margin-top:8px; color: var(--muted);">${note ? "Catatan: "+escapeHtml(note) : ""}</div>  
          </td>  
          <td>  
            <input id="attNote_${uidKey(m.uid)}" placeholder="catatan (opsional)" value="${escapeHtml(note)}" style="width:100%; margin-bottom:8px;"/>  
            <button class="ok" type="button" style="width:100%;" data-uid="${escapeHtml(m.uid)}">Simpan</button>  
          </td>  
        </tr>  
      `;  
    }  

    // bind save  
    attBody.querySelectorAll("button[data-uid]").forEach(btn=>{  
      btn.onclick = async ()=>{  
        const uid = btn.dataset.uid;  
        const sel = root.querySelector(`#attSel_${uidKey(uid)}`);  
        const noteEl = root.querySelector(`#attNote_${uidKey(uid)}`);  
        const status = sel.value;  
        const note = (noteEl.value || "").trim();  

        await setAttendanceItem(pid, attDate.value, uid, {  
          status,  
         

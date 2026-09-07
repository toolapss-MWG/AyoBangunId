import { db, ref, get } from "../firebase.js";
import { enumerateDays } from "../utils.js";

export async function fetchAttendanceRange(pid, dateList){
  const out = {};
  for(const dateISO of dateList){
    const snap = await get(ref(db, `projects/${pid}/attendance/${dateISO}`));
    if(!snap.exists()) continue;
    const day = snap.val() || {};
    for(const [uid, rec] of Object.entries(day)){
      if(!out[uid]) out[uid] = {};
      out[uid][dateISO] = rec;
    }
  }
  return out;
}

export function buildAttendanceReportText({ pid, projectName, dateList, attendanceMap, rolesMap }){
  const totals = { Hadir:0, Sakit:0, Izin:0, Alpha:0 };
  const perUser = [];
  for(const [uid, days] of Object.entries(attendanceMap || {})){
    let last = "-";
    for(let i = dateList.length - 1; i >= 0; i--){
      const rec = days[dateList[i]];
      if(rec?.status){ last = rec.status; break; }
    }
    const display = rolesMap?.[uid]?.displayName || rolesMap?.[uid]?.username || uid;
    perUser.push(`• ${display}: ${last}`);
    for(const di of dateList){
      const st = days?.[di]?.status;
      if(totals[st] != null) totals[st]++;
    }
  }

  const range = `${dateList[0]} s/d ${dateList[dateList.length-1]}`;
  return [
    `Laporan Absensi ${dateList.length === 1 ? "Harian" : dateList.length === 7 ? "Mingguan" : "Bulanan"}`,
    `Proyek: ${projectName || pid}`,
    `Periode: ${range}`,
    "",
    "Rekap:",
    `- Hadir: ${totals.Hadir}`,
    `- Sakit: ${totals.Sakit}`,
    `- Izin: ${totals.Izin}`,
    `- Alpha: ${totals.Alpha}`,
    "",
    "Status per mandor:",
    perUser.join("
") || "-",
  ].join("
");
}

import { db, ref, get } from "../firebase.js";

export async function fetchAttendanceRange(pid, dateList){
  const out = {};
  for(const dateISO of (dateList || [])){
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
  const safeDateList = Array.isArray(dateList) ? dateList : [];
  const totals = { Hadir:0, Sakit:0, Izin:0, Alpha:0 };
  const perUser = [];
  if(safeDateList.length === 0){
    return [
      "Laporan Absensi",
      `Proyek: ${projectName || pid}`,
      "Periode: -",
      "",
      "Rekap:",
      "- Hadir: 0",
      "- Sakit: 0",
      "- Izin: 0",
      "- Alpha: 0",
    ].join("\n");
  }
  for(const [uid, days] of Object.entries(attendanceMap || {})){
    let last = "-";
    for(let i = safeDateList.length - 1; i >= 0; i--){
      const rec = days?.[safeDateList[i]];
      if(rec?.status){ last = rec.status; break; }
    }
    const display = rolesMap?.[uid]?.displayName || rolesMap?.[uid]?.username || uid;
    perUser.push(`• ${display}: ${last}`);
    for(const di of safeDateList){
      const st = days?.[di]?.status;
      if(totals[st] != null) totals[st]++;
    }
  }
  const range = `${safeDateList[0]} s/d ${safeDateList[safeDateList.length-1]}`;
  return [
    `Laporan Absensi ${safeDateList.length === 1 ? "Harian" : safeDateList.length === 7 ? "Mingguan" : "Bulanan"}`,
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
    perUser.join("\n") || "-",
  ].join("\n");
}

export function $(id){ return document.getElementById(id); }

export function toastFactory(){
  const el = $("toast");
  return (msg, ms=2600)=>{
    if(!el) return;
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(()=>el.classList.remove("show"), ms);
  };
}

export function escapeHtml(s){
  return (s ?? "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

export function formatDateISO(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${dd}`;
}

export function parseISO(iso){
  const [y,m,d]=iso.split("-").map(Number);
  return new Date(y,m-1,d);
}

export function enumerateDays(startISO, endISO){
  const start = parseISO(startISO);
  const end = parseISO(endISO);
  const out=[];
  const d = new Date(start.getTime());
  while(d<=end){
    out.push(formatDateISO(d));
    d.setDate(d.getDate()+1);
  }
  return out;
}

export function normalizeWaNumber(input){
  return (input||"").toString().trim().replace(/\s+/g,"").replace(/^\+/,"");
}

export function uidKey(str){
  // key aman untuk HTML attrs
  return (str||"").toString().replaceAll(/[^a-zA-Z0-9_-]/g,"_");
}

export function openWA(waNumber, text){
  const n = normalizeWaNumber(waNumber);
  if(!n) throw new Error("WA number kosong.");
  const url = `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

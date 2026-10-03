const items=[
["dashboard","Dashboard"],["gereja","Profil Gereja"],["layout","Kelola Layout"],["banner","Banner & QRIS"],["doa","Doa Kristen"],["jadwal","Jadwal Ibadah"],["ministri","Ministri"],["dokumentasi","Dokumentasi Foto"],["arsip","Arsip Foto Jemaat"],["kontak","Kontak & Header"],["pengaturan","Pengaturan"]
];
const nav=document.getElementById("nav"),content=document.getElementById("content"),title=document.getElementById("pageTitle");
const schedules=[
["Ibadah Minggu","Minggu","09:00"],["Ibadah Minggu","Minggu","19:00"],["Sekolah Minggu & Remaja","Minggu","09:00"],["Rabu Gembira","Rabu","17:00"],["Pemuda","Senin","19:00"],["Lingpel","Selasa","19:00"],["Lansia","Minggu","Setelah ibadah"],["PKB & WKI","Minggu ke-2",""],["USBUH","Jumat","19:00"]
];
function dashboard(){
content.innerHTML='<div class="cards"><div class="card"><h3>Profil Gereja</h3><p>Informasi GMIH Ebenhaezer Ternate.</p></div><div class="card"><h3>Jadwal Ibadah</h3><p>Editor jadwal dan jam ibadah disiapkan sebagai modul utama.</p></div><div class="card"><h3>Arsip Foto Jemaat</h3><p>Arsip foto akan memiliki kategori, status dan urutan.</p></div></div><div class="notice"><strong>GitHub adalah sumber utama</strong><br><span class="muted">Back Office sedang dibangun ulang secara mandiri dari Floot.</span></div>';
}
function schedule(){
content.innerHTML='<div class="card"><h3>Jadwal Ibadah</h3><p class="muted">Jadwal awal GMIH Ebenhaezer Ternate</p><div class="list">'+schedules.map((s,i)=>'<div class="row"><strong>'+s[0]+'</strong><span>'+s[1]+' • '+s[2]+'</span><button class="edit" onclick="editSchedule('+i+')">Edit</button></div>').join("")+'</div></div>';
}
function editSchedule(i){const s=schedules[i];const n=prompt("Nama ibadah:",s[0]);if(n===null)return;const d=prompt("Hari:",s[1]);if(d===null)return;const t=prompt("Jam ibadah:",s[2]);if(t===null)return;schedules[i]=[n,d,t];schedule();}
function show(id){const item=items.find(x=>x[0]===id);title.textContent=item?item[1]:"Back Office";nav.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.id===id));if(id==="dashboard")dashboard();else if(id==="jadwal")schedule();else content.innerHTML='<div class="card"><h3>'+item[1]+'</h3><p>Modul GitHub sedang dikembangkan.</p></div>';}
nav.innerHTML=items.map((x,i)=>'<button class="navitem '+(i===0?"active":"")+'" data-id="'+x[0]+'">'+x[1]+"</button>").join("");
nav.querySelectorAll("button").forEach(b=>b.onclick=()=>show(b.dataset.id));
show("dashboard");
const items=[
["dashboard","Dashboard"],["gereja","Profil Gereja"],["layout","Kelola Layout"],["banner","Banner & QRIS"],["doa","Doa Kristen"],["jadwal","Jadwal Ibadah"],["ministri","Ministri"],["dokumentasi","Dokumentasi Foto"],["arsip","Arsip Foto Jemaat"],["kontak","Kontak & Header"],["pengaturan","Pengaturan"]
];
const nav=document.getElementById("nav"),content=document.getElementById("content"),title=document.getElementById("pageTitle");
const seedSchedules=[
{id:1,name:"Ibadah Minggu",day:"Minggu",time:"09:00",note:"Ibadah umum",active:true},
{id:2,name:"Ibadah Minggu",day:"Minggu",time:"19:00",note:"Ibadah malam",active:true},
{id:3,name:"Sekolah Minggu & Remaja",day:"Minggu",time:"09:00",note:"Anak & remaja",active:true},
{id:4,name:"Rabu Gembira",day:"Rabu",time:"17:00",note:"Persekutuan",active:true},
{id:5,name:"Pemuda",day:"Senin",time:"19:00",note:"Persekutuan pemuda",active:true},
{id:6,name:"Lingpel",day:"Selasa",time:"19:00",note:"Lingkungan pelayanan",active:true},
{id:7,name:"Lansia",day:"Minggu",time:"Setelah ibadah",note:"Pelayanan lansia",active:true},
{id:8,name:"PKB & WKI",day:"Minggu ke-2",time:"",note:"Persekutuan bulanan",active:true},
{id:9,name:"USBUH",day:"Jumat",time:"19:00",note:"Ibadah USBUH",active:true}
];
let schedules=load("ebenhaezer_schedules",seedSchedules);
function load(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return Array.isArray(v)?v:fallback}catch(e){return fallback}}
function save(key,value){localStorage.setItem(key,JSON.stringify(value))}
function dashboard(){
content.innerHTML='<div class="cards"><div class="card"><h3>Profil Gereja</h3><p>Informasi GMIH Ebenhaezer Ternate.</p></div><div class="card"><h3>Jadwal Ibadah</h3><p>'+schedules.filter(x=>x.active).length+' jadwal aktif.</p></div><div class="card"><h3>Arsip Foto Jemaat</h3><p>Kelola arsip berdasarkan kategori, judul, status dan urutan.</p></div></div><div class="notice"><strong>GitHub adalah sumber utama</strong><br><span class="muted">Back Office sedang dibangun ulang dari Floot tanpa menghapus daftar fitur yang sudah ditetapkan.</span></div>';
}
function schedule(){
content.innerHTML='<div class="card"><div class="section-head"><div><h3>Jadwal Ibadah</h3><p class="muted">Tambah, edit, aktifkan/nonaktifkan, dan hapus jadwal.</p></div><button class="primary" onclick="newSchedule()">+ Tambah Jadwal</button></div><div class="list">'+schedules.map((s,i)=>'<div class="row"><div><strong>'+esc(s.name)+'</strong><br><span>'+esc(s.day)+' • '+esc(s.time||"Jam belum diatur")+' • '+esc(s.note||"")+'</span></div><span class="status '+(s.active?"on":"off")+'">'+(s.active?"Aktif":"Nonaktif")+'</span><button class="edit" onclick="editSchedule('+i+')">Edit</button><button class="danger" onclick="deleteSchedule('+i+')">Hapus</button></div>').join("")+'</div></div>';
}
function formSchedule(s,index){
content.innerHTML='<div class="card form"><h3>'+(index>=0?"Edit Jadwal Ibadah":"Tambah Jadwal Ibadah")+'</h3><label>Nama ibadah<input id="fName" value="'+escAttr(s.name)+'"></label><label>Hari<input id="fDay" value="'+escAttr(s.day)+'"></label><label>Jam ibadah<input id="fTime" placeholder="Contoh 09:00" value="'+escAttr(s.time)+'"></label><label>Keterangan<input id="fNote" value="'+escAttr(s.note||"")+'"></label><label class="check"><input id="fActive" type="checkbox" '+(s.active?"checked":"")+'> Jadwal aktif</label><div class="actions"><button class="primary" onclick="saveSchedule('+(index>=0?index:"-1")+')">Simpan</button><button onclick="schedule()">Batal</button></div></div>';
}
function newSchedule(){formSchedule({name:"",day:"",time:"",note:"",active:true},-1)}
function editSchedule(i){formSchedule(schedules[i],i)}
function saveSchedule(i){
const item={id:i>=0?schedules[i].id:Date.now(),name:document.getElementById("fName").value.trim(),day:document.getElementById("fDay").value.trim(),time:document.getElementById("fTime").value.trim(),note:document.getElementById("fNote").value.trim(),active:document.getElementById("fActive").checked};
if(!item.name||!item.day){alert("Nama ibadah dan hari wajib diisi.");return}
if(i>=0)schedules[i]=item;else schedules.push(item);save("ebenhaezer_schedules",schedules);schedule();
}
function deleteSchedule(i){if(!confirm("Hapus jadwal ini?"))return;schedules.splice(i,1);save("ebenhaezer_schedules",schedules);schedule()}
function photos(){
let photos=load("ebenhaezer_photos",[]);
content.innerHTML='<div class="card"><div class="section-head"><div><h3>Arsip Foto Jemaat</h3><p class="muted">Modul arsip foto siap menerima kategori, judul, status dan urutan.</p></div><button class="primary" onclick="addPhoto()">+ Tambah Foto</button></div><p>'+photos.length+' arsip tersimpan di browser ini.</p></div>';
}
function addPhoto(){const title=prompt("Judul foto:");if(!title)return;const category=prompt("Kategori:","Jemaat")||"Jemaat";const photos=load("ebenhaezer_photos",[]);photos.push({id:Date.now(),title,category,active:true,src:""});save("ebenhaezer_photos",photos);photos()}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function escAttr(v){return esc(v).replace(/"/g,"&quot;")}
function show(id){const item=items.find(x=>x[0]===id);title.textContent=item?item[1]:"Back Office";nav.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.id===id));if(id==="dashboard")dashboard();else if(id==="jadwal")schedule();else if(id==="dokumentasi"||id==="arsip")photos();else content.innerHTML='<div class="card"><h3>'+item[1]+'</h3><p>Modul GitHub sedang dikembangkan.</p></div>'}
nav.innerHTML=items.map((x,i)=>'<button class="navitem '+(i===0?"active":"")+'" data-id="'+x[0]+'">'+x[1]+"</button>").join("");
nav.querySelectorAll("button").forEach(b=>b.onclick=()=>show(b.dataset.id));
show("dashboard");
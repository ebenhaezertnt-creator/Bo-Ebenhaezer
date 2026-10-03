const items=[["dashboard","Dashboard"],["gereja","Profil Gereja"],["layout","Kelola Layout"],["banner","Banner & QRIS"],["doa","Doa Kristen"],["jadwal","Jadwal Ibadah"],["ministri","Ministri"],["dokumentasi","Dokumentasi Foto"],["arsip","Arsip Foto Jemaat"],["kontak","Kontak & Header"],["pengaturan","Pengaturan"]];
const nav=document.getElementById("nav"),content=document.getElementById("content"),title=document.getElementById("pageTitle");
const seedSchedules=[["Ibadah Minggu","Minggu","09:00","Ibadah umum"],["Ibadah Minggu","Minggu","19:00","Ibadah malam"],["Sekolah Minggu & Remaja","Minggu","09:00","Anak & remaja"],["Rabu Gembira","Rabu","17:00","Persekutuan"],["Pemuda","Senin","19:00","Persekutuan pemuda"],["Lingpel","Selasa","19:00","Lingkungan pelayanan"],["Lansia","Minggu","Setelah ibadah","Pelayanan lansia"],["PKB & WKI","Minggu ke-2","","Persekutuan bulanan"],["USBUH","Jumat","19:00","Ibadah USBUH"]].map((x,i)=>({id:i+1,name:x[0],day:x[1],time:x[2],note:x[3],active:true}));
function load(k,f){try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch(e){return f}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
let schedules=load("ebenhaezer_schedules",seedSchedules);
const defaults={
gereja:{title:"GMIH Ebenhaezer Ternate",body:"Jl. Mononutu, Kelurahan Tanah Raja, Kecamatan Ternate Tengah, Kota Ternate, Maluku Utara\nMenjadi Gereja yang utuh mandiri dan missioner",status:"published"},
doa:{title:"Doa Kristen",body:"Doa Bapa Kami\nBapa kami yang di sorga, dimuliakanlah nama-Mu. Datanglah Kerajaan-Mu, jadilah kehendak-Mu di bumi seperti di sorga.",status:"published"},
ministri:{title:"Ministri",body:"Pelayanan ibadah minggu dan pelayanan jemaat GMIH Ebenhaezer Ternate.",status:"published"},
kontak:{title:"Kontak & Header",body:"GMIH Ebenhaezer Ternate\nJl. Mononutu, Tanah Raja, Ternate Tengah, Maluku Utara",status:"published"},
pengaturan:{title:"Pengaturan",body:"Pengaturan Back Office GMIH Ebenhaezer Ternate.",status:"draft"}
};
function dashboard(){const photos=load("ebenhaezer_photos",[]);content.innerHTML='<div class="cards"><div class="card"><h3>Profil Gereja</h3><p>GMIH Ebenhaezer Ternate</p></div><div class="card"><h3>Jadwal Aktif</h3><p>'+schedules.filter(x=>x.active).length+' jadwal ibadah aktif</p></div><div class="card"><h3>Dokumentasi</h3><p>'+photos.length+' arsip foto tersimpan</p></div></div><div class="notice"><strong>GitHub adalah sumber utama.</strong><br><span class="muted">Fitur Back Office sedang dipindahkan menjadi aplikasi mandiri. Floot tidak menjadi sumber baru.</span></div>'}
function generic(id){const d=load("ebenhaezer_content_"+id,defaults[id]||{title:items.find(x=>x[0]===id)?.[1]||"",body:"",status:"draft"});content.innerHTML='<div class="card form"><h3>'+items.find(x=>x[0]===id)[1]+'</h3><label>Judul<input id="gTitle" value="'+escAttr(d.title)+'"></label><label>Isi / informasi<textarea id="gBody" rows="9">'+esc(d.body)+'</textarea></label><label>Status<select id="gStatus"><option '+(d.status==="draft"?"selected":"")+' value="draft">Draft</option><option '+(d.status==="published"?"selected":"")+' value="published">Published</option></select></label><div class="actions"><button class="primary" onclick="saveGeneric(\''+id+'\')">Simpan</button></div></div>'}
function saveGeneric(id){save("ebenhaezer_content_"+id,{title:document.getElementById("gTitle").value.trim(),body:document.getElementById("gBody").value.trim(),status:document.getElementById("gStatus").value,updatedAt:new Date().toISOString()});alert("Perubahan tersimpan.");generic(id)}
function layout(){const key="ebenhaezer_layout_items";let rows=load(key,[["Banner Gereja",true],["QRIS",true],["Profil Gereja",true],["Jadwal Ibadah",true],["Ministri",true],["Dokumentasi Foto",true],["Kontak & Header",true]]);content.innerHTML='<div class="card"><h3>Kelola Layout</h3><p class="muted">Atur bagian yang tampil pada situs.</p><div class="list">'+rows.map((x,i)=>'<div class="row"><strong>'+esc(x[0])+'</strong><label class="check"><input type="checkbox" '+(x[1]?"checked":"")+' onchange="toggleLayout('+i+',this.checked)"> Tampil</label><button onclick="moveLayout('+i+',-1)">↑</button><button onclick="moveLayout('+i+',1)">↓</button></div>').join("")+'</div><div class="actions"><button class="primary" onclick="save(\''+key+'\',load(\''+key+'\',rows));alert(\'Layout tersimpan.\')">Simpan Layout</button></div></div>'}
function toggleLayout(i,v){let a=load("ebenhaezer_layout_items",[]);if(a[i])a[i][1]=v;save("ebenhaezer_layout_items",a)}
function moveLayout(i,d){let a=load("ebenhaezer_layout_items",[]),j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];save("ebenhaezer_layout_items",a);layout()}
function banner(){const d=load("ebenhaezer_banner",{title:"GMIH Ebenhaezer Ternate",src:"",qris:""});content.innerHTML='<div class="card form"><h3>Banner & QRIS</h3><label>Judul banner<input id="bTitle" value="'+escAttr(d.title)+'"></label><label>URL gambar banner<input id="bSrc" placeholder="https://..." value="'+escAttr(d.src)+'"></label><label>URL gambar QRIS<input id="bQris" placeholder="https://..." value="'+escAttr(d.qris)+'"></label><p class="muted">Untuk sekarang URL aset disimpan sebagai konfigurasi. Upload media permanen akan diarahkan ke media backend gereja.</p><button class="primary" onclick="saveBanner()">Simpan Banner & QRIS</button></div>'}
function saveBanner(){save("ebenhaezer_banner",{title:document.getElementById("bTitle").value.trim(),src:document.getElementById("bSrc").value.trim(),qris:document.getElementById("bQris").value.trim()});alert("Banner & QRIS tersimpan.");banner()}
function schedule(){content.innerHTML='<div class="card"><div class="section-head"><div><h3>Jadwal Ibadah</h3><p class="muted">Edit jam ibadah langsung dari Back Office.</p></div><button class="primary" onclick="scheduleForm(-1)">+ Tambah Jadwal</button></div><div class="list">'+schedules.map((s,i)=>'<div class="row"><div><strong>'+esc(s.name)+'</strong><br><span>'+esc(s.day)+' • '+esc(s.time||"Jam belum diatur")+' • '+esc(s.note)+'</span></div><span class="status '+(s.active?"on":"off")+'">'+(s.active?"Aktif":"Nonaktif")+'</span><button onclick="scheduleForm('+i+')">Edit</button><button class="danger" onclick="deleteSchedule('+i+')">Hapus</button></div>').join("")+'</div></div>'}
function scheduleForm(i){const s=i>=0?schedules[i]:{name:"",day:"",time:"",note:"",active:true};content.innerHTML='<div class="card form"><h3>'+(i>=0?"Edit":"Tambah")+' Jadwal Ibadah</h3><label>Nama ibadah<input id="sName" value="'+escAttr(s.name)+'"></label><label>Hari<input id="sDay" value="'+escAttr(s.day)+'"></label><label>Jam ibadah<input id="sTime" value="'+escAttr(s.time)+'" placeholder="09:00"></label><label>Keterangan<input id="sNote" value="'+escAttr(s.note)+'"></label><label class="check"><input id="sActive" type="checkbox" '+(s.active?"checked":"")+'> Aktif</label><div class="actions"><button class="primary" onclick="saveSchedule('+i+')">Simpan</button><button onclick="schedule()">Batal</button></div></div>'}
function saveSchedule(i){const x={id:i>=0?schedules[i].id:Date.now(),name:sName.value.trim(),day:sDay.value.trim(),time:sTime.value.trim(),note:sNote.value.trim(),active:sActive.checked};if(!x.name||!x.day){alert("Nama dan hari wajib diisi.");return}if(i>=0)schedules[i]=x;else schedules.push(x);save("ebenhaezer_schedules",schedules);schedule()}
function deleteSchedule(i){if(confirm("Hapus jadwal ini?")){schedules.splice(i,1);save("ebenhaezer_schedules",schedules);schedule()}}
async function syncRemotePhotos(){
  try{
    const r=await fetch("https://ebenhaezer-media.ebenhaezertnt.workers.dev/photos");
    if(!r.ok)return null;
    const data=await r.json();
    const list=Array.isArray(data)?data:(data.photos||[]);
    if(!list.length)return null;
    const normalized=list.map((p,i)=>({id:p.id??Date.now()+i,title:p.title||"Dokumentasi Jemaat",category:p.category||"Jemaat",src:p.src||"",active:p.active!==false,sort_order:p.sort_order??i}));
    save("ebenhaezer_photos",normalized);
    return normalized;
  }catch(e){return null}
}
async function photos(){
  const a=load("ebenhaezer_photos",[]);
  content.innerHTML='<div class="card"><div class="section-head"><div><h3>Dokumentasi Foto / Arsip Foto Jemaat</h3><p class="muted">Arsip foto lokal dan sinkronisasi media gereja.</p></div><div><button class="primary" onclick="photoForm(-1)">+ Tambah Foto</button> <button onclick="refreshPhotos()">↻ Sinkronkan</button></div></div><div id="photoList"></div></div>';
  renderPhotos(a);
  await refreshPhotos(false);
}
function renderPhotos(a){
  const box=document.getElementById("photoList");
  if(!box)return;
  box.innerHTML=a.length?'<div class="list">'+a.map((p,i)=>'<div class="row"><div><strong>'+esc(p.title)+'</strong><br><span>'+esc(p.category||"Jemaat")+'</span></div><span class="status '+(p.active?"on":"off")+'">'+(p.active?"Aktif":"Nonaktif")+'</span><button onclick="photoForm('+i+')">Edit</button><button class="danger" onclick="deletePhoto('+i+')">Hapus</button></div>').join("")+'</div>':'<p class="muted">Belum ada arsip foto.</p>';
}
async function refreshPhotos(showMessage=true){
  const remote=await syncRemotePhotos();
  if(remote){renderPhotos(remote);if(showMessage)alert("Arsip foto berhasil disinkronkan dari media gereja.")}
  else if(showMessage)alert("Media backend belum dapat dihubungi. Data lokal tetap digunakan.");
}
function photoForm(i){const a=load("ebenhaezer_photos",[]),p=i>=0?a[i]:{title:"",category:"Jemaat",active:true,src:""};content.innerHTML='<div class="card form"><h3>'+(i>=0?"Edit":"Tambah")+' Foto</h3><label>Judul<input id="pTitle" value="'+escAttr(p.title)+'"></label><label>Kategori<input id="pCat" value="'+escAttr(p.category||"Jemaat")+'"></label><label>URL gambar<input id="pSrc" value="'+escAttr(p.src||"")+'" placeholder="https://..."></label><label class="check"><input id="pActive" type="checkbox" '+(p.active?"checked":"")+'> Tampilkan</label><div class="actions"><button class="primary" onclick="savePhoto('+i+')">Simpan</button><button onclick="photos()">Batal</button></div></div>'}
function savePhoto(i){const a=load("ebenhaezer_photos",[]),x={id:i>=0?a[i].id:Date.now(),title:pTitle.value.trim(),category:pCat.value.trim()||"Jemaat",src:pSrc.value.trim(),active:pActive.checked};if(!x.title){alert("Judul wajib diisi.");return}if(i>=0)a[i]=x;else a.push(x);save("ebenhaezer_photos",a);photos()}
function deletePhoto(i){const a=load("ebenhaezer_photos",[]);if(confirm("Hapus foto ini?")){a.splice(i,1);save("ebenhaezer_photos",a);photos()}}
function show(id){const it=items.find(x=>x[0]===id);title.textContent=it?.[1]||"Back Office";nav.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.id===id));if(id==="dashboard")dashboard();else if(id==="jadwal")schedule();else if(id==="layout")layout();else if(id==="banner")banner();else if(id==="dokumentasi"||id==="arsip")photos();else if(defaults[id])generic(id);else generic(id)}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function escAttr(v){return esc(v).replace(/"/g,"&quot;")}
nav.innerHTML=items.map((x,i)=>'<button class="navitem '+(i===0?"active":"")+'" data-id="'+x[0]+'">'+x[1]+'</button>').join("");
nav.querySelectorAll("button").forEach(b=>b.onclick=()=>show(b.dataset.id));show("dashboard");
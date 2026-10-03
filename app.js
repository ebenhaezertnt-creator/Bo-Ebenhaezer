const API_BASE="https://ebenhaezer-backoffice.ebenhaezertnt.workers.dev";
let adminToken=localStorage.getItem("eb_bo_token")||"";
async function api(path,opts={}){
  const headers={...(opts.headers||{}),...(adminToken?{Authorization:"Bearer "+adminToken}:{})};
  if(opts.body&&typeof opts.body!=="string"){headers["Content-Type"]="application/json";opts={...opts,body:JSON.stringify(opts.body)}}
  const r=await fetch(API_BASE+path,{...opts,headers});
  let d={};try{d=await r.json()}catch(e){}
  if(!r.ok)throw new Error(d.error||"Backend gagal");
  return d;
}
async function initAuth(){
 const gate=document.getElementById("authGate"),shell=document.getElementById("appShell"),note=document.getElementById("authNote"),msg=document.getElementById("authMsg"),p2=document.getElementById("adminPassword2");
 try{
  const s=await (await fetch(API_BASE+"/api/status")).json();
  note.innerHTML=s.hasAdmin?"Masuk dengan akun admin <b>Gmih</b>.":"Pertama kali: buat password admin <b>Gmih</b>.";
  if(!s.hasAdmin)p2.style.display="block";
  document.getElementById("adminLogin").onclick=async()=>{
   const p=document.getElementById("adminPassword").value;
   if(p.length<8){msg.textContent="Password minimal 8 karakter.";return}
   if(!s.hasAdmin&&p!==p2.value){msg.textContent="Password tidak sama.";return}
   try{
    const d=await api(s.hasAdmin?"/api/login":"/api/setup",{method:"POST",body:s.hasAdmin?{username:"Gmih",password:p}:{password:p}});
    adminToken=d.token;localStorage.setItem("eb_bo_token",adminToken);
    gate.style.display="none";shell.style.display="flex";await hydrateRemote();initAuth();
   }catch(e){msg.textContent=e.message}
  };
  if(adminToken){try{await api("/api/schedules");gate.style.display="none";shell.style.display="flex";await hydrateRemote();show("dashboard");return}catch(e){localStorage.removeItem("eb_bo_token");adminToken=""}}
 }catch(e){note.textContent="Backend belum dapat dihubungi.";msg.textContent=e.message}
}
async function hydrateRemote(){
 try{const d=await api("/api/schedules");if(d.items?.length){schedules=d.items.map(x=>({id:x.id,name:x.name,day:x.day||"",time:x.time||"",note:x.description||"",active:!!x.active}));save("ebenhaezer_schedules",schedules)}}catch(e){}
 try{const d=await api("/api/banners");if(d.items?.length)save("ebenhaezer_banners",d.items.map(x=>({...x,active:!!x.active})))}catch(e){}
 try{const d=await api("/api/latest");if(d.item)save("ebenhaezer_latest_activity",{title:d.item.title||"",src:d.item.src||"",active:!!d.item.active,updatedAt:d.item.updated_at})}catch(e){}
 try{const d=await api("/api/layout");if(d.items?.length)save("ebenhaezer_layout_items",d.items.sort((a,b)=>a.position-b.position).map(x=>[x.name,!!x.visible]))}catch(e){}
 for(const id of ["gereja","doa","ministri","kontak","pengaturan"]){try{const d=await api("/api/content/"+id);if(d.item)save("ebenhaezer_content_"+id,{title:d.item.title||"",body:d.item.body||"",status:d.item.status||"draft",updatedAt:d.item.updated_at})}catch(e){}}
}
const items=[["dashboard","Dashboard"],["gereja","Profil Gereja"],["layout","Konfigurasi Layout"],["media","Media & Semua Foto"],["banner","Banner & QRIS"],["doa","Doa Kristen"],["jadwal","Jadwal Ibadah"],["ministri","Ministri"],["dokumentasi","Dokumentasi Foto"],["arsip","Arsip Foto Jemaat"],["kontak","Kontak & Header"],["pengaturan","Pengaturan"]];
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
async function saveGeneric(id){const d={title:document.getElementById("gTitle").value.trim(),body:document.getElementById("gBody").value.trim(),status:document.getElementById("gStatus").value,updatedAt:new Date().toISOString()};save("ebenhaezer_content_"+id,d);try{await api("/api/content/"+id,{method:"PUT",body:d});alert("Perubahan tersimpan ke server.");generic(id)}catch(e){alert("Tersimpan lokal, backend gagal: "+e.message)}}
function layout(){const key="ebenhaezer_layout_items";let rows=load(key,[["Banner Utama",true],["QRIS",true],["Profil Gereja",true],["Kegiatan Terbaru",true],["Ayat Hafalan Otomatis",true],["Renungan Otomatis",true],["Jadwal Ibadah",true],["Ministri",true],["Dokumentasi Foto",true],["Kontak & Header",true]]);content.innerHTML='<div class="card"><h3>Kelola Layout</h3><p class="muted">Atur bagian yang tampil pada situs.</p><div class="list">'+rows.map((x,i)=>'<div class="row"><strong>'+esc(x[0])+'</strong><label class="check"><input type="checkbox" '+(x[1]?"checked":"")+' onchange="toggleLayout('+i+',this.checked)"> Tampil</label><button onclick="moveLayout('+i+',-1)">↑</button><button onclick="moveLayout('+i+',1)">↓</button></div>').join("")+'</div><div class="actions"><button class="primary" onclick="save(\''+key+'\',load(\''+key+'\',rows));alert(\'Layout tersimpan.\')">Simpan Layout</button></div></div>'}
function toggleLayout(i,v){let a=load("ebenhaezer_layout_items",[]);if(a[i])a[i][1]=v;save("ebenhaezer_layout_items",a)}
function moveLayout(i,d){let a=load("ebenhaezer_layout_items",[]),j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];save("ebenhaezer_layout_items",a);layout()}
function banner(){const a=load("ebenhaezer_banners",[{id:"hero",name:"Banner Utama",title:"GMIH Ebenhaezer Ternate",src:"",active:true},{id:"secondary",name:"Banner Sekunder",title:"",src:"",active:true},{id:"footer",name:"Banner Bawah",title:"",src:"",active:true}]);const q=load("ebenhaezer_banner",{qris:""});content.innerHTML='<div class="card"><div class="section-head"><div><h3>Semua Banner</h3><p class="muted">Setiap banner dapat diganti gambar, judul, dan status.</p></div><button class="primary" onclick="bannerForm(-1)">+ Tambah Banner</button></div><div class="list">'+a.map((b,i)=>'<div class="row"><div><strong>'+esc(b.name)+'</strong><br><span>'+esc(b.title||"Tanpa judul")+'</span></div><span class="status '+(b.active?"on":"off")+'">'+(b.active?"Aktif":"Nonaktif")+'</span><button onclick="bannerForm('+i+')">Edit</button><button class="danger" onclick="deleteBanner('+i+')">Hapus</button></div>').join("")+'</div></div><div class="card form"><h3>QRIS</h3><label>URL gambar QRIS<input id="qrisSrc" value="'+escAttr(q.qris||"")+'" placeholder="https://..."></label><div class="actions"><button class="primary" onclick="saveQris()">Simpan QRIS</button></div></div>'}
function saveBanner(){const d={title:document.getElementById("bTitle").value.trim(),src:document.getElementById("bSrc").value.trim(),qris:document.getElementById("bQris").value.trim()};save("ebenhaezer_banner",d);alert("Banner & QRIS tersimpan.");banner()}
function bannerForm(i){const a=load("ebenhaezer_banners",[{id:"hero",name:"Banner Utama",title:"",src:"",active:true}]),b=i>=0?a[i]:{id:"banner_"+Date.now(),name:"Banner Baru",title:"",src:"",active:true};content.innerHTML='<div class="card form"><h3>'+(i>=0?"Edit":"Tambah")+' Banner</h3><label>Nama banner<input id="bnName" value="'+escAttr(b.name)+'"></label><label>Judul/banner text<input id="bnTitle" value="'+escAttr(b.title||"")+'"></label><label>URL gambar<input id="bnSrc" value="'+escAttr(b.src||"")+'" placeholder="https://..."></label><label class="check"><input id="bnActive" type="checkbox" '+(b.active?"checked":"")+'> Tampilkan</label><div class="actions"><button class="primary" onclick="saveBannerItem('+i+')">Simpan</button><button onclick="banner()">Batal</button></div></div>'}
async function saveBannerItem(i){const a=load("ebenhaezer_banners",[]),x={id:i>=0?a[i].id:"",name:bnName.value.trim()||"Banner",title:bnTitle.value.trim(),src:bnSrc.value.trim(),active:bnActive.checked};try{const d=i>=0?await api("/api/banners/"+x.id,{method:"PUT",body:x}):await api("/api/banners",{method:"POST",body:x});if(i<0)x.id=d.id;if(i>=0)a[i]=x;else a.push(x);save("ebenhaezer_banners",a);banner()}catch(e){alert("Banner gagal disimpan ke server: "+e.message)}}
async function deleteBanner(i){const a=load("ebenhaezer_banners",[]);if(a.length<=1){alert("Minimal satu banner harus tersedia.");return}if(confirm("Hapus banner ini?")){try{await api("/api/banners/"+a[i].id,{method:"DELETE"});a.splice(i,1);save("ebenhaezer_banners",a);banner()}catch(e){alert("Backend gagal menghapus banner: "+e.message)}}}
function saveQris(){const d={title:"QRIS",body:qrisSrc.value.trim(),status:"published"};save("ebenhaezer_banner",{qris:d.body});try{await api("/api/content/qris",{method:"PUT",body:d});alert("QRIS tersimpan ke server.")}catch(e){alert("QRIS tersimpan lokal, backend gagal: "+e.message)}banner()}
function schedule(){content.innerHTML='<div class="card"><div class="section-head"><div><h3>Jadwal Ibadah</h3><p class="muted">Edit jam ibadah langsung dari Back Office.</p></div><button class="primary" onclick="scheduleForm(-1)">+ Tambah Jadwal</button></div><div class="list">'+schedules.map((s,i)=>'<div class="row"><div><strong>'+esc(s.name)+'</strong><br><span>'+esc(s.day)+' • '+esc(s.time||"Jam belum diatur")+' • '+esc(s.note)+'</span></div><span class="status '+(s.active?"on":"off")+'">'+(s.active?"Aktif":"Nonaktif")+'</span><button onclick="scheduleForm('+i+')">Edit</button><button class="danger" onclick="deleteSchedule('+i+')">Hapus</button></div>').join("")+'</div></div>'}
function scheduleForm(i){const s=i>=0?schedules[i]:{name:"",day:"",time:"",note:"",active:true};content.innerHTML='<div class="card form"><h3>'+(i>=0?"Edit":"Tambah")+' Jadwal Ibadah</h3><label>Nama ibadah<input id="sName" value="'+escAttr(s.name)+'"></label><label>Hari<input id="sDay" value="'+escAttr(s.day)+'"></label><label>Jam ibadah<input id="sTime" value="'+escAttr(s.time)+'" placeholder="09:00"></label><label>Keterangan<input id="sNote" value="'+escAttr(s.note)+'"></label><label class="check"><input id="sActive" type="checkbox" '+(s.active?"checked":"")+'> Aktif</label><div class="actions"><button class="primary" onclick="saveSchedule('+i+')">Simpan</button><button onclick="schedule()">Batal</button></div></div>'}
async function saveSchedule(i){const x={id:i>=0?schedules[i].id:Date.now(),name:sName.value.trim(),day:sDay.value.trim(),time:sTime.value.trim(),note:sNote.value.trim(),active:sActive.checked};if(!x.name||!x.day){alert("Nama dan hari wajib diisi.");return}try{const d=i>=0?await api("/api/schedules/"+x.id,{method:"PUT",body:{name:x.name,day:x.day,time:x.time,description:x.note,active:x.active?1:0}}):await api("/api/schedules",{method:"POST",body:{name:x.name,day:x.day,time:x.time,description:x.note,active:x.active?1:0}});if(i<0)x.id=d.id;if(i>=0)schedules[i]=x;else schedules.push(x);save("ebenhaezer_schedules",schedules);schedule()}catch(e){alert("Jadwal gagal disimpan ke server: "+e.message)}}
async function deleteSchedule(i){if(confirm("Hapus jadwal ini?")){try{await api("/api/schedules/"+schedules[i].id,{method:"DELETE"});schedules.splice(i,1);save("ebenhaezer_schedules",schedules);schedule()}catch(e){alert("Backend gagal menghapus jadwal: "+e.message)}}}
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

function media(){const latest=load("ebenhaezer_latest_activity",{title:"",src:"",active:true});const a=load("ebenhaezer_photos",[]);content.innerHTML='<div class="card"><div class="section-head"><div><h3>⭐ Kegiatan Terbaru</h3><p class="muted">Satu space utama untuk 1 foto kegiatan terbaru.</p></div><button class="primary" onclick="latestForm()">Edit Foto Utama</button></div>'+(latest.src?'<img class="latest-preview" src="'+escAttr(latest.src)+'" alt="'+escAttr(latest.title)+'"><h3>'+esc(latest.title)+'</h3>':'<p class="muted">Belum ada foto kegiatan terbaru.</p>')+'</div><div class="card"><div class="section-head"><div><h3>Media & Semua Foto</h3><p class="muted">Semua foto/gambar dapat diedit.</p></div><button class="primary" onclick="photoForm(-1)">+ Tambah Foto</button></div><div id="mediaList"></div></div>';renderPhotos(a,"mediaList")}
function latestForm(){const p=load("ebenhaezer_latest_activity",{title:"",src:"",active:true});content.innerHTML='<div class="card form"><h3>Foto Kegiatan Terbaru</h3><label>Judul kegiatan<input id="laTitle" value="'+escAttr(p.title)+'"></label><label>URL gambar<input id="laSrc" value="'+escAttr(p.src)+'" placeholder="https://..."></label><label class="check"><input id="laActive" type="checkbox" '+(p.active!==false?"checked":"")+'> Tampilkan</label><div class="actions"><button class="primary" onclick="saveLatest()">Simpan</button><button onclick="media()">Batal</button></div></div>'}
async function saveLatest(){const d={title:laTitle.value.trim()||"Kegiatan Terbaru",src:laSrc.value.trim(),active:laActive.checked};save("ebenhaezer_latest_activity",{...d,updatedAt:new Date().toISOString()});try{await api("/api/latest",{method:"PUT",body:d});alert("Foto kegiatan terbaru tersimpan ke server.")}catch(e){alert("Tersimpan lokal, backend gagal: "+e.message)}media()}
function show(id){const it=items.find(x=>x[0]===id);title.textContent=it?.[1]||"Back Office";nav.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.id===id));if(id==="dashboard")dashboard();else if(id==="jadwal")schedule();else if(id==="layout")layout();else if(id==="banner")banner();else if(id==="media")media();else if(id==="dokumentasi"||id==="arsip")photos();else if(defaults[id])generic(id);else generic(id)}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function escAttr(v){return esc(v).replace(/"/g,"&quot;")}
nav.innerHTML=items.map((x,i)=>'<button class="navitem '+(i===0?"active":"")+'" data-id="'+x[0]+'">'+x[1]+'</button>').join("");
nav.querySelectorAll("button").forEach(b=>b.onclick=()=>show(b.dataset.id));show("dashboard");
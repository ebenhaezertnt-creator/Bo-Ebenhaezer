const SUPABASE_URL="https://kkisfurtvdmgvzkprznz.supabase.co";
const SUPABASE_KEY="sb_publishable_SnYsi_QvUWLEWEJx5vEmnQ_cTEK-tSM";
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const ADMIN_EMAIL="gmih@ebenhaezer.local";
const items=[
 ["dashboard","Dashboard"],["gereja","Profil Gereja"],["layout","Konfigurasi Layout"],
 ["banner","Banner & QRIS"],["media","Media Website"],["jadwal","Jadwal Ibadah"],["ministri","Ministri"],
 ["dokumentasi","Dokumentasi Foto"],["arsip","Arsip Foto Jemaat"],["kontak","Kontak & Header"],
 ["harian","Ayat & Renungan"],["pengaturan","Pengaturan"]
];
const seedSchedules=[
 ["Ibadah Minggu","Minggu","09:00","Ibadah umum"],["Ibadah Minggu","Minggu","19:00","Ibadah malam"],
 ["Sekolah Minggu & Remaja","Minggu","09:00","Anak & remaja"],["Rabu Gembira","Rabu","17:00","Persekutuan"],
 ["Pemuda","Senin","19:00","Persekutuan pemuda"],["Lingpel","Selasa","19:00","Lingkungan pelayanan"],
 ["Lansia","Minggu","Setelah ibadah","Pelayanan lansia"],["PKB & WKI","Minggu ke-2","","Persekutuan bulanan"],
 ["USBUH","Jumat","19:00","Ibadah USBUH"]
];
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const msg=t=>{const e=$("authMsg");if(e)e.textContent=t||""};
async function isAdmin(){const {data:{user}}=await sb.auth.getUser();if(!user)return false;const {data}=await sb.from("admin_users").select("user_id,role,display_name").eq("user_id",user.id).maybeSingle();return !!data}
async function login(){
 const u=$("adminUser").value.trim(),p=$("adminPassword").value;
 msg("");
 if(u!=="Gmih")return msg("Nama pengguna tidak benar. Gunakan: Gmih");
 if(!p)return msg("Masukkan password Back Office.");
 if(p.length<8)return msg("Password minimal 8 karakter.");
 $("adminLogin").disabled=true;$("adminLogin").textContent="Memeriksa…";
 try{
   const r=await sb.auth.signInWithPassword({email:ADMIN_EMAIL,password:p});
   if(r.error){
     const e=(r.error.message||"").toLowerCase();
     if(e.includes("invalid login credentials")||e.includes("invalid credentials")){
       msg("Login gagal. Password Gmih tidak cocok atau akun admin Gmih belum dibuat di Supabase. Tidak perlu pemeriksaan data admin untuk pesan ini.");
     }else if(e.includes("email not confirmed")){
       msg("Email akun admin belum dikonfirmasi. Konfirmasikan akun di Supabase, lalu coba masuk lagi.");
     }else if(e.includes("too many requests")){
       msg("Terlalu banyak percobaan login. Tunggu beberapa menit lalu coba lagi.");
     }else if(e.includes("network")||e.includes("fetch")){
       msg("Koneksi ke server login bermasalah. Periksa internet lalu coba lagi.");
     }else{
       msg("Login tidak dapat dilakukan: "+r.error.message);
     }
     return;
   }
   if(!r.data?.user){
     msg("Login belum menghasilkan sesi admin. Silakan coba lagi.");
     return;
   }
   const ok=await isAdmin();
   if(!ok){
     await sb.auth.signOut();
     msg("Akun berhasil masuk, tetapi belum terdaftar sebagai admin Back Office. Tambahkan akun ini ke daftar admin Supabase.");
     return;
   }
   $("authGate").style.display="none";$("appShell").style.display="flex";show("dashboard");
 }catch(e){
   msg("Terjadi masalah saat login. Periksa koneksi internet dan coba lagi.");
 }finally{
   $("adminLogin").disabled=false;
   $("adminLogin").textContent="Masuk Admin";
 }
}
async function init(){
 $("adminLogin").onclick=login;
 $("adminPassword").addEventListener("keydown",e=>{if(e.key==="Enter")login()});
 const {data:{session}}=await sb.auth.getSession();
 if(session&&await isAdmin()){$("authGate").style.display="none";$("appShell").style.display="flex";show("dashboard");}
 else {$("authNote").innerHTML="Login admin <b>Gmih</b>. Gunakan password akun admin yang sudah dibuat di Supabase."; $("adminLogin").textContent="Masuk Admin"}
}
async function rows(table,order="sort_order"){let q=sb.from(table).select("*");if(order)q=q.order(order,{ascending:true});const {data,error}=await q;if(error)throw error;return data||[]}
async function saveRow(table,id,obj){let r=id?await sb.from(table).update(obj).eq("id",id):await sb.from(table).insert(obj);if(r.error)throw r.error}
async function delRow(table,id){const r=await sb.from(table).delete().eq("id",id);if(r.error)throw r.error}
async function settings(){const {data,error}=await sb.from("church_settings").select("*").eq("id",1).single();if(error)throw error;return data}
function shell(title,body){$("pageTitle").textContent=title;$("content").innerHTML=body}
async function dashboard(){const [s,m,b,p,c,d]=await Promise.all([rows("worship_schedules"),rows("ministries"),rows("banners"),rows("photos"),rows("contacts"),rows("daily_content","content_date")]);shell("Dashboard",`<div class="cards"><div class="card"><h3>Profil Gereja</h3><p>GMIH Ebenhaezer Ternate</p></div><div class="card"><h3>Jadwal Aktif</h3><p>${s.filter(x=>x.active).length}</p></div><div class="card"><h3>Ministri</h3><p>${m.filter(x=>x.active).length}</p></div><div class="card"><h3>Foto</h3><p>${p.filter(x=>x.active).length}</p></div></div><div class="notice"><strong>Backend Supabase aktif.</strong><br><span class="muted">Website GitHub membaca data gereja dari database ini.</span></div>`)}
async function gereja(){const x=await settings();shell("Profil Gereja",`<div class="card form"><h3>Profil Gereja</h3><label>Nama Gereja<input id="gName" value="${esc(x.church_name)}"></label><label>Slogan<textarea id="gTag" rows="2">${esc(x.tagline||"")}</textarea></label><label>Alamat<textarea id="gAddr" rows="3">${esc(x.address||"")}</textarea></label><label>Telepon<input id="gPhone" value="${esc(x.phone||"")}"></label><label>Email<input id="gEmail" value="${esc(x.email||"")}"></label><label>Facebook<input id="gFb" value="${esc(x.facebook_url||"")}"></label><label>Instagram<input id="gIg" value="${esc(x.instagram_url||"")}"></label><label>YouTube<input id="gYt" value="${esc(x.youtube_url||"")}"></label><div class="actions"><button class="primary" onclick="saveGereja()">Simpan</button></div></div>`)}
async function saveGereja(){try{const r=await sb.from("church_settings").update({church_name:gName.value.trim(),tagline:gTag.value.trim(),address:gAddr.value.trim(),phone:gPhone.value.trim(),email:gEmail.value.trim(),facebook_url:gFb.value.trim(),instagram_url:gIg.value.trim(),youtube_url:gYt.value.trim(),updated_at:new Date().toISOString()}).eq("id",1);if(r.error)throw r.error;alert("Profil tersimpan.");gereja()}catch(e){alert(e.message)}}
async function layout(){const {data}=await sb.from("layout_settings").select("*").eq("id",1).single();shell("Konfigurasi Layout",`<div class="card form"><h3>Pengaturan Tampilan</h3><label class="check"><input id="lDesk" type="checkbox" ${data?.desktop_first?"checked":""}> Prioritas desktop</label><label class="check"><input id="lQris" type="checkbox" ${data?.show_qris?"checked":""}> Tampilkan QRIS</label><label class="check"><input id="lVerse" type="checkbox" ${data?.show_memory_verse?"checked":""}> Tampilkan Ayat Hafalan</label><label class="check"><input id="lDev" type="checkbox" ${data?.show_devotional?"checked":""}> Tampilkan Renungan</label><div class="actions"><button class="primary" onclick="saveLayout()">Simpan</button></div></div>`)}
async function saveLayout(){const r=await sb.from("layout_settings").update({desktop_first:lDesk.checked,show_qris:lQris.checked,show_memory_verse:lVerse.checked,show_devotional:lDev.checked,updated_at:new Date().toISOString()}).eq("id",1);if(r.error)alert(r.error.message);else alert("Layout tersimpan.")}
async function jadwal(){const a=await rows("worship_schedules");shell("Jadwal Ibadah",`<div class="card"><div class="section-head"><div><h3>Jadwal Ibadah</h3><p class="muted">Jam dapat diedit langsung.</p></div><button class="primary" onclick="scheduleForm()">+ Tambah</button></div><div class="list">${a.map(x=>`<div class="row"><div><strong>${esc(x.title)}</strong><br><span>${esc(x.day_label)} • ${esc(x.time_label||"Jam belum diatur")} • ${esc(x.description||"")}</span></div><button onclick='scheduleForm(${JSON.stringify(x).replace(/'/g,"&#39;")})'>Edit</button><button class="danger" onclick="remove('worship_schedules',${x.id},jadwal)">Hapus</button></div>`).join("")}</div></div>`)}
function scheduleForm(x=null){x=x||{};shell(x.id?"Edit Jadwal":"Tambah Jadwal",`<div class="card form"><label>Nama<input id="sTitle" value="${esc(x.title)}"></label><label>Hari<input id="sDay" value="${esc(x.day_label)}"></label><label>Jam<input id="sTime" value="${esc(x.time_label||"")}"></label><label>Keterangan<input id="sDesc" value="${esc(x.description||"")}"></label><label class="check"><input id="sActive" type="checkbox" ${x.active!==false?"checked":""}> Aktif</label><div class="actions"><button class="primary" onclick='saveSchedule(${x.id||"null"})'>Simpan</button><button onclick="jadwal()">Batal</button></div></div>`)}
async function saveSchedule(id){const o={title:sTitle.value.trim(),day_label:sDay.value.trim(),time_label:sTime.value.trim(),description:sDesc.value.trim(),active:sActive.checked,updated_at:new Date().toISOString()};if(!o.title||!o.day_label)return alert("Nama dan hari wajib diisi.");try{await saveRow("worship_schedules",id,o);jadwal()}catch(e){alert(e.message)}}
async function ministri(){const a=await rows("ministries");shell("Ministri",`<div class="card"><div class="section-head"><div><h3>Pelayanan Ministri</h3></div><button class="primary" onclick="minForm()">+ Tambah</button></div><div class="list">${a.map(x=>`<div class="row"><div><strong>${esc(x.name)}</strong><br><span>${esc(x.title||"")}</span></div><button onclick='minForm(${JSON.stringify(x).replace(/'/g,"&#39;")})'>Edit</button><button class="danger" onclick="remove('ministries',${x.id},ministri)">Hapus</button></div>`).join("")}</div></div>`)}
function minForm(x=null){x=x||{};shell("Ministri",`<div class="card form"><label>Nama<input id="mName" value="${esc(x.name)}"></label><label>Jabatan<input id="mTitle" value="${esc(x.title||"")}"></label><label>Foto<input id="mFile" type="file" accept="image/*"><div class="upload-line"><button type="button" onclick="uploadImage('mFile','mPhoto','ministri')">⬆ Upload Foto</button><span class="muted">JPG, PNG atau WebP</span></div><input id="mPhoto" value="${esc(x.photo_url||"")}" placeholder="URL foto (terisi otomatis setelah upload)"></label><label>Bio<textarea id="mBio" rows="5">${esc(x.bio||"")}</textarea></label><label>Facebook<input id="mFb" value="${esc(x.facebook_url||"")}"></label><label>Instagram<input id="mIg" value="${esc(x.instagram_url||"")}"></label><label class="check"><input id="mActive" type="checkbox" ${x.active!==false?"checked":""}> Aktif</label><div class="actions"><button class="primary" onclick='saveMin(${x.id||"null"})'>Simpan</button><button onclick="ministri()">Batal</button></div></div>`)}
async function saveMin(id){try{await saveRow("ministries",id,{name:mName.value.trim(),title:mTitle.value.trim(),photo_url:mPhoto.value.trim(),bio:mBio.value.trim(),facebook_url:mFb.value.trim(),instagram_url:mIg.value.trim(),active:mActive.checked,updated_at:new Date().toISOString()});ministri()}catch(e){alert(e.message)}}
async function banner(){const a=await rows("banners");shell("Banner & QRIS",`<div class="card"><div class="section-head"><h3>Banner & QRIS</h3><button class="primary" onclick="banForm()">+ Tambah</button></div><div class="list">${a.map(x=>`<div class="row"><div><strong>${esc(x.title)}</strong><br><span>${esc(x.kind)} • ${esc(x.image_url)}</span></div><button onclick='banForm(${JSON.stringify(x).replace(/'/g,"&#39;")})'>Edit</button><button class="danger" onclick="remove('banners',${x.id},banner)">Hapus</button></div>`).join("")}</div></div>`)}
function banForm(x=null){x=x||{};shell("Banner",`<div class="card form"><label>Judul<input id="bTitle" value="${esc(x.title)}"></label><label>Gambar<input id="bFile" type="file" accept="image/*"><div class="upload-line"><button type="button" onclick="uploadImage('bFile','bUrl','banner')">⬆ Upload Gambar</button><span class="muted">Banner atau QRIS</span></div><input id="bUrl" value="${esc(x.image_url||"")}" placeholder="URL gambar (terisi otomatis setelah upload)"></label><label>Jenis<select id="bKind"><option value="banner" ${x.kind!=="qris"?"selected":""}>Banner</option><option value="qris" ${x.kind==="qris"?"selected":""}>QRIS</option></select></label><label class="check"><input id="bActive" type="checkbox" ${x.active!==false?"checked":""}> Aktif</label><div class="actions"><button class="primary" onclick='saveBan(${x.id||"null"})'>Simpan</button><button onclick="banner()">Batal</button></div></div>`)}
async function saveBan(id){try{await saveRow("banners",id,{title:bTitle.value.trim(),image_url:bUrl.value.trim(),kind:bKind.value,active:bActive.checked,updated_at:new Date().toISOString()});banner()}catch(e){alert(e.message)}}
async function photos(cat){const a=await rows("photos");const filtered=cat?a.filter(x=>x.category===cat):a;shell(cat?"Arsip Foto Jemaat":"Dokumentasi Foto",`<div class="card"><div class="section-head"><h3>${cat?"Arsip Foto Jemaat":"Dokumentasi Foto"}</h3><button class="primary" onclick="photoForm()">+ Tambah Foto</button></div><div class="list">${filtered.map(x=>`<div class="row"><div><strong>${esc(x.title)}</strong><br><span>${esc(x.category)} • ${esc(x.image_url)}</span></div><button onclick='photoForm(${JSON.stringify(x).replace(/'/g,"&#39;")})'>Edit</button><button class="danger" onclick="remove('photos',${x.id},()=>photos(${cat?JSON.stringify(cat):"null"}))">Hapus</button></div>`).join("")}</div></div>`)}
function photoForm(x=null){x=x||{};shell("Foto",`<div class="card form"><label>Judul<input id="pTitle" value="${esc(x.title)}"></label><label>Kategori<input id="pCat" value="${esc(x.category||"Dokumentasi")}"></label><label>Foto<input id="pFile" type="file" accept="image/*"><div class="upload-line"><button type="button" onclick="uploadImage('pFile','pUrl','foto')">⬆ Upload Foto</button><span class="muted">Pilih foto dari perangkat</span></div><input id="pUrl" value="${esc(x.image_url||"")}" placeholder="URL foto (terisi otomatis setelah upload)"></label><label class="check"><input id="pActive" type="checkbox" ${x.active!==false?"checked":""}> Aktif</label><div class="actions"><button class="primary" onclick='savePhoto(${x.id||"null"})'>Simpan</button><button onclick="photos()">Batal</button></div></div>`)}
async function uploadImage(fileId,urlId,folder){const input=$(fileId);const file=input?.files?.[0];if(!file)return alert("Pilih foto terlebih dahulu.");if(!file.type.startsWith("image/"))return alert("File harus berupa gambar.");if(file.size>8*1024*1024)return alert("Ukuran maksimal 8 MB.");const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";const path=(folder||"media")+"/"+Date.now()+"-"+crypto.randomUUID()+"."+ext;const btn=input.closest(".form")?.querySelector(".upload-line button");if(btn){btn.disabled=true;btn.textContent="Mengunggah ke Supabase…"}try{const {data:{session}}=await sb.auth.getSession();if(!session)throw new Error("Sesi admin sudah berakhir. Silakan login kembali.");const r=await sb.storage.from("site-media").upload(path,file,{cacheControl:"31536000",upsert:false,contentType:file.type});if(r.error)throw r.error;const g=sb.storage.from("site-media").getPublicUrl(path);if(!g?.data?.publicUrl)throw new Error("URL foto tidak berhasil dibuat.");$(urlId).value=g.data.publicUrl;$(urlId).dispatchEvent(new Event("input",{bubbles:true}));alert("✓ Foto berhasil di-upload. URL sudah terisi. Sekarang tekan SIMPAN.");}catch(e){alert("Upload gagal: "+(e?.message||e));}finally{if(btn){btn.disabled=false;btn.textContent="⬆ Upload Foto"}}}
async function savePhoto(id){
 try{
  const file=pFile?.files?.[0]; let imageUrl=pUrl.value.trim();
  if(file){
   if(!file.type.startsWith("image/"))throw new Error("File harus berupa gambar.");
   if(file.size>8*1024*1024)throw new Error("Ukuran maksimal 8 MB.");
   const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
   const path="foto/"+Date.now()+"-"+crypto.randomUUID()+"."+ext;
   const {data:{session}}=await sb.auth.getSession();
   if(!session)throw new Error("Sesi admin sudah berakhir. Silakan login kembali.");
   const up=await sb.storage.from("site-media").upload(path,file,{cacheControl:"31536000",upsert:false,contentType:file.type});
   if(up.error)throw up.error;
   imageUrl=sb.storage.from("site-media").getPublicUrl(path).data.publicUrl; pUrl.value=imageUrl;
  }
  if(!imageUrl)throw new Error("Pilih foto atau isi URL foto terlebih dahulu.");
  await saveRow("photos",id,{title:pTitle.value.trim(),category:pCat.value.trim()||"Dokumentasi",image_url:imageUrl,active:pActive.checked,updated_at:new Date().toISOString()});
  alert("✓ Foto tersimpan dan siap tampil di website."); photos();
 }catch(e){alert("Gagal menyimpan foto: "+(e?.message||e))}
}
async function kontak(){const a=await rows("contacts");shell("Kontak & Header",`<div class="card"><div class="section-head"><h3>Kontak</h3><button class="primary" onclick="contactForm()">+ Tambah</button></div><div class="list">${a.map(x=>`<div class="row"><div><strong>${esc(x.label)}</strong><br><span>${esc(x.value)}</span></div><button onclick='contactForm(${JSON.stringify(x).replace(/'/g,"&#39;")})'>Edit</button><button class="danger" onclick="remove('contacts',${x.id},kontak)">Hapus</button></div>`).join("")}</div></div>`)}
function contactForm(x=null){x=x||{};shell("Kontak",`<div class="card form"><label>Label<input id="cLabel" value="${esc(x.label)}"></label><label>Nilai<input id="cValue" value="${esc(x.value)}"></label><label>Jenis<select id="cKind"><option>phone</option><option>email</option><option>address</option><option>social</option><option>other</option></select></label><label class="check"><input id="cActive" type="checkbox" ${x.active!==false?"checked":""}> Aktif</label><div class="actions"><button class="primary" onclick='saveContact(${x.id||"null"})'>Simpan</button><button onclick="kontak()">Batal</button></div></div>`)}
async function saveContact(id){try{await saveRow("contacts",id,{label:cLabel.value.trim(),value:cValue.value.trim(),kind:cKind.value,active:cActive.checked,updated_at:new Date().toISOString()});kontak()}catch(e){alert(e.message)}}
async function harian(){const a=await rows("daily_content","content_date");shell("Ayat & Renungan",`<div class="card"><div class="section-head"><h3>Ayat Hafalan & Renungan</h3><button class="primary" onclick="dailyForm()">+ Tambah</button></div><div class="list">${a.map(x=>`<div class="row"><div><strong>${esc(x.kind)} — ${esc(x.content_date)}</strong><br><span>${esc(x.title||"")} • ${esc(x.body).slice(0,100)}</span></div><button onclick='dailyForm(${JSON.stringify(x).replace(/'/g,"&#39;")})'>Edit</button><button class="danger" onclick="remove('daily_content',${x.id},harian)">Hapus</button></div>`).join("")}</div></div>`)}
function dailyForm(x=null){x=x||{};shell("Ayat & Renungan",`<div class="card form"><label>Tanggal<input id="dDate" type="date" value="${esc(x.content_date||new Date().toISOString().slice(0,10))}"></label><label>Jenis<select id="dKind"><option value="ayat_hafalan" ${x.kind==="ayat_hafalan"?"selected":""}>Ayat Hafalan</option><option value="renungan" ${x.kind==="renungan"?"selected":""}>Renungan</option></select></label><label>Judul<input id="dTitle" value="${esc(x.title||"")}"></label><label>Isi<textarea id="dBody" rows="10">${esc(x.body||"")}</textarea></label><label>Sumber<input id="dSource" value="${esc(x.source||"")}"></label><label class="check"><input id="dActive" type="checkbox" ${x.active!==false?"checked":""}> Aktif</label><div class="actions"><button class="primary" onclick='saveDaily(${x.id||"null"})'>Simpan</button><button onclick="harian()">Batal</button></div></div>`)}
async function saveDaily(id){try{await saveRow("daily_content",id,{content_date:dDate.value,kind:dKind.value,title:dTitle.value.trim(),body:dBody.value.trim(),source:dSource.value.trim(),active:dActive.checked});harian()}catch(e){alert(e.message)}}


async function media(){
 try{
  const [a,b,m,p]=await Promise.all([
   rows("media_assets","sort_order"),
   rows("banners"),
   rows("ministries"),
   rows("photos")
  ]);
  const staticHtml=a.map(x=>`<div class="media-card">
   <div class="media-preview"><img src="${esc(x.image_url||x.fallback_data||"")} alt="${esc(x.title)}"></div>
   <div class="media-info"><strong>${esc(x.title)}</strong><textarea id="mediaDesc_${x.id}" rows="3" placeholder="Deskripsi gambar...">${esc(x.description||"")}</textarea><button type="button" onclick="saveMediaDescription(${x.id})">Simpan deskripsi</button></div>
   <input id="mediaFile_${x.id}" type="file" accept="image/*" hidden onchange="replaceMedia(${x.id})">
   <button class="primary" type="button" onclick="document.getElementById('mediaFile_${x.id}').click()">Ganti</button>
   ${x.image_url?'<button type="button" onclick="resetMedia('+x.id+')">Kembali bawaan</button>':""}
  </div>`).join("");
  const bannerHtml=b.filter(x=>x.image_url).map(x=>`<div class="media-card">
   <div class="media-preview"><img src="${esc(x.image_url)}" alt="${esc(x.title)}"></div>
   <div class="media-info"><strong>${esc(x.title)}</strong><span>Banner / ${esc(x.kind)}</span></div>
   <button class="primary" onclick='banForm(${JSON.stringify(x).replace(/'/g,"&#39;")})'>Ganti</button>
  </div>`).join("");
  const minHtml=m.filter(x=>x.photo_url).map(x=>`<div class="media-card">
   <div class="media-preview"><img src="${esc(x.photo_url)}" alt="${esc(x.name)}"></div>
   <div class="media-info"><strong>${esc(x.name)}</strong><span>Foto ministri</span></div>
   <button class="primary" onclick='minForm(${JSON.stringify(x).replace(/'/g,"&#39;")})'>Ganti</button>
  </div>`).join("");
  const photoHtml=p.filter(x=>x.image_url).map(x=>`<div class="media-card">
   <div class="media-preview"><img src="${esc(x.image_url)}" alt="${esc(x.title)}"></div>
   <div class="media-info"><strong>${esc(x.title||"Dokumentasi")}</strong><span>${esc(x.category||"Dokumentasi")}</span></div>
   <button class="primary" onclick='photoForm(${JSON.stringify(x).replace(/'/g,"&#39;")})'>Ganti</button>
  </div>`).join("");
  shell("Media Website",`<div class="media-page">
   <div class="card"><div class="section-head"><div><h3>Semua Gambar Website</h3><p class="muted">Semua gambar bawaan website dapat diganti dari sini. Perubahan langsung dipakai website.</p></div></div>
   <div class="media-grid">${staticHtml}</div></div>
   ${bannerHtml?'<div class="card"><h3>Banner & QRIS Aktif</h3><div class="media-grid">'+bannerHtml+"</div></div>":""}
   ${minHtml?'<div class="card"><h3>Foto Ministri</h3><div class="media-grid">'+minHtml+"</div></div>":""}
   ${photoHtml?'<div class="card"><h3>Dokumentasi Foto</h3><div class="media-grid">'+photoHtml+"</div></div>":""}
  </div>`);
 }catch(e){shell("Media Website",`<div class="card"><h3>Gagal memuat media</h3><p>${esc(e.message)}</p></div>`)}
}
async function saveMediaDescription(id){
 try{
  const el=$("mediaDesc_"+id);
  const description=el?.value?.trim()||"";
  const r=await sb.from("media_assets").update({description,updated_at:new Date().toISOString()}).eq("id",id);
  if(r.error)throw r.error;
  alert("✓ Deskripsi berhasil disimpan.");
  media();
 }catch(e){alert("Gagal menyimpan deskripsi: "+(e?.message||e))}
}

async function replaceMedia(id){
 const input=$("mediaFile_"+id),file=input?.files?.[0]; if(!file)return;
 if(!file.type.startsWith("image/"))return alert("File harus berupa gambar.");
 if(file.size>8*1024*1024)return alert("Ukuran maksimal 8 MB.");
 try{
  const {data:{session}}=await sb.auth.getSession(); if(!session)throw new Error("Sesi admin sudah berakhir.");
  const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
  const path="media/"+id+"-"+Date.now()+"-"+crypto.randomUUID()+"."+ext;
  const up=await sb.storage.from("site-media").upload(path,file,{cacheControl:"31536000",upsert:false,contentType:file.type});
  if(up.error)throw up.error;
  const url=sb.storage.from("site-media").getPublicUrl(path).data.publicUrl;
  const r=await sb.from("media_assets").update({image_url:url,updated_at:new Date().toISOString()}).eq("id",id);
  if(r.error)throw r.error;
  alert("✓ Gambar berhasil diganti.");
  media();
 }catch(e){alert("Gagal mengganti gambar: "+(e?.message||e))}
}
async function resetMedia(id){
 if(!confirm("Kembalikan gambar bawaan website?"))return;
 try{const r=await sb.from("media_assets").update({image_url:null,updated_at:new Date().toISOString()}).eq("id",id);if(r.error)throw r.error;media()}catch(e){alert(e.message)}
}

async function remove(table,id,back){if(!confirm("Hapus data ini?"))return;try{await delRow(table,id);back()}catch(e){alert(e.message)}}
async function pengaturan(){shell("Pengaturan",`<div class="card"><h3>Pengaturan Back Office</h3><p>Backend: Supabase</p><p>Frontend: GitHub Pages</p><button class="danger" onclick="logout()">Keluar</button></div>`)}
async function logout(){await sb.auth.signOut();location.reload()}
async function show(id){const it=items.find(x=>x[0]===id);$("pageTitle").textContent=it?.[1]||"Back Office";document.querySelectorAll(".navitem").forEach(b=>b.classList.toggle("active",b.dataset.id===id));try{if(id==="dashboard")await dashboard();else if(id==="gereja")await gereja();else if(id==="layout")await layout();else if(id==="banner")await banner();else if(id==="media")await media();else if(id==="jadwal")await jadwal();else if(id==="ministri")await ministri();else if(id==="dokumentasi")await photos();else if(id==="arsip")await photos("Jemaat");else if(id==="kontak")await kontak();else if(id==="harian")await harian();else await pengaturan()}catch(e){shell("Error",`<div class="card"><h3>Gagal memuat data</h3><p>${esc(e.message)}</p></div>`)}}
const navIcons={"dashboard":"⌂","gereja":"◈","layout":"▦","banner":"◉","media":"▧","jadwal":"◷","ministri":"♙","dokumentasi":"▣","arsip":"▤","kontak":"☎","harian":"✦","pengaturan":"⚙"};const nav=$("nav");nav.innerHTML=items.map((x,i)=>`<button class="navitem ${i===0?"active":""}" data-id="${x[0]}"><span class="navicon">${navIcons[x[0]]||"•"}</span><span>${x[1]}</span></button>`).join("");nav.querySelectorAll("button").forEach(b=>b.onclick=()=>show(b.dataset.id));
init();
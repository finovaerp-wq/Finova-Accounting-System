import {supabase} from "../../assets/js/core/supabase.js";
import {TenantContext} from "../../assets/js/core/tenant-context.js";

// Only tables verified to be company-scoped through company_id are eligible.
// Do not add global master tables or user/auth tables to this list.
const TABLES = [
 "finova_company_profiles","finova_company_settings","finova_company_bank_accounts",
 "mst_business_partner","mst_chart_of_accounts","mst_taxes","mst_accounting_period",
 "mst_fixed_asset","mst_fixed_asset_category",
 "trx_account_payable","trx_account_payable_detail","trx_account_receivable",
 "trx_account_receivable_detail","trx_account_receivable_payment","trx_ap_payment",
 "trx_ap_payment_batch","trx_ar_payment","trx_gl_journal","trx_gl_journal_detail",
 "trx_fixed_asset_depreciation","trx_cash_flow_forecast_manual","trx_accounting_period_history"
];
// Global reference tables (e.g. mst_term_of_payment) are intentionally excluded.
// Pagination requires a deterministic unique key to avoid skipped/duplicated rows.

// Friendly module labels for the backup viewer. Original table keys remain unchanged.
const TABLE_LABELS = {
 finova_company_profiles:["Profil Perusahaan","Company Profile"],
 finova_company_settings:["Pengaturan Perusahaan","Company Settings"],
 finova_company_bank_accounts:["Rekening Bank Perusahaan","Company Bank Accounts"],
 mst_business_partner:["Mitra Bisnis","Business Partner"],
 mst_chart_of_accounts:["Bagan Akun (COA)","Chart of Accounts"],
 mst_taxes:["Master Pajak","Tax Master"],
 mst_accounting_period:["Periode Akuntansi","Accounting Period"],
 mst_fixed_asset:["Manajemen Aset","Asset Management"],
 mst_fixed_asset_category:["Kategori Aset","Asset Categories"],
 trx_account_payable:["Invoice AP","Account Payable"],
 trx_account_payable_detail:["Detail Invoice AP","Account Payable Details"],
 trx_account_receivable:["Invoice AR","Account Receivable"],
 trx_account_receivable_detail:["Detail Invoice AR","Account Receivable Details"],
 trx_account_receivable_payment:["Pembayaran Invoice AR","Account Receivable Payments"],
 trx_ap_payment:["Pembayaran AP","AP Payments"],
 trx_ap_payment_batch:["Batch Pembayaran AP","AP Payment Batches"],
 trx_ar_payment:["Pembayaran AR","AR Payments"],
 trx_gl_journal:["GL Journal","GL Journal"],
 trx_gl_journal_detail:["Detail GL Journal","GL Journal Details"],
 trx_fixed_asset_depreciation:["Penyusutan Aset","Asset Depreciation"],
 trx_cash_flow_forecast_manual:["Proyeksi Arus Kas Manual","Manual Cash Flow Forecast"],
 trx_accounting_period_history:["Riwayat Periode Akuntansi","Accounting Period History"]
};

// Stable, key-order-independent comparison of exported JSON values.
function canonical(value){
 if(Array.isArray(value))return "["+value.map(canonical).join(",")+"]";
 if(value&&typeof value==="object")return "{"+Object.keys(value).sort().map(k=>JSON.stringify(k)+":"+canonical(value[k])).join(",")+"}";
 return JSON.stringify(value)??"null";
}
// Only relationships with an unambiguous local column and known backup target
// are checked. This is not a substitute for PostgreSQL FK introspection.
const BACKUP_RELATIONS=[
 ["finova_company_bank_accounts","bank_id","mst_bank"],
 ["finova_company_profiles","signer_user_uid","finova_company_users"],
 ["mst_business_partner","top_id","mst_term_of_payment"],
 ["mst_chart_of_accounts","parent_id","mst_chart_of_accounts"],
 ["mst_fixed_asset","business_partner_id","mst_business_partner"],
 ["mst_fixed_asset","category_id","mst_fixed_asset_category"],
 ["mst_fixed_asset","disposal_account_id","mst_chart_of_accounts"],
 ["mst_fixed_asset","disposal_journal_id","trx_gl_journal"],
 ["mst_fixed_asset_category","accumulated_depreciation_account_id","mst_chart_of_accounts"],
 ["mst_fixed_asset_category","asset_account_id","mst_chart_of_accounts"],
 ["mst_fixed_asset_category","depreciation_expense_account_id","mst_chart_of_accounts"],
 ["mst_fixed_asset_category","disposal_gain_account_id","mst_chart_of_accounts"],
 ["mst_fixed_asset_category","disposal_loss_account_id","mst_chart_of_accounts"],
 ["mst_taxes","offset_account_id","mst_chart_of_accounts"],
 ["mst_taxes","tax_account_id","mst_chart_of_accounts"],
 ["trx_account_payable","gl_journal_id","trx_gl_journal"],
 ["trx_account_payable","vendor_id","mst_business_partner"],
 ["trx_account_payable_detail","account_id","mst_chart_of_accounts"],
 ["trx_account_payable_detail","account_payable_id","trx_account_payable"],
 ["trx_account_payable_detail","tax_id","mst_taxes"],
 ["trx_account_receivable","customer_id","mst_business_partner"],
 ["trx_account_receivable","gl_journal_id","trx_gl_journal"],
 ["trx_account_receivable_detail","account_id","mst_chart_of_accounts"],
 ["trx_account_receivable_detail","account_receivable_id","trx_account_receivable"],
 ["trx_account_receivable_detail","tax_id","mst_taxes"],
 ["trx_account_receivable_detail","tax_minus_id","mst_taxes"],
 ["trx_account_receivable_detail","tax_plus_id","mst_taxes"],
 ["trx_account_receivable_payment","account_receivable_id","trx_account_receivable"],
 ["trx_account_receivable_payment","ar_payment_id","trx_ar_payment"],
 ["trx_account_receivable_payment","gl_journal_id","trx_gl_journal"],
 ["trx_accounting_period_history","accounting_period_id","mst_accounting_period"],
 ["trx_ap_payment","account_payable_id","trx_account_payable"],
 ["trx_ap_payment","bank_account_id","mst_chart_of_accounts"],
 ["trx_ap_payment","gl_journal_id","trx_gl_journal"],
 ["trx_ap_payment","payment_batch_id","trx_ap_payment_batch"],
 ["trx_ap_payment_batch","bank_account_id","mst_chart_of_accounts"],
 ["trx_ap_payment_batch","gl_journal_id","trx_gl_journal"],
 ["trx_ap_payment_batch","vendor_id","mst_business_partner"],
 ["trx_ar_payment","bank_account_id","mst_business_partner_bank"],
 ["trx_ar_payment","customer_id","mst_business_partner"],
 ["trx_ar_payment","gl_journal_id","trx_gl_journal"],
 ["trx_cash_flow_forecast_manual","business_partner_id","mst_business_partner"],
 ["trx_fixed_asset_depreciation","asset_id","mst_fixed_asset"],
 ["trx_fixed_asset_depreciation","gl_journal_id","trx_gl_journal"],
 ["trx_gl_journal_detail","account_id","mst_chart_of_accounts"],
 ["trx_gl_journal_detail","business_partner_id","mst_business_partner"],
 ["trx_gl_journal_detail","journal_id","trx_gl_journal"],
];
const PAGE=500;
const PRIMARY_KEYS={finova_company_profiles:"company_id"};
const enc=new TextEncoder();
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");
async function digest(s){return hex(await crypto.subtle.digest("SHA-256",enc.encode(s)));}
const translations={
 id:{title:"Backup & Pemulihan",subtitle:"Cadangan data perusahaan aktif, tidak termasuk perusahaan lain.",backup:"Buat Backup",backupDesc:"Mengunduh snapshot JSON dari tabel perusahaan yang dapat diakses. Jika satu tabel gagal dibaca, proses dibatalkan.",download:"Buat & Unduh Backup",restore:"Pemeriksaan File Pemulihan",restoreDesc:"Periksa struktur, checksum, dan identitas perusahaan sebelum pemulihan. Penulisan ke database belum diaktifkan sampai backend pemulihan transaksional tersedia.",verify:"Periksa File",disabled:"Pemulihan Database Belum Diaktifkan",viewer:"Lihat Isi Backup",viewerDesc:"Pilih file backup JSON, periksa file, lalu lihat dan cari data per tabel. Tidak ada data yang dikirim ke database.",table:"Pilih Tabel",search:"Cari pada tabel",csv:"Unduh CSV Tabel",perPage:"Baris per halaman",all:"Semua",previous:"Sebelumnya",next:"Berikutnya",detail:"Lihat Detail",detailTitle:"Detail Data Backup",close:"Tutup",page:"Halaman",rows:"baris",preflight:"Pratinjau Dampak Pemulihan",preflightDesc:"Bandingkan ID, nilai, dan relasi berdasarkan foreign key yang terdaftar. Hanya membaca database; tidak menjalankan pemulihan.",preflightRun:"Periksa Dampak Restore",preflightTable:"Modul",preflightBackup:"Data Backup",preflightCurrent:"Data Saat Ini",preflightInsert:"Hanya di Backup",preflightDelete:"Hanya di Database",preflightSame:"ID Sama",preflightWarning:"Pratinjau bersifat read-only. Perbandingan nilai hanya untuk kolom yang diekspor; relasi diperiksa secara terbatas dan bukan jaminan Restore aman. Tidak ada data yang diubah.",preflightChanged:"Isi Berubah",preflightUnchanged:"Isi Sama",preflightRisk:"Pemeriksaan Kelengkapan & Relasi",preflightMissing:"Referensi di luar backup",preflightBroken:"Relasi tidak ditemukan",preflightUnknown:"Relasi belum diverifikasi",preflightCoverage:"Cakupan backup: 22 tabel perusahaan. Auth, Storage, Audit Log, pengguna, master global, skema dan RLS tidak termasuk. Restore tetap dinonaktifkan.",warning:"Backup ini merupakan ekspor data tabel yang terdaftar, bukan backup PostgreSQL menyeluruh (skema, Auth, Storage, dan objek database tidak termasuk). Simpan file di lokasi aman; file mungkin mengandung informasi keuangan sensitif."},
 en:{title:"Backup & Restore",subtitle:"Active company data only; other companies are excluded.",backup:"Create Backup",backupDesc:"Download a JSON snapshot of accessible company tables. If any table fails, the operation is aborted.",download:"Create & Download Backup",restore:"Restore File Verification",restoreDesc:"Check structure, checksum and company identity before restoration. Database writes remain disabled until a transactional restore backend is available.",verify:"Verify File",disabled:"Database Restore Not Enabled",viewer:"View Backup Contents",viewerDesc:"Select a backup JSON file, verify it, then browse and search table records. No data is sent to the database.",table:"Select Table",search:"Search table",csv:"Download Table CSV",perPage:"Rows per page",all:"All",previous:"Previous",next:"Next",detail:"View Details",detailTitle:"Backup Record Details",close:"Close",page:"Page",rows:"rows",preflight:"Restore Impact Preview",preflightDesc:"Compare IDs, values, and known foreign-key relationships. Read-only; no restore is performed.",preflightRun:"Check Restore Impact",preflightTable:"Module",preflightBackup:"Backup Rows",preflightCurrent:"Current Rows",preflightInsert:"Backup Only",preflightDelete:"Database Only",preflightSame:"Matching IDs",preflightWarning:"Read-only preview. Content comparison covers exported columns; relationship checks are limited and do not certify restore safety. No data is modified.",preflightChanged:"Changed Values",preflightUnchanged:"Same Values",preflightRisk:"Coverage & Relationship Checks",preflightMissing:"References outside backup",preflightBroken:"Missing relationships",preflightUnknown:"Relationships not verified",preflightCoverage:"Backup covers 22 company tables only. Auth, Storage, Audit Log, users, global master data, schema and RLS are excluded. Restore remains disabled.",warning:"This is a registered-table data export, not a full PostgreSQL backup (schema, Auth, Storage and database objects are excluded). Store securely: the file may contain sensitive financial information."}
};
export class BackupRestore {
 constructor(){this.viewerPage=1;this.detailReturnFocus=null;this.root=document.getElementById("finova-backup");if(this.root)this.init();}
 el(id){return this.root.querySelector("#"+id);}
 english(){return document.documentElement.lang?.toLowerCase().startsWith("en");}
 t(id,en){return en?en:id;}
 notice(s,error=false){const n=this.el("fb-notice");n.textContent=s;n.className="alert "+(error?"alert-danger":"alert-info");}
 language(){const l=translations[this.english()?"en":"id"];this.root.querySelectorAll("[data-i18n-backup]").forEach(n=>n.textContent=l[n.dataset.i18nBackup]||"");if(this.verifiedPayload){for(const option of this.el("fb-table").options){const table=option.value;option.textContent=`${(TABLE_LABELS[table]||[table,table])[this.english()?1:0]} (${this.verifiedPayload.tables[table].length})`;}}}
 async init(){this.language();this.el("fb-export").addEventListener("click",()=>this.backup());this.el("fb-verify").addEventListener("click",()=>this.verify());this.el("fb-table").addEventListener("change",()=>{this.viewerPage=1;this.renderViewer();});this.el("fb-search").addEventListener("input",()=>{this.viewerPage=1;this.renderViewer();});this.el("fb-page-size").addEventListener("change",()=>{this.viewerPage=1;this.renderViewer();});this.el("fb-prev").addEventListener("click",()=>{this.viewerPage=Math.max(1,this.viewerPage-1);this.renderViewer();});this.el("fb-next").addEventListener("click",()=>{this.viewerPage++;this.renderViewer();});this.el("fb-detail-close").addEventListener("click",()=>this.closeDetail());this.el("fb-detail-done").addEventListener("click",()=>this.closeDetail());this.el("fb-detail-modal").addEventListener("click",e=>{if(e.target===this.el("fb-detail-modal"))this.closeDetail();});this.root.addEventListener("keydown",e=>{if(e.key==="Escape"&&!this.el("fb-detail-modal").hidden){e.preventDefault();this.closeDetail();}});this.el("fb-csv").addEventListener("click",()=>this.downloadCsv());this.el("fb-preflight-run").addEventListener("click",()=>this.preflight());this.el("fb-file").addEventListener("change",()=>this.resetViewer());
  try{this.company=await TenantContext.getCompanyId({refresh:true});if(!this.company)throw Error("Perusahaan aktif tidak ditemukan.");
   const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user)throw Error("Sesi login tidak valid.");
   const {data:member,error:memberError}=await supabase.from("finova_company_users").select("role,status").eq("company_id",this.company).eq("user_uid",user.id).eq("status","ACTIVE").maybeSingle();
   if(memberError)throw memberError;
   if(window.finovaIsSuperAdmin!==true)throw Error("Hanya Super Admin yang dapat mengakses modul ini.");
   const companyName=await TenantContext.getCompanyName({refresh:true});
   this.el("fb-company").textContent=companyName||"Nama perusahaan tidak tersedia";this.el("fb-export").disabled=false;this.notice("Perusahaan aktif terverifikasi. Backup dapat dibuat.");
  }catch(e){this.notice(e.message,true);this.el("fb-verify").disabled=true;this.el("fb-export").disabled=true;}
  this._langHandler=()=>this.language();window.addEventListener("finova:language-changed",this._langHandler);
 }
 async backup(){if(window.finovaIsSuperAdmin!==true||!this.company){this.notice("Akses Super Admin diperlukan.",true);return;}const btn=this.el("fb-export");btn.disabled=true;const progress=this.el("fb-progress");try{
   const rows={};for(let i=0;i<TABLES.length;i++){
    const table=TABLES[i];progress.textContent=`${i+1}/${TABLES.length}: ${table}`;rows[table]=[];
    for(let start=0;;start+=PAGE){
     // company_id filter AND RLS: fail closed on any query error.
     const {data,error}=await supabase.from(table).select("*").eq("company_id",this.company).order(PRIMARY_KEYS[table]||"id",{ascending:true}).range(start,start+PAGE-1);
     if(error)throw Error(`${table}: ${error.message}`);
     if(!Array.isArray(data))throw Error(`${table}: respons tidak valid`);
     if(data.some(r=>r.company_id!==this.company))throw Error(`${table}: pelanggaran cakupan perusahaan`);
     rows[table].push(...data);if(data.length<PAGE)break;
     if(start>1000000)throw Error(`${table}: melebihi batas keamanan ekspor`);
    }
   }
   for(const table of TABLES){
    const ids=new Set();for(const r of rows[table]){
     if(typeof r[PRIMARY_KEYS[table]||"id"]!=="string"&&typeof r[PRIMARY_KEYS[table]||"id"]!=="number")throw Error(`${table}: ID tidak valid`);
     const key=String(r[PRIMARY_KEYS[table]||"id"]);if(ids.has(key))throw Error(`${table}: ID duplikat ${key}`);ids.add(key);
    }
   }
   const payload={format:"finova-company-snapshot",version:1,company_id:this.company,created_at:new Date().toISOString(),tables:rows};
   const checksum=await digest(JSON.stringify(payload));const output=JSON.stringify({payload,sha256:checksum},null,2);
   const blob=new Blob([output],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");
   a.href=url;a.download=`FINOVA-BACKUP-${this.company}-${new Date().toISOString().replace(/[:.]/g,"-")}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   progress.textContent=`Selesai: ${TABLES.length} tabel, ${Object.values(rows).reduce((n,r)=>n+r.length,0)} baris.`;this.notice("Backup berhasil dibuat. Simpan file di tempat aman.");
  }catch(e){this.notice("Backup dibatalkan; tidak ada file parsial yang disimpan. "+e.message,true);progress.textContent="";}finally{btn.disabled=false;}}
 async verify(){this.resetViewer();const out=this.el("fb-preview");out.textContent="";try{if(window.finovaIsSuperAdmin!==true||!this.company)throw Error("Akses Super Admin diperlukan.");const file=this.el("fb-file").files?.[0];if(!file)throw Error("Pilih file JSON terlebih dahulu.");if(file.size>100*1024*1024)throw Error("File terlalu besar untuk pemeriksaan browser (maks. 100 MB).");
  const data=JSON.parse(await file.text());if(!data||!data.payload||typeof data.sha256!=="string")throw Error("Struktur file tidak valid.");const p=data.payload;
  if(p.format!=="finova-company-snapshot"||p.version!==1||p.company_id!==this.company)throw Error("Versi atau perusahaan file tidak cocok dengan perusahaan aktif.");
  if(!p.tables||typeof p.tables!=="object"||Object.keys(p.tables).length!==TABLES.length||TABLES.some(t=>!Array.isArray(p.tables[t])))throw Error("Daftar tabel tidak lengkap.");
  for(const t of TABLES){if(p.tables[t].some(r=>!r||r.company_id!==this.company))throw Error("Data perusahaan tidak cocok: "+t);}
  for(const t of TABLES){const ids=new Set();for(const r of p.tables[t]){
   if(typeof r[PRIMARY_KEYS[t]||"id"]!=="string"&&typeof r[PRIMARY_KEYS[t]||"id"]!=="number")throw Error("ID tidak valid: "+t);
   const id=String(r[PRIMARY_KEYS[t]||"id"]);if(ids.has(id))throw Error("ID duplikat: "+t);ids.add(id);
  }}
  if(await digest(JSON.stringify(p))!==data.sha256)throw Error("Checksum tidak cocok: file telah berubah atau rusak.");
  out.textContent=`File valid secara struktur dan checksum. ${TABLES.length} tabel, ${Object.values(p.tables).reduce((n,r)=>n+r.length,0)} baris. Tidak ada data database yang diubah.`;this.verifiedPayload=p;this.showViewer();
 }catch(e){out.textContent="Pemeriksaan gagal: "+e.message;}}
 resetViewer(){this.closeDetail();this.viewerPage=1;this.verifiedPayload=null;this.el("fb-preflight").hidden=true;this.el("fb-preflight-results").replaceChildren();this.el("fb-viewer").hidden=true;this.el("fb-rows").replaceChildren();this.el("fb-table").replaceChildren();this.el("fb-search").value="";}
 showViewer(){if(!this.verifiedPayload)return;const select=this.el("fb-table");for(const table of TABLES){const option=document.createElement("option");option.value=table;option.textContent=`${(TABLE_LABELS[table]||[table,table])[this.english()?1:0]} (${this.verifiedPayload.tables[table].length})`;select.appendChild(option);}this.el("fb-viewer").hidden=false;this.el("fb-preflight").hidden=false;this.renderViewer();}
 filteredRows(){if(!this.verifiedPayload)return[];const table=this.el("fb-table").value;const all=this.verifiedPayload.tables[table]||[];const q=this.el("fb-search").value.trim().toLocaleLowerCase();return q?all.filter(r=>Object.values(r).some(v=>String(v??"").toLocaleLowerCase().includes(q))):all;}
 renderViewer(){
  if(!this.verifiedPayload)return;
  const table=this.el("fb-table").value;
  const all=this.verifiedPayload.tables[table]||[];
  const filtered=this.filteredRows();
  const wrap=this.el("fb-rows");wrap.replaceChildren();
  const pageSizeValue=this.el("fb-page-size").value;
  const pageSize=pageSizeValue==="all"?Math.max(1,filtered.length):Number(pageSizeValue)||25;
  const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
  this.viewerPage=Math.min(Math.max(1,this.viewerPage),pages);
  const start=(this.viewerPage-1)*pageSize;
  const visible=filtered.slice(start,start+pageSize);
  const lang=translations[this.english()?"en":"id"];
  this.el("fb-count").textContent=`${filtered.length} / ${all.length} ${lang.rows} (${filtered.length?start+1:0}–${start+visible.length})`;
  this.el("fb-page-info").textContent=`${lang.page} ${this.viewerPage} / ${pages}`;
  this.el("fb-prev").disabled=this.viewerPage<=1;
  this.el("fb-next").disabled=this.viewerPage>=pages;
  this.el("fb-pager").hidden=pageSizeValue==="all"||pages<=1;
  if(!all.length){wrap.textContent=this.english()?"No records in this table.":"Tidak ada data pada tabel ini.";return;}
  if(!filtered.length){wrap.textContent=this.english()?"No matching records.":"Tidak ada data yang cocok.";return;}
  const columns=[...new Set(all.flatMap(r=>Object.keys(r)))];
  const tableEl=document.createElement("table");tableEl.className="table table-sm table-striped table-bordered align-middle mb-0";
  const thead=document.createElement("thead");const header=document.createElement("tr");
  const actionHeader=document.createElement("th");actionHeader.textContent=this.english()?"Action":"Aksi";header.appendChild(actionHeader);
  for(const col of columns){const th=document.createElement("th");th.textContent=col;header.appendChild(th);}
  thead.appendChild(header);tableEl.appendChild(thead);
  const tbody=document.createElement("tbody");
  for(const row of visible){const tr=document.createElement("tr");const actionCell=document.createElement("td");
   const btn=document.createElement("button");btn.type="button";btn.className="btn btn-sm btn-outline-primary fb-row-detail";btn.textContent=lang.detail;btn.addEventListener("click",()=>this.openDetail(row,table,btn));actionCell.appendChild(btn);tr.appendChild(actionCell);
   for(const col of columns){const td=document.createElement("td");const value=row[col];td.textContent=value===null||value===undefined?"":typeof value==="object"?JSON.stringify(value):String(value);td.title=td.textContent;tr.appendChild(td);}tbody.appendChild(tr);
  }
  tableEl.appendChild(tbody);wrap.appendChild(tableEl);
 }
 openDetail(row,table,trigger){
  if(window.finovaIsSuperAdmin!==true||!this.verifiedPayload)return;
  this.detailReturnFocus=trigger;
  const label=(TABLE_LABELS[table]||[table,table])[this.english()?1:0];
  this.el("fb-detail-title").textContent=`${translations[this.english()?"en":"id"].detailTitle} — ${label}`;
  const body=this.el("fb-detail-body");body.replaceChildren();
  for(const [key,value] of Object.entries(row)){
   const item=document.createElement("div");item.className="fb-detail-item";
   const k=document.createElement("div");k.className="fb-detail-key";k.textContent=key;
   const v=document.createElement("div");v.className="fb-detail-value";v.textContent=value==null?"—":typeof value==="object"?JSON.stringify(value,null,2):String(value);
   item.append(k,v);body.appendChild(item);
  }
  this.el("fb-detail-modal").hidden=false;
  this.el("fb-detail-close").focus();
 }
 closeDetail(){const modal=this.el("fb-detail-modal");if(!modal||modal.hidden)return;modal.hidden=true;this.detailReturnFocus?.focus();this.detailReturnFocus=null;}
 async preflight(){
  const button=this.el("fb-preflight-run"),results=this.el("fb-preflight-results");results.replaceChildren();
  if(window.finovaIsSuperAdmin!==true||!this.company||!this.verifiedPayload){this.notice("Akses atau file backup tidak valid.",true);return;}
  button.disabled=true;
  const lang=translations[this.english()?"en":"id"];
  const status=document.createElement("p");status.className="small text-muted";status.setAttribute("role","status");results.appendChild(status);
  try{
   const summary=[],currentTables={};
   for(let i=0;i<TABLES.length;i++){
    if(window.finovaIsSuperAdmin!==true)throw Error("Akses Super Admin diperlukan.");
    const name=TABLES[i],pk=PRIMARY_KEYS[name]||"id";status.textContent=`${i+1}/${TABLES.length}: ${name}`;
    const current=new Map();
    for(let offset=0;;offset+=PAGE){
     const {data,error}=await supabase.from(name).select("*").eq("company_id",this.company).order(pk,{ascending:true}).range(offset,offset+PAGE-1);
     if(error)throw Error(`${name}: ${error.message}`);
     if(!Array.isArray(data))throw Error(`${name}: respons database tidak valid`);
     for(const r of data){
      if(r.company_id!==this.company)throw Error(`${name}: perusahaan tidak cocok`);
      const key=String(r[pk]);if(current.has(key))throw Error(`${name}: ID duplikat database`);current.set(key,r);
     }
     if(data.length<PAGE)break;
     if(offset>1000000)throw Error(`${name}: batas pemeriksaan terlampaui`);
    }
    currentTables[name]=current;
    const backup=new Map(this.verifiedPayload.tables[name].map(r=>[String(r[pk]),r]));
    let common=0,changed=0;
    for(const [id,record] of backup)if(current.has(id)){
     common++;
     if(canonical(record)!==canonical(current.get(id)))changed++;
    }
    summary.push({name,backup:backup.size,current:current.size,onlyBackup:backup.size-common,onlyCurrent:current.size-common,common,changed,unchanged:common-changed});
   }
   results.replaceChildren();
   const table=document.createElement("table");table.className="table table-sm table-bordered table-striped align-middle mb-2";
   const head=document.createElement("thead"),tr=document.createElement("tr");
   for(const label of [lang.preflightTable,lang.preflightBackup,lang.preflightCurrent,lang.preflightInsert,lang.preflightDelete,lang.preflightSame,lang.preflightChanged,lang.preflightUnchanged]){
    const th=document.createElement("th");th.textContent=label;tr.appendChild(th);
   }
   head.appendChild(tr);table.appendChild(head);
   const body=document.createElement("tbody");
   for(const r of summary){
    const tr=document.createElement("tr");
    for(const value of [(TABLE_LABELS[r.name]||[r.name,r.name])[this.english()?1:0],r.backup,r.current,r.onlyBackup,r.onlyCurrent,r.common,r.changed,r.unchanged]){
     const td=document.createElement("td");td.textContent=String(value);tr.appendChild(td);
    }
    body.appendChild(tr);
   }
   table.appendChild(body);
   const wrap=document.createElement("div");wrap.className="table-responsive";wrap.appendChild(table);results.appendChild(wrap);
   const risk=document.createElement("div");risk.className="mt-3";
   const heading=document.createElement("strong");heading.textContent=lang.preflightRisk;risk.appendChild(heading);
   const coverage=document.createElement("p");coverage.className="small text-warning-emphasis mt-2 mb-2";coverage.textContent=lang.preflightCoverage;risk.appendChild(coverage);
   const issues=[];
   let checked=0,unknown=0,missing=0,external=0;
   const backupTables=this.verifiedPayload.tables;
   const knownTables=new Set(TABLES);
   for(const [source,column,target] of BACKUP_RELATIONS){
    const sourceRows=backupTables[source]||[];
    if(!sourceRows.length)continue;
    const hasColumn=sourceRows.every(r=>Object.prototype.hasOwnProperty.call(r,column));
    if(!hasColumn){unknown++;issues.push(`${source}.${column}: ${lang.preflightUnknown} (kolom tidak tersedia)`);continue;}
    const references=sourceRows.filter(r=>r[column]!==null&&r[column]!==undefined&&r[column]!=="");
    if(!references.length)continue;
    if(!knownTables.has(target)){
     external+=references.length;
     issues.push(`${source}.${column} → ${target}: ${references.length} referensi di luar backup; harus diverifikasi melalui database sebelum Restore`);
     continue;
    }
    const targetPk=PRIMARY_KEYS[target]||"id";
    const targetIds=new Set((backupTables[target]||[]).map(r=>String(r[targetPk])));
    for(const row of references){
     checked++;
     if(!targetIds.has(String(row[column]))){missing++;issues.push(`${source} #${row[PRIMARY_KEYS[source]||"id"]}: ${column}=${row[column]} → ${target} (${lang.preflightBroken})`);}
    }
   }
   // Stage 4: read-only external reference verification. Never fetch full global tables.
   // A permission error means UNVERIFIED, not missing. Tenant-specific checks include company_id.
   let externalVerified=0,externalMissing=0,externalUnverified=0;
   const externalGroups=new Map();
   for(const [source,column,target] of BACKUP_RELATIONS){
    if(knownTables.has(target))continue;
    for(const row of (backupTables[source]||[])){
     const value=row[column];
     if(value===null||value===undefined||value==="")continue;
     const key=target+"|"+column;
     if(!externalGroups.has(key))externalGroups.set(key,{target,column,items:[]});
     externalGroups.get(key).items.push({source,row,value:String(value)});
    }
   }
   for(const group of externalGroups.values()){
    const {target,items}=group;
    const unique=[...new Set(items.map(item=>item.value))];
    const found=new Set();
    let errorText=null;
    try{
     // finova_company_users has a composite (company_id, user_uid) constraint.
     // Restrict this lookup to the active tenant, not just user_uid.
     const keyColumn=target==="finova_company_users"?"user_uid":"id";
     for(let offset=0;offset<unique.length;offset+=100){
      let query=supabase.from(target).select(keyColumn).in(keyColumn,unique.slice(offset,offset+100));
      if(target==="finova_company_users")query=query.eq("company_id",this.company);
      const {data,error}=await query;
      if(error)throw Error(error.message);
      if(!Array.isArray(data))throw Error("Respons referensi tidak valid");
      for(const record of data)found.add(String(record[keyColumn]));
     }
    }catch(error){errorText=error.message||String(error);}
    if(errorText){
     externalUnverified+=items.length;
     issues.push(`${target}: ${items.length} referensi BELUM DIVERIFIKASI (${errorText}). Tidak dianggap hilang.`);
    }else{
     for(const item of items){
      if(found.has(item.value))externalVerified++;
      else{
       externalMissing++;
       issues.push(`${item.source}.${group.column} → ${target}: referensi ${item.value} TIDAK DITEMUKAN untuk konteks yang diperiksa.`);
      }
     }
    }
   }
   // Explicit company references exist outside the 22-table export.
   // The current tenant record must exist; this does not validate all composite constraints.
   let tenantVerified=false;
   try{
    const {data,error}=await supabase.from("finova_companies").select("id").eq("id",this.company).maybeSingle();
    if(error)throw Error(error.message);
    tenantVerified=!!data;
    if(!tenantVerified)issues.push("finova_companies: perusahaan aktif tidak ditemukan pada akses pemeriksaan.");
   }catch(error){
    externalUnverified++;
    issues.push(`finova_companies: BELUM DIVERIFIKASI (${error.message}).`);
   }
   if(window.finovaIsSuperAdmin!==true)throw Error("Akses Super Admin diperlukan.");
   // Company and signer composite constraints are not independently proven by this check.
   // The foreign keys to finova_companies require a separately verified tenant context.
   const summaryText=document.createElement("p");summaryText.className="small mb-1";
   summaryText.textContent=this.english()
    ? `${checked} internal references checked; ${missing} missing; ${external} external references in backup; ${unknown} missing-column definitions.`
    : `${checked} referensi internal diperiksa; ${missing} relasi tidak ditemukan; ${external} referensi eksternal dalam backup; ${unknown} definisi kolom tidak tersedia.`;
   risk.appendChild(summaryText);
   const externalLine=document.createElement("p");externalLine.className="small mb-1";
   externalLine.textContent=this.english()
    ? `External reference checks: ${externalVerified} found, ${externalMissing} missing, ${externalUnverified} unverified. Active company record: ${tenantVerified?"found":"not verified"}.`
    : `Pemeriksaan referensi eksternal: ${externalVerified} ditemukan, ${externalMissing} tidak ditemukan, ${externalUnverified} belum terverifikasi. Perusahaan aktif: ${tenantVerified?"ditemukan":"belum terverifikasi"}.`;
   risk.appendChild(externalLine);
   const statusLine=document.createElement("p");statusLine.className="small fw-semibold mb-2";
   statusLine.textContent=this.english()?"Restore eligibility: NOT VERIFIED — composite constraints, external references and database constraints still require server-side validation.":"Kelayakan Restore: BELUM TERVERIFIKASI — relasi gabungan, referensi eksternal, dan constraint database masih memerlukan validasi server-side.";
   risk.appendChild(statusLine);
   if(issues.length){
    const list=document.createElement("ul");list.className="small mb-2";
    for(const issue of issues.slice(0,40)){const li=document.createElement("li");li.textContent=issue;list.appendChild(li);}
    risk.appendChild(list);
    if(issues.length>40){const more=document.createElement("p");more.className="small";more.textContent=`${issues.length-40} ${this.english()?"more warnings":"peringatan lainnya"}...`;risk.appendChild(more);}
   }
   const caution=document.createElement("p");caution.className="small text-muted mb-1";
   caution.textContent=this.english()?"Other foreign keys, global reference tables, and database constraints have NOT been verified.":"Foreign key lain, master referensi global, dan constraint database BELUM diverifikasi.";
   risk.appendChild(caution);results.appendChild(risk);
   const warn=document.createElement("p");warn.className="small text-warning-emphasis mb-0";warn.textContent=lang.preflightWarning;results.appendChild(warn);
  }catch(e){
   results.replaceChildren();const msg=document.createElement("div");msg.className="alert alert-danger small";
   msg.textContent=`${this.english()?"Impact check failed":"Pemeriksaan dampak gagal"}: ${e.message}. ${this.english()?"No database changes.":"Tidak ada perubahan database."}`;results.appendChild(msg);
  }finally{button.disabled=false;}
 }
 downloadCsv(){if(window.finovaIsSuperAdmin!==true||!this.verifiedPayload)return;const table=this.el("fb-table").value;const all=this.filteredRows();const cols=[...new Set((this.verifiedPayload.tables[table]||[]).flatMap(r=>Object.keys(r)))];const safe=v=>{let s=v==null?"":typeof v==="object"?JSON.stringify(v):String(v);if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};const csv="\uFEFF"+[cols.map(safe).join(","),...all.map(r=>cols.map(c=>safe(r[c])).join(","))].join("\r\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=`FINOVA-${table}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}

 }

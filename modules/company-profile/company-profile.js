import { CompanyProfileService as Service } from "../../service/company-profile.service.js";
export class CompanyProfile {
  constructor(){this.root=document.getElementById("finova-company-profile");if(this.root)this.initialize();}
  el(id){return this.root.querySelector("#"+id);}
  val(id){return this.el(id).value.trim();}
  set(id,v){this.el(id).value=v??"";}
  notice(message,error=false){
    const node=this.el("cp-alert");
    node.textContent=message;
    node.className="small mb-2 "+(error?"text-danger":"text-success");
  }
  showSaveToast(){
    // Match the Bootstrap success alert used by Invoice AP.
    const isEnglish=String(document.documentElement.lang||"").toLowerCase().startsWith("en") || String(localStorage.getItem("finova-ui-language")||"").toLowerCase()==="en";
    const message=isEnglish?"Company profile saved successfully.":"Profil perusahaan berhasil disimpan.";
    const existing=document.getElementById("cp-bootstrap-success-alert");
    if(existing)existing.remove();
    const alert=document.createElement("div");
    alert.id="cp-bootstrap-success-alert";
    alert.className="alert alert-success alert-dismissible fade show shadow-sm";
    alert.setAttribute("role","alert");
    alert.style.cssText="position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;width:auto;min-width:min(380px,90vw);max-width:90vw;";
    const layout=document.createElement("div");
    layout.className="d-flex align-items-start";
    const icon=document.createElement("i");
    icon.className="fa-solid fa-circle-check me-2 mt-1";
    const content=document.createElement("div");
    content.className="flex-grow-1";
    const title=document.createElement("strong");
    title.textContent=isEnglish?"Company Profile":"Profil Perusahaan";
    const detail=document.createElement("div");
    detail.textContent=message;
    content.append(title,detail);
    const close=document.createElement("button");
    close.type="button";
    close.className="btn-close";
    close.setAttribute("data-bs-dismiss","alert");
    close.setAttribute("aria-label",isEnglish?"Close":"Tutup");
    close.addEventListener("click",()=>alert.remove());
    layout.append(icon,content,close);
    alert.append(layout);
    document.body.appendChild(alert);
    setTimeout(()=>{
      if(!alert.isConnected)return;
      if(window.bootstrap?.Alert)window.bootstrap.Alert.getOrCreateInstance(alert).close();
      else alert.remove();
    },4000);
  }
  async initialize(){try{this.el("cp-refresh")?.addEventListener("click",()=>this.refresh({manual:true}));await this.refresh();this.el("cp-logo-upload")?.addEventListener("click",()=>this.uploadLogo());this.el("cp-logo-delete")?.addEventListener("click",()=>this.deleteLogo());this.el("cp-logo-file")?.addEventListener("change",e=>{const file=e.target.files?.[0];if(file){if(this._previewUrl)URL.revokeObjectURL(this._previewUrl);this._previewUrl=URL.createObjectURL(file);this.renderLogo(this._previewUrl);}});this.el("cp-save").addEventListener("click",()=>this.save());this.el("cp-add-bank").addEventListener("click",()=>this.addBank());this.el("cp-bank-form")?.addEventListener("submit",e=>{e.preventDefault();this.submitBank();});this.el("cp-delete-logo-confirm")?.addEventListener("click",()=>this.confirmDeleteLogo());window.addEventListener("finova:language-changed",()=>queueMicrotask(()=>this.applyLanguage()));this.applyLanguage();}catch(e){this.notice(e.message,true);}}
  isEnglish(){return String(document.documentElement.lang||"").toLowerCase().startsWith("en") || String(localStorage.getItem("finova-ui-language")||"").toLowerCase()==="en";}
  setRefreshLoading(loading){
    const button=this.el("cp-refresh");const indicator=this.el("cp-refresh-loading");
    const label=this.root.querySelector("[data-cp-refresh-label]");
    const en=this.isEnglish();
    if(button){button.disabled=loading;button.setAttribute("aria-busy",String(loading));const icon=button.querySelector("i");if(icon)icon.classList.toggle("fa-spin",loading);}
    if(button)button.setAttribute("aria-label",en?"Refresh":"Muat Ulang");
    if(label)label.textContent=loading?(en?"Loading...":"Memuat..."):(en?"Refresh":"Muat Ulang");
    if(indicator){indicator.classList.toggle("d-none",!loading);indicator.classList.toggle("d-flex",loading);}
    const message=this.el("cp-refresh-loading-text");if(message)message.textContent=en?"Loading company profile...":"Memuat data profil perusahaan...";
  }
  async refresh({manual=false}={}){
    if(this._refreshing)return;
    this._refreshing=true;this.setRefreshLoading(true);
    try{
      const loaded=await Service.load();
      this.data=loaded;
      this.populateProfile();
      if(manual)this.notice("");
    }catch(error){console.error("CompanyProfile.refresh:",error);this.notice((this.isEnglish()?"Failed to refresh company profile: ":"Gagal memuat ulang profil perusahaan: ")+error.message,true);}
    finally{this._refreshing=false;this.setRefreshLoading(false);}
  }
  renderLogo(url){const img=this.el("cp-logo-preview"),empty=this.el("cp-logo-empty");if(!img)return;img.style.display=url?"block":"none";empty.style.display=url?"none":"block";if(url)img.src=url;else img.removeAttribute("src");}
  logoStatus(message,error=false){const el=this.el("cp-logo-status");if(el){el.textContent=message;el.className="small mt-2 "+(error?"text-danger":"text-success");}}
  async uploadLogo(){if(!this.data?.canEdit)return;const file=this.el("cp-logo-file")?.files?.[0];if(!file){this.logoStatus(this.isEnglish()?"Select a logo first.":"Pilih file logo terlebih dahulu.",true);return;}
    const btn=this.el("cp-logo-upload");btn.disabled=true;btn.textContent=this.isEnglish()?"Uploading...":"Mengunggah...";
    try{const url=await Service.uploadLogo(this.data.id,file);this.data.settings={...this.data.settings,logo_url:url};this.renderLogo(url);this.el("cp-logo-file").value="";if(this._previewUrl){URL.revokeObjectURL(this._previewUrl);this._previewUrl=null;}this.logoStatus(this.isEnglish()?"Logo uploaded successfully. It will appear on AR invoices.":"Logo berhasil diunggah dan akan tampil pada Invoice AR.");document.dispatchEvent(new CustomEvent("finova:company-logo-updated",{detail:{companyId:this.data.id,logoUrl:url}}));}
    catch(e){this.logoStatus((this.isEnglish()?"Upload failed: ":"Gagal mengunggah: ")+e.message,true);}
    finally{btn.disabled=false;btn.textContent=this.isEnglish()?"Upload Logo":"Unggah Logo";}}
  async deleteLogo(){
    if(!this.data?.canEdit)return;
    this.applyLanguage();
    const modal=this.el("cp-delete-logo-modal");
    if(!modal || !window.bootstrap?.Modal){this.logoStatus(this.isEnglish()?"Confirmation dialog is unavailable. Please reload the page.":"Dialog konfirmasi tidak tersedia. Silakan muat ulang halaman.",true);return;}
    window.bootstrap.Modal.getOrCreateInstance(modal).show();
  }
  async confirmDeleteLogo(){
    if(!this.data?.canEdit || this._deletingLogo)return;
    this._deletingLogo=true;
    const btn=this.el("cp-delete-logo-confirm"),modal=this.el("cp-delete-logo-modal");
    btn.disabled=true;
    try{
      await Service.removeLogo(this.data.id);
      this.data.settings={...this.data.settings,logo_url:null};
      this.renderLogo(null);
      this.logoStatus(this.isEnglish()?"Company logo deleted successfully.":"Logo perusahaan berhasil dihapus.");
      document.dispatchEvent(new CustomEvent("finova:company-logo-updated",{detail:{companyId:this.data.id,logoUrl:null}}));
      window.bootstrap.Modal.getOrCreateInstance(modal).hide();
    }catch(e){this.logoStatus((this.isEnglish()?"Delete failed: ":"Gagal menghapus: ")+e.message,true);}
    finally{this._deletingLogo=false;btn.disabled=false;this.applyLanguage();}
  }
  applyLanguage(){
    if(!this.root?.isConnected)return;
    const en=this.isEnglish();
    const labels={
      "cp-logo-label":["Logo Perusahaan","Company Logo"],
      "cp-logo-empty":["Belum ada logo","No logo uploaded"],
      "cp-logo-upload":["Unggah Logo","Upload Logo"],
      "cp-logo-delete":["Hapus Logo","Delete Logo"],
      "cp-delete-logo-heading":["Hapus Logo Perusahaan","Delete Company Logo"],
      "cp-delete-logo-question":["Apakah Anda yakin ingin menghapus logo perusahaan?","Are you sure you want to delete the company logo?"],
      "cp-delete-logo-warning":["Logo yang dihapus tidak dapat dikembalikan.","A deleted logo cannot be restored."],
      "cp-delete-logo-cancel":["Batal","Cancel"],
      "cp-delete-logo-confirm-text":["Hapus Logo","Delete Logo"]
    };
    for(const [id,pair] of Object.entries(labels)){const el=this.el(id);if(el && !(id==="cp-logo-upload"&&el.disabled))el.textContent=pair[en?1:0];}
    const img=this.el("cp-logo-preview");if(img)img.alt=en?"Company logo":"Logo perusahaan";
    const file=this.el("cp-logo-file");if(file){file.setAttribute("aria-label",en?"Choose company logo file":"Pilih file logo perusahaan");file.lang=en?"en":"id";}
    const close=this.root.querySelector("#cp-delete-logo-modal .btn-close");if(close)close.setAttribute("aria-label",en?"Close":"Tutup");
    const status=this.el("cp-logo-status");
    if(status){const pairs=[
      ["Logo berhasil diunggah dan akan tampil pada Invoice AR.","Logo uploaded successfully and will appear on AR invoices."],
      ["Logo perusahaan berhasil dihapus.","Company logo deleted successfully."],
      ["Pilih file logo terlebih dahulu.","Select a logo first."]
    ];for(const [idText,enText] of pairs){if(status.textContent===idText||status.textContent===enText){status.textContent=en?enText:idText;break;}}}
    const staticPairs=[
      ["Profil Perusahaan","Company Profile"],["Identitas, legalitas, rekening bank dan penandatangan Invoice AR","Identity, legal information, bank accounts and AR invoice signatory"],
      ["Simpan Profil","Save Profile"],["Identitas dan Kontak","Identity and Contact"],["Kode Perusahaan","Company Code"],["Nama Perusahaan","Company Name"],["Nama Legal","Legal Name"],["Telepon","Phone"],["Alamat Perusahaan","Company Address"],
      ["Legalitas dan Informasi Tambahan","Legal and Additional Information"],["Bidang Usaha","Business Sector"],["Kota","City"],["Provinsi","Province"],["Kode Pos","Postal Code"],["Negara","Country"],["Alamat Legal","Legal Address"],["Alamat Operasional","Operational Address"],["Pengusaha Kena Pajak (PKP)","Taxable Entrepreneur (PKP)"],
      ["Branding Dokumen","Document Branding"],["Kop / Header Dokumen","Document Header"],["Footer Dokumen","Document Footer"],["Penandatangan Invoice AR (Manual)","AR Invoice Signatory (Manual)"],["Pengguna Aktif","Active User"],["Jabatan pada Invoice","Position on Invoice"],
      ["Cetakan Invoice AR menyediakan ruang kosong untuk tanda tangan manual. Tidak menggunakan gambar tanda tangan.","AR invoice prints include a blank space for a handwritten signature. No signature image is used."],
      ["Rekening Bank Perusahaan","Company Bank Accounts"],["Tambah Rekening","Add Bank Account"],["Hanya satu rekening aktif dapat ditetapkan sebagai rekening utama.","Only one active bank account can be set as primary."],["Pengaturan Akuntansi (Baca Saja)","Accounting Settings (Read Only)"],
      ["PNG, JPG, WebP · Maks. 2 MB","PNG, JPG, WebP · Max. 2 MB"]
    ];
    const lookup=new Map();for(const [idText,enText] of staticPairs){lookup.set(idText,en?enText:idText);lookup.set(enText,en?enText:idText);}
    const walker=document.createTreeWalker(this.root,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){if(node.parentElement?.closest("#cp-delete-logo-modal")||node.parentElement?.closest("#cp-logo-status"))continue;const value=node.nodeValue.trim();if(lookup.has(value))node.nodeValue=node.nodeValue.replace(value,lookup.get(value));}
    const choose=this.el("cp-logo-file");if(choose){const label=this.root.querySelector('label[for="cp-logo-file"]');if(label)label.textContent=en?"Choose File":"Pilih File";}
        this.bankModalLanguage();if(this.data)this.renderBanks();this.setRefreshLoading(!!this._refreshing);
  }
  populateProfile(){const {company:c,profile:p,settings:s,users}=this.data;if(!c)throw new Error("Data perusahaan tidak ditemukan");
    for(const [id,v] of Object.entries({"cp-code":c.company_code,"cp-name":c.company_name,"cp-legal":c.legal_name,"cp-email":c.email,"cp-phone":c.phone,"cp-address":c.address,"cp-sector":p?.business_sector,"cp-npwp":p?.npwp,"cp-nib":p?.nib,"cp-website":p?.website,"cp-city":p?.city,"cp-province":p?.province,"cp-postal":p?.postal_code,"cp-country":p?.country||"Indonesia","cp-legal-address":p?.legal_address,"cp-operational-address":p?.operational_address,"cp-header":p?.document_header,"cp-footer":p?.document_footer,"cp-position":p?.signer_position}))this.set(id,v);
    this.el("cp-pkp").checked=!!p?.is_pkp;
    this.renderLogo(s?.logo_url||null);this.el("cp-logo-upload").disabled=!this.data.canEdit;this.el("cp-logo-delete").disabled=!this.data.canEdit;this.el("cp-logo-file").disabled=!this.data.canEdit;
    const select=this.el("cp-signer");select.replaceChildren(new Option("— Pilih penandatangan —",""));users.forEach(u=>select.add(new Option(u.full_name,u.user_uid)));this.set("cp-signer",p?.signer_user_uid||"");
    this.el("cp-accounting").textContent=`Mata uang: ${s?.base_currency||"-"} | Tahun fiskal mulai bulan: ${s?.fiscal_year_start_month||"-"} | Zona waktu: ${s?.timezone||"-"}`;
    if(!this.data.canEdit){this.root.querySelectorAll("input:not([disabled]),textarea,select,button:not(#cp-refresh)").forEach(e=>e.disabled=true);this.notice("Akses baca saja: hanya Manager atau Super Admin yang berwenang dapat mengubah profil.");}
    this.renderBanks();this.applyLanguage();this.bankModalLanguage();
  }
  async save(){if(!this.data.canEdit)return;const npwp=this.val("cp-npwp");if(npwp&&!/^\d{16}$/.test(npwp)){this.notice("NPWP harus 16 digit angka.",true);return;}
    const company={company_name:this.val("cp-name"),legal_name:this.val("cp-legal")||null,email:this.val("cp-email")||null,phone:this.val("cp-phone")||null,address:this.val("cp-address")||null};if(!company.company_name){this.notice("Nama perusahaan wajib diisi.",true);return;}
    const profile={business_sector:this.val("cp-sector")||null,npwp:npwp||null,nib:this.val("cp-nib")||null,is_pkp:this.el("cp-pkp").checked,website:this.val("cp-website")||null,city:this.val("cp-city")||null,province:this.val("cp-province")||null,postal_code:this.val("cp-postal")||null,country:this.val("cp-country")||"Indonesia",legal_address:this.val("cp-legal-address")||null,operational_address:this.val("cp-operational-address")||null,document_header:this.val("cp-header")||null,document_footer:this.val("cp-footer")||null,signer_user_uid:this.val("cp-signer")||null,signer_position:this.val("cp-position")||null};
    try{this.el("cp-save").disabled=true;await Service.saveCompany(this.data.id,company);await Service.saveProfile(this.data.id,profile);const verified=await Service.load();if(!verified.company||verified.company.company_name!==company.company_name)throw new Error("Nama perusahaan terbaru belum dapat diverifikasi.");this.data=verified;this.populateProfile();document.dispatchEvent(new CustomEvent("finova:company-profile-saved",{detail:{companyId:verified.id,companyName:verified.company.company_name,companyCode:verified.company.company_code}}));this.showSaveToast();}catch(e){this.notice("Gagal menyimpan: "+e.message,true);}finally{this.el("cp-save").disabled=!this.data.canEdit;}
  }
  renderBanks(){
    const en=this.isEnglish(),root=this.el("cp-banks");root.replaceChildren();
    const table=document.createElement("table");table.className="table table-sm table-striped align-middle";
    const thead=document.createElement("thead"),head=document.createElement("tr");
    for(const title of (en?["Bank","Account Number","Account Holder","Currency","Status","Actions"]:["Bank","Nomor Rekening","Atas Nama","Mata Uang","Status","Aksi"])){const th=document.createElement("th");th.textContent=title;head.append(th);}thead.append(head);table.append(thead);
    const tbody=document.createElement("tbody");
    for(const b of this.data.banks){const tr=document.createElement("tr"),bank=this.data.bankMaster.find(x=>String(x.id)===String(b.bank_id));
      for(const value of [bank?.bank_name||String(b.bank_id),b.account_number,b.account_name,b.currency,b.is_default?(en?"Primary":"Utama"):b.is_active?(en?"Active":"Aktif"):(en?"Inactive":"Nonaktif")]){const td=document.createElement("td");td.textContent=value||"-";tr.append(td);}
      const actions=document.createElement("td");if(this.data.canEdit){if(!b.is_default&&b.is_active){const btn=document.createElement("button");btn.className="btn btn-sm btn-outline-primary me-1";btn.textContent=en?"Set as Primary":"Jadikan Utama";btn.onclick=()=>this.makeDefault(b.id);actions.append(btn);}const del=document.createElement("button");del.className="btn btn-sm btn-outline-danger";del.textContent=en?"Delete":"Hapus";del.onclick=()=>this.deleteBank(b.id);actions.append(del);}tr.append(actions);tbody.append(tr);
    }table.append(tbody);root.append(table);
  }
  bankModalLanguage(){const en=this.isEnglish();const labels={"cp-bank-title":["Tambah Rekening Bank","Add Bank Account"],"cp-bank-select-label":["Nama Bank","Bank Name"],"cp-bank-number-label":["Nomor Rekening","Account Number"],"cp-bank-holder-label":["Atas Nama","Account Holder"],"cp-bank-currency-label":["Mata Uang","Currency"],"cp-bank-default-label":["Rekening Utama","Primary Account"],"cp-bank-cancel":["Batal","Cancel"],"cp-bank-submit":["Simpan Rekening","Save Account"]};for(const [id,pair] of Object.entries(labels)){const el=this.el(id);if(el)el.textContent=pair[en?1:0];}}
  addBank(){if(!this.data?.canEdit)return;const en=this.isEnglish(),select=this.el("cp-bank-select");select.replaceChildren(new Option(en?"— Select bank —":"— Pilih bank —",""));for(const bank of this.data.bankMaster)select.add(new Option(bank.bank_name,String(bank.id)));this.el("cp-bank-form").reset();this.el("cp-bank-error").textContent="";this.el("cp-bank-default").checked=!this.data.banks.some(b=>b.is_default);this.bankModalLanguage();if(!window.bootstrap?.Modal){this.notice(en?"Bootstrap modal is unavailable.":"Bootstrap modal tidak tersedia.",true);return;}window.bootstrap.Modal.getOrCreateInstance(this.el("cp-bank-modal")).show();}
  async submitBank(){if(!this.data?.canEdit)return;const en=this.isEnglish(),select=this.el("cp-bank-select"),bank=this.data.bankMaster.find(b=>String(b.id)===select.value),number=this.val("cp-bank-number"),holder=this.val("cp-bank-holder"),currency=this.val("cp-bank-currency"),primary=this.el("cp-bank-default").checked,submit=this.el("cp-bank-submit"),error=this.el("cp-bank-error");error.textContent="";if(!bank||!number||!holder){error.textContent=en?"Complete all required fields.":"Lengkapi semua kolom wajib.";return;}
    submit.disabled=true;try{
      // Add non-primary first; promote only after successful insertion.
      await Service.addBank(this.data.id,{bank_id:bank.id,account_number:number,account_name:holder,currency,is_active:true,is_default:false});
      if(primary){const latest=await Service.load(),added=[...latest.banks].reverse().find(b=>String(b.bank_id)===String(bank.id)&&b.account_number===number&&b.account_name===holder&&!b.is_default);if(added){const old=latest.banks.find(b=>b.is_default);if(old)await Service.updateBank(this.data.id,old.id,{is_default:false});await Service.updateBank(this.data.id,added.id,{is_default:true});}}
      window.bootstrap.Modal.getOrCreateInstance(this.el("cp-bank-modal")).hide();await this.refresh();this.notice(en?"Bank account added successfully.":"Rekening bank berhasil ditambahkan.");
    }catch(e){error.textContent=(en?"Failed to save: ":"Gagal menyimpan: ")+e.message;await this.refresh();}finally{submit.disabled=false;}
  }

  async makeDefault(bankId){if(!this.data.canEdit)return;try{const old=this.data.banks.find(b=>b.is_default);if(old&&old.id!==bankId)await Service.updateBank(this.data.id,old.id,{is_default:false});await Service.updateBank(this.data.id,bankId,{is_default:true});await this.refresh();this.notice("Rekening utama diperbarui.");}catch(e){this.notice("Perubahan rekening utama gagal: "+e.message,true);await this.refresh();}}
  async deleteBank(id){if(!this.data.canEdit||!window.confirm("Hapus rekening bank perusahaan ini?"))return;try{await Service.deleteBank(this.data.id,id);await this.refresh();this.notice("Rekening berhasil dihapus.");}catch(e){this.notice(e.message,true);}}
}

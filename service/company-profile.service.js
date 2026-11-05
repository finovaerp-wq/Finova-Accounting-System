import { supabase } from "../assets/js/core/supabase.js";
import { TenantContext } from "../assets/js/core/tenant-context.js";
export class CompanyProfileService {
  static async companyId() { const id=await TenantContext.getCompanyId({refresh:true}); if(!id) throw new Error("Perusahaan aktif tidak ditemukan"); return id; }
  static async one(table,companyId) { const {data,error}=await supabase.from(table).select("*").eq(table==="finova_companies"?"id":"company_id",companyId).maybeSingle();if(error)throw error;return data; }
  static async load() {
    const id=await this.companyId();
    const [company,settings,profile]=await Promise.all([this.one("finova_companies",id),this.one("finova_company_settings",id),this.one("finova_company_profiles",id)]);
    const banks=await supabase.from("finova_company_bank_accounts").select("*").eq("company_id",id).order("created_at");if(banks.error)throw banks.error;
    const bankMaster=await supabase.from("mst_bank").select("id,bank_name,is_active").eq("is_active",true).order("bank_name");if(bankMaster.error)throw bankMaster.error;
    const members=await supabase.from("finova_company_users").select("user_uid,role,status").eq("company_id",id).eq("status","ACTIVE");if(members.error)throw members.error;
    const ids=members.data.map(m=>m.user_uid);
    let users=[];
    if(ids.length){const res=await supabase.from("mst_users").select("user_uid,full_name,status").in("user_uid",ids).eq("status",true);if(res.error)throw res.error;users=res.data||[];}
    const auth=await supabase.auth.getUser();if(auth.error)throw auth.error;
    const member=members.data.find(m=>m.user_uid===auth.data.user?.id);
    return {id,company,settings,profile,banks:banks.data||[],bankMaster:bankMaster.data||[],users,canEdit:member?.role==="Manager"||member?.role==="Super Admin"};
  }
  static async uploadLogo(companyId,file) {
    if(!file || !["image/png","image/jpeg","image/webp"].includes(file.type)) throw new Error("Format logo harus PNG, JPG, atau WebP.");
    if(file.size>2*1024*1024) throw new Error("Ukuran logo maksimal 2 MB.");
    const ext={"image/png":"png","image/jpeg":"jpg","image/webp":"webp"}[file.type];
    const path=`${companyId}/logo-${crypto.randomUUID()}.${ext}`;
    const uploaded=await supabase.storage.from("finova-company-logos").upload(path,file,{contentType:file.type,upsert:false,cacheControl:"3600"});
    if(uploaded.error)throw uploaded.error;
    const url=supabase.storage.from("finova-company-logos").getPublicUrl(path).data.publicUrl;
    const updated=await supabase.from("finova_company_settings").update({logo_url:url}).eq("company_id",companyId).select("logo_url").single();
    if(updated.error){await supabase.storage.from("finova-company-logos").remove([path]);throw updated.error;}
    return url;
  }
  static async removeLogo(companyId) {
    const updated=await supabase.from("finova_company_settings").update({logo_url:null}).eq("company_id",companyId).select("logo_url").single();
    if(updated.error)throw updated.error;
  }
  static async saveCompany(id,payload){const {error}=await supabase.from("finova_companies").update(payload).eq("id",id);if(error)throw error;}
  static async saveProfile(id,payload){const {error}=await supabase.from("finova_company_profiles").upsert({company_id:id,...payload},{onConflict:"company_id"});if(error)throw error;}
  static async addBank(id,payload){const {error}=await supabase.from("finova_company_bank_accounts").insert({company_id:id,...payload});if(error)throw error;}
  static async updateBank(id,bankId,payload){const {error}=await supabase.from("finova_company_bank_accounts").update(payload).eq("company_id",id).eq("id",bankId);if(error)throw error;}
  static async deleteBank(id,bankId){const {error}=await supabase.from("finova_company_bank_accounts").delete().eq("company_id",id).eq("id",bankId);if(error)throw error;}
}

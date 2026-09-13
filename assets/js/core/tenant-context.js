/*
==========================================================
FINOVA TENANT CONTEXT
Tahap 2 foundation - not yet enforced on accounting tables.
==========================================================
*/
import { supabase } from "./supabase.js";

export class TenantContext {
    static cache = undefined;

    static async getCompanyId({ refresh = false } = {}) {
        if (!refresh && this.cache !== undefined) return this.cache;
        const { data, error } = await supabase.rpc("finova_current_company_id");
        if (error) throw error;
        this.cache = data ?? null;
        return this.cache;
    }

    static clear() { this.cache = undefined; }
}

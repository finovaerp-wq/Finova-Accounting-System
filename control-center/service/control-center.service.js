/*
==========================================================
FINOVA CONTROL CENTER SERVICE
Tahap 2 - SaaS Database Foundation
==========================================================
*/
import { supabase } from "../../assets/js/core/supabase.js";

export class ControlCenterService {
    static async getCurrentUser() {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data?.user ?? null;
    }

    static async requireSuperAdmin() {
        const user = await this.getCurrentUser();
        if (!user) throw new Error("AUTH_REQUIRED");

        const { data, error } = await supabase
            .from("finova_super_admins")
            .select("user_uid, full_name, is_active")
            .eq("user_uid", user.id)
            .eq("is_active", true)
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("SUPER_ADMIN_REQUIRED");
        return { user, admin: data };
    }

    static async getCompanies() {
        const { data, error } = await supabase
            .from("finova_companies")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data ?? [];
    }

    static async createCompany(values) {
        const payload = {
            company_code: String(values.company_code || "").trim().toUpperCase(),
            company_name: String(values.company_name || "").trim(),
            legal_name: String(values.legal_name || "").trim() || null,
            email: String(values.email || "").trim().toLowerCase() || null,
            phone: String(values.phone || "").trim() || null,
            max_users: Number(values.max_users || 5),
            status: values.status || "ACTIVE"
        };
        const { data, error } = await supabase
            .from("finova_companies")
            .insert(payload)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async setCompanyStatus(companyId, status) {
        const { data, error } = await supabase
            .from("finova_companies")
            .update({ status })
            .eq("id", companyId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async getPlans() {
        const { data, error } = await supabase
            .from("finova_plans")
            .select("*")
            .eq("is_active", true)
            .order("price", { ascending: true });
        if (error) throw error;
        return data ?? [];
    }

    static async getSubscriptions() {
        const { data, error } = await supabase
            .from("finova_subscriptions")
            .select(`
                id, company_id, plan_id, start_date, end_date, amount,
                payment_status, status, notes, created_at,
                finova_companies(company_code, company_name),
                finova_plans(plan_code, plan_name, billing_cycle)
            `)
            .order("end_date", { ascending: true });
        if (error) throw error;
        return data ?? [];
    }

    static async createSubscription(values) {
        const { data, error } = await supabase
            .from("finova_subscriptions")
            .insert({
                company_id: values.company_id,
                plan_id: values.plan_id,
                start_date: values.start_date,
                end_date: values.end_date,
                amount: Number(values.amount || 0),
                payment_status: values.payment_status || "PAID",
                status: "ACTIVE",
                notes: String(values.notes || "").trim() || null
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async listUsers() {
        const { data, error } = await supabase.rpc("finova_admin_list_users");
        if (error) throw error;
        return data ?? [];
    }

    static async assignUser(email, companyId, role) {
        const { data, error } = await supabase.rpc("finova_admin_assign_user", {
            p_email: String(email || "").trim().toLowerCase(),
            p_company_id: companyId,
            p_role: role || "STAFF"
        });
        if (error) throw error;
        return data;
    }

    static async getDashboardData() {
        const [companies, subscriptions, users] = await Promise.all([
            this.getCompanies(),
            this.getSubscriptions(),
            this.listUsers()
        ]);
        const activeCompanies = companies.filter(x => x.status === "ACTIVE");
        const activeUsers = users.filter(x => x.company_id && x.membership_status === "ACTIVE");
        const now = new Date();
        const in30 = new Date(now.getTime() + 30 * 86400000);
        const activeSubscriptions = subscriptions.filter(x => x.status === "ACTIVE");
        const expiring = activeSubscriptions.filter(x => {
            const d = new Date(`${x.end_date}T00:00:00`);
            return d >= new Date(now.toDateString()) && d <= in30;
        });
        let mrr = 0;
        for (const s of activeSubscriptions) {
            if (s.payment_status === "CANCELLED") continue;
            const cycle = s.finova_plans?.billing_cycle;
            mrr += cycle === "ANNUAL" ? Number(s.amount || 0) / 12 : Number(s.amount || 0);
        }
        return { companies, subscriptions, users, activeCompanies, activeUsers, expiring, mrr };
    }
}

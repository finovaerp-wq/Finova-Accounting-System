/*
==========================================================
FINOVA ACCOUNTING SYSTEM
Business Partner Bank Service
Version : 1.1.0
==========================================================
*/

import {
    supabase,
    TABLE
} from "../assets/js/core/supabase.js";

export class BusinessPartnerBankService {

    static async getByBusinessPartner(bpId) {
        const { data, error } = await supabase
            .from(TABLE.BUSINESS_PARTNER_BANK)
            .select(`
                *,
                mst_bank (
                    id,
                    bank_code,
                    bank_name
                )
            `)
            .eq("bp_id", bpId)
            .eq("is_active", true)
            .order("is_primary", { ascending: false })
            .order("id", { ascending: true });
        if (error) {
            console.error("BusinessPartnerBankService.getByBusinessPartner:", error);
            throw error;
        }
        return data || [];
    }

    static async getById(id) {
        const { data, error } = await supabase
            .from(TABLE.BUSINESS_PARTNER_BANK)
            .select(`
                *,
                mst_bank (
                    id,
                    bank_code,
                    bank_name
                )
            `)
            .eq("id", id)
            .single();
        if (error) {
            console.error("BusinessPartnerBankService.getById:", error);
            throw error;
        }
        return data;
    }

    static async insert(payload) {
        const insertPayload = {
            bp_id: payload.bp_id,
            bank_id: payload.bank_id,
            account_name: payload.account_name,
            account_number: payload.account_number,
            branch_name: payload.branch_name ?? null,
            currency: payload.currency ?? "IDR",
            is_primary: payload.is_primary ?? false,
            is_active: payload.is_active ?? true,
            remarks: payload.remarks ?? null
        };
        const { data, error } = await supabase
            .from(TABLE.BUSINESS_PARTNER_BANK)
            .insert([insertPayload])
            .select()
            .single();
        if (error) {
            console.error("BusinessPartnerBankService.insert:", error);
            throw error;
        }
        return data;
    }

    static async update(id, payload) {
        const updatePayload = {
            bank_id: payload.bank_id,
            account_name: payload.account_name,
            account_number: payload.account_number,
            branch_name: payload.branch_name ?? null,
            currency: payload.currency ?? "IDR",
            is_primary: payload.is_primary ?? false,
            is_active: payload.is_active ?? true,
            remarks: payload.remarks ?? null,
            updated_at: new Date().toISOString()
        };
        const { data, error } = await supabase
            .from(TABLE.BUSINESS_PARTNER_BANK)
            .update(updatePayload)
            .eq("id", id)
            .select()
            .single();
        if (error) {
            console.error("BusinessPartnerBankService.update:", error);
            throw error;
        }
        return data;
    }

    static async delete(id) {
        const { error } = await supabase
            .from(TABLE.BUSINESS_PARTNER_BANK)
            .delete()
            .eq("id", id);
        if (error) {
            console.error("BusinessPartnerBankService.delete:", error);
            throw error;
        }
        return true;
    }

    static async deleteByBusinessPartner(bpId) {
        const { error } = await supabase
            .from(TABLE.BUSINESS_PARTNER_BANK)
            .delete()
            .eq("bp_id", bpId);
        if (error) {
            console.error("BusinessPartnerBankService.deleteByBusinessPartner:", error);
            throw error;
        }
        return true;
    }

    static async saveBanks(bpId, banks) {
        await this.deleteByBusinessPartner(bpId);
        if (!Array.isArray(banks) || banks.length === 0) {
            return true;
        }
        // If there is only one bank, automatically make it the primary/default bank.
        if (banks.length === 1) {
            banks[0].is_default = true;
        } else if (!banks.some(bank => bank.is_default === true)) {
            banks[0].is_default = true;
        }

        const payload = banks.map(bank => ({
            bp_id: bpId,
            bank_id: bank.bank_id,
            account_name: bank.account_name,
            account_number: bank.account_number,
            branch_name: bank.branch ?? null,
            currency: bank.currency ?? "IDR",
            is_primary: bank.is_default === true,
            is_active: bank.status !== false,
            remarks: bank.purpose ?? null
        }));
        const { error } = await supabase
            .from(TABLE.BUSINESS_PARTNER_BANK)
            .insert(payload);
        if (error) {
            console.error("BusinessPartnerBankService.saveBanks:", error);
            throw error;
        }
        return true;
    }
}

'use server';

import { supabase, FIXED_USER_ID } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

export interface ConditionLog {
    id: string;
    user_id: string;
    condition_type: 'fatigue' | 'swelling' | 'good';
    note?: string;
    log_date: string; // YYYY-MM-DD
    created_at: string;
}

export type ConditionType = 'fatigue' | 'swelling' | 'good';

export async function upsertConditionLog(
    conditionType: ConditionType,
    note?: string
) {
    try {
        const today = new Date();
        const logDate = format(today, 'yyyy-MM-dd');

        const { data, error } = await supabase
            .from('condition_logs')
            .upsert(
                {
                    user_id: FIXED_USER_ID,
                    condition_type: conditionType,
                    note,
                    log_date: logDate,
                },
                { onConflict: 'user_id, log_date' }
            )
            .select()
            .single();

        if (error) {
            console.error('Error upserting condition log:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/');
        return { success: true, data };
    } catch (error) {
        console.error('Unexpected error upserting condition log:', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function getConditionByDate(date: Date) {
    try {
        const logDate = format(date, 'yyyy-MM-dd');

        const { data, error } = await supabase
            .from('condition_logs')
            .select('*')
            .eq('user_id', FIXED_USER_ID)
            .eq('log_date', logDate)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is acceptable
            console.error('Error fetching condition log:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data as ConditionLog | null };
    } catch (error) {
        console.error('Unexpected error fetching condition log:', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function getConditionsByDateRange(startDate: Date, endDate: Date) {
    try {
        const start = format(startDate, 'yyyy-MM-dd');
        const end = format(endDate, 'yyyy-MM-dd');

        const { data, error } = await supabase
            .from('condition_logs')
            .select('*')
            .eq('user_id', FIXED_USER_ID)
            .gte('log_date', start)
            .lte('log_date', end)
            .order('log_date', { ascending: false });

        if (error) {
            console.error('Error fetching condition logs by range:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data as ConditionLog[] };
    } catch (error) {
        console.error('Unexpected error fetching condition logs by range:', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

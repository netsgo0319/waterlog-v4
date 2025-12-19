'use server';

import { supabase, FIXED_USER_ID } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

export interface IntakeLog {
    id: string;
    user_id: string;
    level: 'high' | 'medium' | 'low';
    recorded_at: string; // ISO string
    created_at: string;
}

export type IntakeLevel = 'high' | 'medium' | 'low';

export async function createIntakeLog(level: IntakeLevel) {
    try {
        const { data, error } = await supabase
            .from('intake_logs')
            .insert({
                user_id: FIXED_USER_ID, // MVP용 고정 ID
                level,
                recorded_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating intake log:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/'); // 홈 화면 갱신
        return { success: true, data };
    } catch (error) {
        console.error('Unexpected error creating intake log:', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function getIntakeLogsByDate(date: Date) {
    try {
        // 해당 날짜의 00:00:00 ~ 23:59:59 범위 설정
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
            .from('intake_logs')
            .select('*')
            .eq('user_id', FIXED_USER_ID)
            .gte('recorded_at', startOfDay.toISOString())
            .lte('recorded_at', endOfDay.toISOString())
            .order('recorded_at', { ascending: false });

        if (error) {
            console.error('Error fetching intake logs:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data as IntakeLog[] };
    } catch (error) {
        console.error('Unexpected error fetching intake logs:', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function deleteIntakeLog(id: string) {
    try {
        const { error } = await supabase
            .from('intake_logs')
            .delete()
            .eq('id', id)
            .eq('user_id', FIXED_USER_ID); // 본인 것만 삭제 가능하도록

        if (error) {
            console.error('Error deleting intake log:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Unexpected error deleting intake log:', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function getIntakeLogsByDateRange(startDate: Date, endDate: Date) {
    try {
        const start = startDate.toISOString();
        const end = endDate.toISOString();

        const { data, error } = await supabase
            .from('intake_logs')
            .select('*')
            .eq('user_id', FIXED_USER_ID)
            .gte('recorded_at', start)
            .lte('recorded_at', end)
            .order('recorded_at', { ascending: false });

        if (error) {
            console.error('Error fetching intake logs by range:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data as IntakeLog[] };
    } catch (error) {
        console.error('Unexpected error fetching intake logs by range:', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

'use server';

import { supabase, FIXED_USER_ID } from '@/lib/supabase';
import { generateReportContent } from '@/lib/ai/gemini';
import { getIntakeLogsByDateRange, IntakeLog } from './intake';
import { getConditionsByDateRange, ConditionLog } from './condition';
import { revalidatePath } from 'next/cache';
import { differenceInDays } from 'date-fns';

export interface AIReport {
    id: string;
    user_id: string;
    content: string;
    start_date: string;
    end_date: string;
    report_type: 'weekly' | 'manual';
    created_at: string;
}

export async function generateAIReport(
    startDate: Date,
    endDate: Date,
    reportType: 'weekly' | 'manual' = 'manual'
) {
    try {
        // 1. 데이터 검증 (최소 3일 간격 확인은 선택사항이나, 유의미한 분석을 위해 권장)
        // 여기서는 데이터 존재 여부를 더 중요하게 봅니다.

        // 2. 데이터 조회
        const intakeResult = await getIntakeLogsByDateRange(startDate, endDate);
        const conditionResult = await getConditionsByDateRange(startDate, endDate);

        if (!intakeResult.success || !conditionResult.success) {
            return { success: false, error: '데이터 조회에 실패했습니다.' };
        }

        const intakeLogs = intakeResult.data as IntakeLog[];
        const conditionLogs = conditionResult.data as ConditionLog[];

        // 데이터 충분 여부 확인 (예: 기록이 전무하면 리포트 생성 불가)
        if (intakeLogs.length === 0 && conditionLogs.length === 0) {
            return {
                success: false,
                error: '분석할 기록이 없습니다. 물 섭취나 컨디션을 먼저 기록해주세요.'
            };
        }

        // 3. Gemini API 호출
        const content = await generateReportContent(startDate, endDate, intakeLogs, conditionLogs);

        // 4. DB 저장
        const { data, error } = await supabase
            .from('ai_reports')
            .insert({
                user_id: FIXED_USER_ID,
                content,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                report_type: reportType,
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving report:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/reports');
        return { success: true, data };

    } catch (error) {
        console.error('Unexpected error generating report:', error);
        // Error 객체 처리
        const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        return { success: false, error: message };
    }
}

export async function getReportList() {
    try {
        const { data, error } = await supabase
            .from('ai_reports')
            .select('*')
            .eq('user_id', FIXED_USER_ID)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reports:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data as AIReport[] };
    } catch (error) {
        console.error('Unexpected error fetching reports:', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function getReportById(id: string) {
    try {
        const { data, error } = await supabase
            .from('ai_reports')
            .select('*')
            .eq('id', id)
            .eq('user_id', FIXED_USER_ID)
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data: data as AIReport };
    } catch (error) {
        return { success: false, error: 'Internal Server Error' };
    }
}

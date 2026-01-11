'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { generateAIReport } from '@/lib/gemini'
import { revalidatePath } from 'next/cache'

export async function generateReport(params?: {
    startDate?: Date
    endDate?: Date
}) {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 기본값: 최근 7일
    const endDate = params?.endDate || new Date()
    const startDate = params?.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // 물 섭취 데이터 조회
    const { data: intakeLogs } = await supabase
        .from('intake_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', startDate.toISOString())
        .lte('recorded_at', endDate.toISOString())
        .order('recorded_at', { ascending: true })

    // 컨디션 데이터 조회
    const { data: conditionLogs } = await supabase
        .from('condition_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', startDate.toISOString().split('T')[0])
        .lte('log_date', endDate.toISOString().split('T')[0])

    // 데이터 검증
    if (!intakeLogs || intakeLogs.length < 3) {
        throw new Error('최소 3일 이상의 물 섭취 기록이 필요합니다.')
    }

    // Gemini API 호출
    const reportContent = await generateAIReport({
        intakeLogs,
        conditionLogs: conditionLogs || [],
        startDate,
        endDate,
    })

    // 리포트 저장
    const { data: report, error } = await supabase
        .from('ai_reports')
        .insert({
            user_id: user.id,
            content: reportContent,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            report_type: 'weekly',
        })
        .select()
        .single()

    if (error) throw error

    revalidatePath('/reports')
    return report
}

export async function getReports() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.warn('No user session found')
        return []
    }

    const { data, error } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function getReportById(reportId: string) {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', user.id) // Ensure user owns the report
        .single()

    if (error) throw error
    return data
}

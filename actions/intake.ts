'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function createIntakeLog(data: {
    amountLevel: 'high' | 'medium' | 'low'
    recordedAt?: Date
}) {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        // 임시: 인증 구현 전이므로 테스트용 사용자 ID 사용
        // 실제 인증 구현 후에는 throw new Error('Unauthorized') 로 변경해야 합니다.
        console.warn('No user session found')
        throw new Error('Unauthorized')
    }

    const { data: log, error } = await supabase
        .from('intake_logs')
        .insert({
            user_id: user.id,
            amount_level: data.amountLevel,
            recorded_at: (data.recordedAt || new Date()).toISOString(),
        })
        .select()
        .single()

    if (error) throw error

    revalidatePath('/')
    return log
}

export async function getTodayIntakeLogs() {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.warn('No user session found')
        return []
    }

    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

    const { data, error } = await supabase
        .from('intake_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', startOfDay)
        .lte('recorded_at', endOfDay)
        .order('recorded_at', { ascending: false })

    if (error) throw error
    return data
}

export async function deleteIntakeLog(logId: string) {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
        .from('intake_logs')
        .delete()
        .eq('id', logId)

    if (error) throw error

    revalidatePath('/')
}

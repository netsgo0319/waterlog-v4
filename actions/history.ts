'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function getIntakeLogsByDateRange(
    startDate: Date,
    endDate: Date
) {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.warn('No user session found')
        return []
    }

    const { data, error } = await supabase
        .from('intake_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', startDate.toISOString())
        .lte('recorded_at', endDate.toISOString())
        .order('recorded_at', { ascending: false })

    if (error) throw error
    return data || []
}

export async function getIntakeLogsByMonth(year: number, month: number) {
    // month is 1-indexed (1 ~ 12)
    const date = new Date(year, month - 1, 1)
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    return getIntakeLogsByDateRange(start, end)
}

export async function getIntakeLogsByDate(date: Date) {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.warn('No user session found')
        return []
    }

    const startOfDay = new Date(date).setHours(0, 0, 0, 0)
    const endOfDay = new Date(date).setHours(23, 59, 59, 999)

    // Convert timestamps to ISO string for Supabase query
    const startIso = new Date(startOfDay).toISOString()
    const endIso = new Date(endOfDay).toISOString()

    const { data, error } = await supabase
        .from('intake_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', startIso)
        .lte('recorded_at', endIso)
        .order('recorded_at', { ascending: false })

    if (error) throw error
    return data || []
}

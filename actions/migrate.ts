'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

interface ParsedIntakeLog {
    amountLevel: 'high' | 'medium' | 'low'
    recordedAt: Date
}

function parseAmount(amountText: string): 'high' | 'medium' | 'low' {
    const normalized = amountText.toLowerCase().trim()
    
    if (normalized.includes('조금')) {
        return 'medium'
    }
    // "물 한잔", "물 두잔" 등은 모두 high로 처리
    if (normalized.includes('한잔') || normalized.includes('두잔') || normalized.includes('세잔')) {
        return 'high'
    }
    // 기본값은 medium
    return 'medium'
}

function parseTime(timeText: string): number {
    // "아침 9시" -> 9, "저녁 7시" -> 19
    const normalized = timeText.toLowerCase().trim()
    
    // 저녁 처리 (오후)
    if (normalized.includes('저녁') || normalized.includes('오후')) {
        const match = normalized.match(/(\d+)시/)
        if (match) {
            const hour = parseInt(match[1])
            // 저녁 7시는 19시
            return hour >= 7 && hour < 12 ? hour + 12 : hour
        }
    }
    
    // 아침 처리 (오전)
    if (normalized.includes('아침') || normalized.includes('오전')) {
        const match = normalized.match(/(\d+)시/)
        if (match) {
            return parseInt(match[1])
        }
    }
    
    // 단순 시간만 있는 경우
    const match = normalized.match(/(\d+)시/)
    if (match) {
        const hour = parseInt(match[1])
        // 12시 이후는 오후로 간주
        return hour < 7 ? hour : hour
    }
    
    return 9 // 기본값 아침 9시
}

function parseDateAndTime(dateText: string, timeText: string, baseYear: number = 2026): Date {
    // "1월 10일" -> 1월 10일
    const dateMatch = dateText.match(/(\d+)월\s*(\d+)일/)
    if (!dateMatch) {
        throw new Error(`Invalid date format: ${dateText}`)
    }
    
    const month = parseInt(dateMatch[1])
    const day = parseInt(dateMatch[2])
    const hour = parseTime(timeText)
    
    return new Date(baseYear, month - 1, day, hour, 0, 0)
}

function parseNotionContent(content: string, baseYear: number = 2026): ParsedIntakeLog[] {
    const logs: ParsedIntakeLog[] = []
    
    // 날짜별로 섹션 분리
    // 날짜 패턴을 찾아서 섹션 분리
    const datePattern = /(\d+월\s*\d+일)/g
    const sections: Array<{ date: string; content: string }> = []
    
    let lastIndex = 0
    let currentDate = ''
    let matches = Array.from(content.matchAll(datePattern))
    
    if (matches.length === 0) {
        return logs
    }
    
    for (let i = 0; i < matches.length; i++) {
        const match = matches[i]
        const date = match[1]
        const startIndex = match.index || 0
        
        if (i > 0) {
            const prevMatch = matches[i - 1]
            const prevEndIndex = (prevMatch.index || 0) + prevMatch[0].length
            sections.push({
                date: currentDate,
                content: content.substring(prevEndIndex, startIndex).trim()
            })
        }
        
        currentDate = date
    }
    
    // 마지막 섹션 처리
    if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1]
        const lastEndIndex = (lastMatch.index || 0) + lastMatch[0].length
        sections.push({
            date: currentDate,
            content: content.substring(lastEndIndex).trim()
        })
    }
    
    // 각 섹션 처리
    for (const section of sections) {
        if (!section.date || !section.content) continue
        
        const lines = section.content.split('\n').filter(line => line.trim().startsWith('-'))
        
        for (const line of lines) {
            // "- 아침 9시 물 한잔" 형식 파싱
            const trimmed = line.replace(/^-\s*/, '').trim()
            
            // "물" 키워드 위치 찾기
            const waterIndex = trimmed.indexOf('물')
            if (waterIndex === -1) continue
            
            const timeText = trimmed.substring(0, waterIndex).trim()
            const amountText = trimmed.substring(waterIndex).trim()
            
            try {
                const recordedAt = parseDateAndTime(section.date, timeText, baseYear)
                const amountLevel = parseAmount(amountText)
                
                logs.push({
                    amountLevel,
                    recordedAt,
                })
            } catch (error) {
                console.error(`Error parsing line: ${line}`, error)
            }
        }
    }
    
    return logs
}

export async function migrateNotionIntakeLogs(notionContent: string, baseYear: number = 2026) {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }
    
    // 데이터 파싱
    const parsedLogs = parseNotionContent(notionContent, baseYear)
    
    if (parsedLogs.length === 0) {
        return { success: false, message: 'No logs found to migrate', count: 0 }
    }
    
    // Supabase에 저장
    const logsToInsert = parsedLogs.map(log => ({
        user_id: user.id,
        amount_level: log.amountLevel,
        recorded_at: log.recordedAt.toISOString(),
    }))
    
    const { data, error } = await supabase
        .from('intake_logs')
        .insert(logsToInsert)
        .select()
    
    if (error) {
        console.error('Error inserting logs:', error)
        throw error
    }
    
    revalidatePath('/')
    revalidatePath('/history')
    
    return {
        success: true,
        message: `Successfully migrated ${data.length} logs`,
        count: data.length,
        logs: data,
    }
}

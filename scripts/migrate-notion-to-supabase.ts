/**
 * Notion에서 물마신 기록을 가져와서 Supabase에 저장하는 스크립트
 */

import { createServerSupabaseClient } from '@/lib/supabase'

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
    const dateSections = content.split(/(\d+월\s*\d+일)/).filter(Boolean)
    
    let currentDate = ''
    
    for (let i = 0; i < dateSections.length; i++) {
        const section = dateSections[i].trim()
        
        // 날짜 섹션인 경우
        if (section.match(/^\d+월\s*\d+일$/)) {
            currentDate = section
            continue
        }
        
        // 날짜가 설정되어 있지 않으면 건너뜀
        if (!currentDate) continue
        
        // 각 줄을 처리
        const lines = section.split('\n').filter(line => line.trim().startsWith('-'))
        
        for (const line of lines) {
            // "- 아침 9시 물 한잔" 형식 파싱
            const trimmed = line.replace(/^-\s*/, '').trim()
            
            // 시간과 물 섭취량 분리
            // 예: "아침 9시 물 한잔" -> time: "아침 9시", amount: "물 한잔"
            const timeMatch = trimmed.match(/^(아침|저녁|오전|오후)?\s*(\d+시)/)
            if (!timeMatch) continue
            
            const timeText = trimmed.substring(0, trimmed.indexOf('물')).trim()
            const amountText = trimmed.substring(trimmed.indexOf('물')).trim()
            
            try {
                const recordedAt = parseDateAndTime(currentDate, timeText, baseYear)
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

async function migrateNotionToSupabase() {
    console.log('Starting migration from Notion to Supabase...')
    
    // Notion 데이터 (실제 사용 시에는 Notion API로 가져와야 함)
    const notionContent = `1월 10일
- 아침 9시 물 한잔
- 저녁 7시 물 두잔

1월 11일
- 아침 7시 물 조금
- 아침 11시 물 두잔`
    
    // 데이터 파싱
    const parsedLogs = parseNotionContent(notionContent, 2026)
    console.log(`Parsed ${parsedLogs.length} logs:`)
    parsedLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.recordedAt.toISOString()} - ${log.amountLevel}`)
    })
    
    // Supabase에 저장
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        throw new Error('User not authenticated. Please login first.')
    }
    
    console.log(`\nSaving logs for user: ${user.id}`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const log of parsedLogs) {
        try {
            const { data, error } = await supabase
                .from('intake_logs')
                .insert({
                    user_id: user.id,
                    amount_level: log.amountLevel,
                    recorded_at: log.recordedAt.toISOString(),
                })
                .select()
                .single()
            
            if (error) {
                console.error(`Error inserting log at ${log.recordedAt.toISOString()}:`, error.message)
                errorCount++
            } else {
                console.log(`✓ Saved: ${log.recordedAt.toISOString()} - ${log.amountLevel}`)
                successCount++
            }
        } catch (error) {
            console.error(`Error processing log at ${log.recordedAt.toISOString()}:`, error)
            errorCount++
        }
    }
    
    console.log(`\nMigration completed!`)
    console.log(`  Success: ${successCount}`)
    console.log(`  Errors: ${errorCount}`)
}

// 스크립트 실행
if (require.main === module) {
    migrateNotionToSupabase().catch(console.error)
}

export { migrateNotionToSupabase, parseNotionContent }

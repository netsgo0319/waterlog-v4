# History 작업 계획

## 작업 개요

**역할**: History Agent  
**목적**: 과거 물 섭취 기록 조회 기능 구현 (읽기 전용)  
**병렬성**: ✅ Intake, Report와 병렬 작업 가능  
**의존성**: Foundation 완료 필수

---

## 작업 범위

### 포함 사항
- ✅ Server Actions 구현 (`actions/history.ts`)
- ✅ 기간별 물 섭취 기록 조회 (getIntakeLogsByDateRange)
- ✅ 월별 물 섭취 기록 조회 (getIntakeLogsByMonth)
- ✅ 특정 날짜의 물 섭취 기록 조회 (getIntakeLogsByDate)
- ✅ 프론트엔드 컴포넌트 연동
  - `components/features/history/calendar-view.tsx`

### 제외 사항
- ❌ `lib/supabase.ts` 수정 (읽기 전용 사용)
- ❌ `actions/intake.ts`, `actions/report.ts` 수정
- ❌ 데이터 생성/수정/삭제 (읽기 전용 작업)
- ❌ AI 리포트 관련 코드

---

## 필수 참고 문서

1. **docs/user_stories.md**: US-004 ~ US-006 (기록 조회 관련)
2. **docs/software_design.md**: 
   - "History" 관련 API 설계
   - "데이터베이스 설계 - intake_logs" 테이블
3. **docs/tasks/task-integration-guide.md**: History 프론트엔드 연동 가이드

---

## 필수 참고 파일

- `lib/supabase.ts` (읽기 전용)
- `components/features/history/calendar-view.tsx` (연동 대상)

---

## 상세 체크리스트

### 1. Server Actions 파일 생성
- [ ] `actions/history.ts` 파일 생성
- [ ] `"use server"` 지시자 추가 (필수)
- [ ] 필요한 임포트 추가
  ```typescript
  'use server'
  
  import { createServerSupabaseClient } from '@/lib/supabase'
  import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'
  ```

### 2. getIntakeLogsByDateRange 함수 구현
- [ ] 함수 시그니처 정의
  ```typescript
  export async function getIntakeLogsByDateRange(
    startDate: Date,
    endDate: Date
  )
  ```
- [ ] Supabase 클라이언트 생성
- [ ] 현재 사용자 확인
- [ ] `intake_logs` 테이블에서 기간 내 기록 SELECT
- [ ] `recorded_at` 기준 내림차순 정렬
- [ ] 에러 핸들링
- [ ] 기록 목록 반환

### 3. getIntakeLogsByMonth 함수 구현
- [ ] 함수 시그니처 정의
  ```typescript
  export async function getIntakeLogsByMonth(year: number, month: number)
  ```
- [ ] `date-fns`를 사용하여 월의 시작/끝 날짜 계산
- [ ] `getIntakeLogsByDateRange` 재사용
- [ ] 에러 핸들링
- [ ] 기록 목록 반환

### 4. getIntakeLogsByDate 함수 구현 (선택)
- [ ] 함수 시그니처 정의
  ```typescript
  export async function getIntakeLogsByDate(date: Date)
  ```
- [ ] 특정 날짜의 00:00:00 ~ 23:59:59 기록 조회
- [ ] 에러 핸들링
- [ ] 기록 목록 반환

### 5. 날짜별 집계 함수 구현 (선택)
- [ ] 날짜별 기록 횟수 집계
  ```typescript
  export async function getIntakeSummaryByMonth(year: number, month: number)
  ```
- [ ] 캘린더 뷰에서 사용할 수 있도록 날짜별로 그룹핑

### 6. 프론트엔드 연동 - calendar-view.tsx
- [ ] `components/features/history/calendar-view.tsx` 파일 열기
- [ ] Server Actions 임포트
  ```typescript
  import { getIntakeLogsByMonth } from "@/actions/history"
  ```
- [ ] 컴포넌트를 Server Component로 변경하거나 `useEffect`로 데이터 fetch
- [ ] 월별 데이터 표시
- [ ] 날짜 클릭 시 해당 날짜의 상세 기록 표시

### 7. date-fns 의존성 확인
- [ ] `package.json`에 `date-fns` 포함 여부 확인
- [ ] 없으면 설치: `npm install date-fns`

---

## 완료 조건

### 필수 조건
1. ✅ `actions/history.ts` 파일 생성 완료
2. ✅ `getIntakeLogsByDateRange`, `getIntakeLogsByMonth` 함수 구현
3. ✅ `calendar-view.tsx`에서 월별 기록 조회 동작
4. ✅ 브라우저에서 `/history` 페이지 기능 검증

### 검증 방법
1. 브라우저에서 `http://localhost:3000/history` 접속
2. 캘린더에 이전에 기록한 물 섭취 데이터가 표시되는지 확인
3. 월을 변경했을 때 해당 월의 데이터가 로드되는지 확인
4. 날짜를 클릭했을 때 상세 기록이 표시되는지 확인

---

## 코드 예시

### actions/history.ts (전체)
```typescript
'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function getIntakeLogsByDateRange(
  startDate: Date,
  endDate: Date
) {
  const supabase = createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
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
  const date = new Date(year, month - 1, 1)
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  
  return getIntakeLogsByDateRange(start, end)
}

export async function getIntakeLogsByDate(date: Date) {
  const supabase = createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString()
  const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString()
  
  const { data, error } = await supabase
    .from('intake_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('recorded_at', startOfDay)
    .lte('recorded_at', endOfDay)
    .order('recorded_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// 날짜별 집계 (선택)
export async function getIntakeSummaryByMonth(year: number, month: number) {
  const logs = await getIntakeLogsByMonth(year, month)
  
  // 날짜별로 그룹핑
  const summary: Record<string, { count: number; levels: string[] }> = {}
  
  logs.forEach(log => {
    const date = new Date(log.recorded_at).toISOString().split('T')[0]
    if (!summary[date]) {
      summary[date] = { count: 0, levels: [] }
    }
    summary[date].count++
    summary[date].levels.push(log.amount_level)
  })
  
  return summary
}
```

---

## 제약사항

### 금지 사항
- ❌ `lib/supabase.ts` 수정 금지 (읽기 전용 사용)
- ❌ `actions/intake.ts`, `actions/report.ts` 생성/수정 금지
- ❌ **데이터 생성/수정/삭제 금지** (읽기 전용 작업)
- ❌ DB 스키마 수정 금지

### 주의 사항
- ⚠️ **읽기 전용 작업**: SELECT만 사용
- ⚠️ `date-fns` 라이브러리 활용 권장
- ⚠️ 캘린더 UI에 맞게 데이터 포맷팅 필요

---

## 트러블슈팅

### 데이터가 로드되지 않음
- RLS 정책 확인 (SELECT 권한)
- `auth.getUser()` 호출 확인
- 날짜 범위 계산 확인 (start < end)

### 날짜 계산 오류
- `date-fns` 함수 사용 확인
- 타임존 이슈 확인 (UTC vs Local)

### 캘린더에 데이터가 표시되지 않음
- 데이터 포맷 확인 (프론트엔드 요구사항)
- Server Component vs Client Component 확인

---

## 참고 자료

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [date-fns Documentation](https://date-fns.org/docs/Getting-Started)
- [Supabase Query Filters](https://supabase.com/docs/reference/javascript/using-filters)
- [docs/software_design.md](file:///Users/hahahoho/Desktop/workspace/251220-water-log-v5/docs/software_design.md) - History 섹션

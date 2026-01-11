# Intake 작업 계획

## 작업 개요

**역할**: Intake Agent  
**목적**: 물 섭취 기록 생성, 조회, 삭제 기능 구현  
**병렬성**: ✅ History, Report와 병렬 작업 가능  
**의존성**: Foundation 완료 필수

---

## 작업 범위

### 포함 사항
- ✅ Server Actions 구현 (`actions/intake.ts`)
- ✅ 물 섭취 기록 생성 (createIntakeLog)
- ✅ 오늘의 물 섭취 기록 조회 (getTodayIntakeLogs)
- ✅ 물 섭취 기록 삭제 (deleteIntakeLog)
- ✅ 프론트엔드 컴포넌트 연동
  - `components/features/intake/intake-recorder.tsx`
  - `components/features/intake/today-intake-list.tsx`

### 제외 사항
- ❌ `lib/supabase.ts` 수정 (읽기 전용 사용)
- ❌ `actions/history.ts`, `actions/report.ts` 수정
- ❌ 컨디션 로그 관련 코드
- ❌ AI 리포트 관련 코드

---

## 필수 참고 문서

1. **docs/user_stories.md**: US-001 ~ US-007 (물 섭취 기록 관련)
2. **docs/software_design.md**: 
   - "Intake Actions" API 설계 섹션
   - "데이터베이스 설계 - intake_logs" 테이블
3. **docs/tasks/task-integration-guide.md**: Intake 프론트엔드 연동 가이드

---

## 필수 참고 파일

- `lib/supabase.ts` (읽기 전용)
- `components/features/intake/intake-recorder.tsx` (연동 대상)
- `components/features/intake/today-intake-list.tsx` (연동 대상)

---

## 상세 체크리스트

### 1. Server Actions 파일 생성
- [ ] `actions/intake.ts` 파일 생성
- [ ] `"use server"` 지시자 추가 (필수)
- [ ] 필요한 임포트 추가
  ```typescript
  'use server'
  
  import { createServerSupabaseClient } from '@/lib/supabase'
  import { revalidatePath } from 'next/cache'
  ```

### 2. createIntakeLog 함수 구현
- [ ] 함수 시그니처 정의
  ```typescript
  export async function createIntakeLog(data: {
    amountLevel: 'high' | 'medium' | 'low'
    recordedAt?: Date
  })
  ```
- [ ] Supabase 클라이언트 생성
- [ ] 현재 사용자 확인 (`auth.getUser()`)
- [ ] `intake_logs` 테이블에 INSERT
- [ ] `revalidatePath('/')` 호출하여 캐시 무효화
- [ ] 에러 핸들링 (try-catch)
- [ ] 성공 시 생성된 기록 반환

### 3. getTodayIntakeLogs 함수 구현
- [ ] 함수 시그니처 정의
  ```typescript
  export async function getTodayIntakeLogs()
  ```
- [ ] 오늘 날짜의 시작/끝 시간 계산 (00:00:00 ~ 23:59:59)
- [ ] `intake_logs` 테이블에서 오늘 기록만 SELECT
- [ ] `recorded_at` 기준 내림차순 정렬
- [ ] 에러 핸들링
- [ ] 기록 목록 반환

### 4. deleteIntakeLog 함수 구현
- [ ] 함수 시그니처 정의
  ```typescript
  export async function deleteIntakeLog(logId: string)
  ```
- [ ] `intake_logs` 테이블에서 DELETE
- [ ] RLS 정책에 의해 자동으로 본인 기록만 삭제됨
- [ ] `revalidatePath('/')` 호출
- [ ] 에러 핸들링

### 5. 프론트엔드 연동 - intake-recorder.tsx
- [ ] `components/features/intake/intake-recorder.tsx` 파일 열기
- [ ] `createIntakeLog` 임포트
  ```typescript
  import { createIntakeLog } from "@/actions/intake"
  ```
- [ ] `handleRecord` 함수에서 TODO 제거
- [ ] Server Action 호출 코드 추가
  ```typescript
  const handleRecord = async (level: IntakeLevel) => {
    setIsRecording(true)
    try {
      await createIntakeLog({ amountLevel: level })
      // 성공 토스트 표시 (선택)
    } catch (error) {
      console.error('Failed to record:', error)
      // 에러 토스트 표시
    } finally {
      setIsRecording(false)
    }
  }
  ```

### 6. 프론트엔드 연동 - today-intake-list.tsx
- [ ] `components/features/intake/today-intake-list.tsx` 파일 확인
- [ ] `getTodayIntakeLogs`, `deleteIntakeLog` 임포트
- [ ] 컴포넌트를 Server Component로 변경하거나 `useEffect`로 데이터 fetch
- [ ] 기록 목록 표시
- [ ] 삭제 버튼에 `deleteIntakeLog` 연동

### 7. 타입 정의 (선택)
- [ ] `actions/types.ts` 파일 생성 (필요 시)
- [ ] 공통 타입 정의
  ```typescript
  export type IntakeLevel = 'high' | 'medium' | 'low'
  
  export interface IntakeLog {
    id: string
    user_id: string
    amount_level: IntakeLevel
    recorded_at: string
    created_at: string
  }
  ```

---

## 완료 조건

### 필수 조건
1. ✅ `actions/intake.ts` 파일 생성 완료
2. ✅ `createIntakeLog`, `getTodayIntakeLogs`, `deleteIntakeLog` 함수 구현
3. ✅ `intake-recorder.tsx`에서 기록 생성 동작
4. ✅ `today-intake-list.tsx`에서 기록 조회 및 삭제 동작
5. ✅ 브라우저에서 기능 검증

### 검증 방법
1. 브라우저에서 `http://localhost:3000` 접속
2. "마셨음", "조금 마셨음", "거의 안 마셨음" 버튼 클릭
3. 화면에 기록이 즉시 표시되는지 확인
4. Supabase 대시보드에서 `intake_logs` 테이블 확인
5. 삭제 버튼 클릭 시 기록이 사라지는지 확인

---

## 코드 예시

### actions/intake.ts (전체)
```typescript
'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function createIntakeLog(data: {
  amountLevel: 'high' | 'medium' | 'low'
  recordedAt?: Date
}) {
  const supabase = createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: log, error } = await supabase
    .from('intake_logs')
    .insert({
      user_id: user.id,
      amount_level: data.amountLevel,
      recorded_at: data.recordedAt || new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) throw error
  
  revalidatePath('/')
  return log
}

export async function getTodayIntakeLogs() {
  const supabase = createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
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
  const supabase = createServerSupabaseClient()
  
  const { error } = await supabase
    .from('intake_logs')
    .delete()
    .eq('id', logId)
  
  if (error) throw error
  
  revalidatePath('/')
}
```

---

## 제약사항

### 금지 사항
- ❌ `lib/supabase.ts` 수정 금지 (읽기 전용 사용)
- ❌ `actions/history.ts`, `actions/report.ts` 생성/수정 금지
- ❌ DB 스키마 수정 금지

### 주의 사항
- ⚠️ `"use server"` 지시자 필수
- ⚠️ `revalidatePath()`로 캐시 무효화 필수
- ⚠️ RLS 정책에 의존 (사용자 확인 자동)

---

## 트러블슈팅

### Server Action 호출 실패
- `lib/supabase.ts` 임포트 경로 확인
- `"use server"` 지시자 확인
- RLS 정책 활성화 확인

### 데이터가 화면에 표시되지 않음
- `revalidatePath('/')` 호출 확인
- Server Component vs Client Component 확인
- `getTodayIntakeLogs()` 함수 호출 확인

---

## 참고 자료

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [docs/software_design.md](file:///Users/hahahoho/Desktop/workspace/251220-water-log-v5/docs/software_design.md) - Intake Actions 섹션

# Report 작업 계획

## 작업 개요

**역할**: Report Agent  
**목적**: Gemini API를 활용한 AI 리포트 생성 및 조회 기능 구현  
**병렬성**: ✅ Intake, History와 병렬 작업 가능  
**의존성**: Foundation 완료 필수

---

## 작업 범위

### 포함 사항
- ✅ Gemini API 클라이언트 구현 (`lib/gemini.ts`)
- ✅ Server Actions 구현 (`actions/report.ts`)
- ✅ AI 리포트 생성 (generateReport)
- ✅ 리포트 목록 조회 (getReports)
- ✅ 리포트 상세 조회 (getReportById)
- ✅ 프론트엔드 컴포넌트 연동
  - `components/features/reports/report-generator.tsx`
  - `components/features/reports/report-list.tsx`

### 제외 사항
- ❌ `lib/supabase.ts` 수정 (읽기 전용 사용)
- ❌ `actions/intake.ts`, `actions/history.ts` 수정
- ❌ 컨디션 로그 관련 코드 (선택적 기능)

---

## 필수 참고 문서

1. **docs/PRD.md**: AI 리포트 요구사항 (톤, 구조, 금지 요소)
2. **docs/user_stories.md**: US-008 ~ US-013 (AI 리포트 관련)
3. **docs/software_design.md**: 
   - "Report Actions" API 설계 섹션
   - "Gemini API 통합" 섹션
4. **docs/tasks/task-integration-guide.md**: Report 프론트엔드 연동 가이드

---

## 필수 참고 파일

- `lib/supabase.ts` (읽기 전용)
- `components/features/reports/report-generator.tsx` (연동 대상)
- `components/features/reports/report-list.tsx` (연동 대상)

---

## 상세 체크리스트

### 1. Gemini API 클라이언트 생성
- [ ] `lib/gemini.ts` 파일 생성
- [ ] `@google/generative-ai` 패키지 임포트
  ```typescript
  import { GoogleGenerativeAI } from '@google/generative-ai'
  ```
- [ ] Gemini API 클라이언트 초기화
  ```typescript
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  ```
- [ ] **모델명 고정**: `gemini-3-flash-preview` 사용
  ```typescript
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })
  ```

### 2. generateAIReport 함수 구현
- [ ] 함수 시그니처 정의
  ```typescript
  export async function generateAIReport(data: {
    intakeLogs: any[]
    conditionLogs?: any[]
    startDate: Date
    endDate: Date
  }): Promise<string>
  ```
- [ ] 프롬프트 구성
  - 분석 기간 명시
  - 물 섭취 기록 데이터 포함
  - 컨디션 기록 데이터 포함 (있는 경우)
  - **리포트 작성 원칙** 명시 (PRD 참고)
    - 공감적 톤
    - 비판 금지 (목표 미달, 부족, 실패 등)
    - 구조: 관찰 → 해석 → 가벼운 제안
    - 구체적 패턴 언급 (요일별, 시간대별)
- [ ] Gemini API 호출
- [ ] 에러 핸들링 (API 호출 실패, 타임아웃 등)
- [ ] 생성된 텍스트 반환

### 3. Server Actions 파일 생성
- [ ] `actions/report.ts` 파일 생성
- [ ] `"use server"` 지시자 추가
- [ ] 필요한 임포트
  ```typescript
  'use server'
  
  import { createServerSupabaseClient } from '@/lib/supabase'
  import { generateAIReport } from '@/lib/gemini'
  import { revalidatePath } from 'next/cache'
  ```

### 4. generateReport 함수 구현
- [ ] 함수 시그니처 정의
  ```typescript
  export async function generateReport(params?: {
    startDate?: Date
    endDate?: Date
  })
  ```
- [ ] 기본값 설정 (최근 7일)
- [ ] Supabase에서 물 섭취 데이터 조회
  ```typescript
  const { data: intakeLogs } = await supabase
    .from('intake_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('recorded_at', startDate.toISOString())
    .lte('recorded_at', endDate.toISOString())
  ```
- [ ] 데이터 검증 (최소 3일 이상)
- [ ] Gemini API 호출 (`generateAIReport`)
- [ ] 생성된 리포트를 `ai_reports` 테이블에 저장
- [ ] `revalidatePath('/reports')` 호출
- [ ] 에러 핸들링
- [ ] 생성된 리포트 반환

### 5. getReports 함수 구현
- [ ] 함수 시그니처 정의
  ```typescript
  export async function getReports()
  ```
- [ ] `ai_reports` 테이블에서 리포트 목록 조회
- [ ] `created_at` 기준 내림차순 정렬 (최신순)
- [ ] 에러 핸들링
- [ ] 리포트 목록 반환

### 6. getReportById 함수 구현
- [ ] 함수 시그니처 정의
  ```typescript
  export async function getReportById(reportId: string)
  ```
- [ ] `ai_reports` 테이블에서 특정 리포트 조회
- [ ] 에러 핸들링
- [ ] 리포트 반환

### 7. 프론트엔드 연동 - report-generator.tsx
- [ ] `components/features/reports/report-generator.tsx` 파일 열기
- [ ] `generateReport` 임포트
  ```typescript
  import { generateReport } from "@/actions/report"
  ```
- [ ] `handleGenerate` 함수에서 TODO 제거
- [ ] Server Action 호출 코드 추가
  ```typescript
  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await generateReport()
      // 성공 토스트 표시
    } catch (error) {
      console.error('Failed to generate report:', error)
      // 에러 토스트 표시
    } finally {
      setIsGenerating(false)
    }
  }
  ```

### 8. 프론트엔드 연동 - report-list.tsx
- [ ] `components/features/reports/report-list.tsx` 파일 확인
- [ ] `getReports` 임포트
- [ ] 컴포넌트를 Server Component로 변경하거나 `useEffect`로 데이터 fetch
- [ ] 리포트 목록 표시
- [ ] 리포트 클릭 시 상세 내용 표시 (모달 또는 별도 페이지)

### 9. 환경 변수 설정
- [ ] `.env.local.example`에 추가
  ```
  GEMINI_API_KEY=your-gemini-api-key
  ```
- [ ] `.env.local`에 실제 API 키 입력

### 10. Gemini 패키지 설치
- [ ] `@google/generative-ai` 패키지 설치
  ```bash
  npm install @google/generative-ai
  ```

---

## 완료 조건

### 필수 조건
1. ✅ `lib/gemini.ts` 파일 생성 및 API 클라이언트 구현
2. ✅ `actions/report.ts` 파일 생성 및 Server Actions 구현
3. ✅ `report-generator.tsx`에서 리포트 생성 동작
4. ✅ `report-list.tsx`에서 리포트 목록 조회 동작
5. ✅ 브라우저에서 `/reports` 페이지 기능 검증
6. ✅ **Gemini 모델**: `gemini-3-flash-preview` 사용 확인

### 검증 방법
1. 브라우저에서 `http://localhost:3000/reports` 접속
2. "리포트 생성" 버튼 클릭
3. 로딩 상태 표시 확인
4. 생성된 리포트가 목록에 추가되는지 확인
5. 리포트 내용이 공감적이고 비판적이지 않은지 확인
6. Supabase 대시보드에서 `ai_reports` 테이블 확인

---

## 코드 예시

### lib/gemini.ts (전체)
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateAIReport(data: {
  intakeLogs: any[]
  conditionLogs?: any[]
  startDate: Date
  endDate: Date
}): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })
  
  const prompt = `
당신은 물 섭취 패턴을 분석하는 친절하고 공감적인 AI 어시스턴트입니다.

## 분석 기간
- 시작일: ${data.startDate.toLocaleDateString('ko-KR')}
- 종료일: ${data.endDate.toLocaleDateString('ko-KR')}

## 물 섭취 기록
${JSON.stringify(data.intakeLogs, null, 2)}

${data.conditionLogs && data.conditionLogs.length > 0 ? `
## 컨디션 기록
${JSON.stringify(data.conditionLogs, null, 2)}
` : ''}

## 리포트 작성 원칙
1. **공감적 톤**: "완벽하진 않았지만...", "조금씩 나아지고 있어요" 등
2. **비판 금지**: "목표 미달", "부족", "실패" 등의 표현 사용 금지
3. **구조**: 관찰 → 해석 → 가벼운 제안
4. **구체적 패턴 언급**: 요일별, 시간대별 패턴 분석
5. **컨디션 연계**: 물 섭취와 컨디션의 상관관계 찾기 (데이터가 있는 경우)

한글로 3-5문단의 리포트를 작성해주세요.
  `.trim()
  
  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw new Error('AI 리포트 생성에 실패했습니다.')
  }
}
```

### actions/report.ts (일부)
```typescript
'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { generateAIReport } from '@/lib/gemini'
import { revalidatePath } from 'next/cache'

export async function generateReport(params?: {
  startDate?: Date
  endDate?: Date
}) {
  const supabase = createServerSupabaseClient()
  
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
  
  // 데이터 검증
  if (!intakeLogs || intakeLogs.length < 3) {
    throw new Error('최소 3일 이상의 물 섭취 기록이 필요합니다.')
  }
  
  // Gemini API 호출
  const reportContent = await generateAIReport({
    intakeLogs,
    conditionLogs: [],
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
```

---

## 제약사항

### 금지 사항
- ❌ `lib/supabase.ts` 수정 금지 (읽기 전용 사용)
- ❌ `actions/intake.ts`, `actions/history.ts` 생성/수정 금지
- ❌ DB 스키마 수정 금지

### 필수 사항
- ✅ **Gemini 모델**: 반드시 `gemini-3-flash-preview` 사용
- ✅ 환경 변수 `GEMINI_API_KEY` 설정
- ✅ 리포트 톤: 공감적, 비판 금지

---

## 트러블슈팅

### Gemini API 호출 실패
- API 키 확인 (`process.env.GEMINI_API_KEY`)
- 모델명 확인 (`gemini-3-flash-preview`)
- 네트워크 연결 확인
- 프롬프트 길이 확인 (너무 길면 에러)

### 리포트가 생성되지 않음
- 물 섭취 데이터가 최소 3일 이상인지 확인
- Supabase에서 데이터 조회 확인
- 에러 로그 확인

### 리포트 톤이 부정적
- 프롬프트의 "리포트 작성 원칙" 섹션 확인
- Gemini API 응답 확인 및 필요시 프롬프트 수정

---

## 참고 자료

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Gemini 3 Flash Preview Pricing](https://ai.google.dev/gemini-api/docs/pricing?hl=ko&_gl=1*1jsh8g1*_up*MQ..*_ga*OTI1NDg2MDEyLjE3NjYxNjkyOTc.*_ga_P1DBVKWT6V*czE3NjYxNjkyOTckbzEkZzAkdDE3NjYxNjkyOTckajYwJGwwJGgxODE1MzM4MDI1#gemini-3-flash-preview)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [docs/PRD.md](file:///Users/hahahoho/Desktop/workspace/251220-water-log-v5/docs/PRD.md) - AI 리포트 요구사항
- [docs/software_design.md](file:///Users/hahahoho/Desktop/workspace/251220-water-log-v5/docs/software_design.md) - Report Actions 섹션

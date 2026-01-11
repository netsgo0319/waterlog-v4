# Foundation 작업 계획

## 작업 개요

**역할**: Foundation Agent  
**목적**: Water Log 프로젝트의 기초 인프라 구축  
**병렬성**: ❌ 선행 작업 (모든 작업의 사전 조건)

---

## 작업 범위

### 포함 사항
- ✅ Supabase 프로젝트 설정
- ✅ 데이터베이스 스키마 생성 (intake_logs, condition_logs, ai_reports)
- ✅ Supabase 클라이언트 유틸리티 (`lib/supabase.ts`)
- ✅ 환경 변수 템플릿 (`.env.local.example`)
- ✅ RLS (Row Level Security) 정책 설정

### 제외 사항
- ❌ Server Actions 구현 (intake.ts, history.ts, report.ts)
- ❌ 프론트엔드 코드 수정
- ❌ Gemini API 연동

---

## 필수 참고 문서

1. **docs/PRD.md**: 제품 개요 및 기술 스택
2. **docs/software_design.md**: 
   - "데이터베이스 설계" 섹션 (ERD, 테이블 스키마)
   - "Supabase 클라이언트 설정" 섹션
3. **docs/tasks/task-integration-guide.md**: 전체 작업 맥락

---

## 상세 체크리스트

### 1. Supabase 프로젝트 설정
- [ ] Supabase 대시보드에서 새 프로젝트 생성
- [ ] 프로젝트 URL 및 ANON KEY 확보
- [ ] 환경 변수 기록

### 2. 데이터베이스 스키마 생성
- [ ] `supabase/schema.sql` 파일 생성
- [ ] `intake_logs` 테이블 정의
  ```sql
  CREATE TABLE intake_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_level VARCHAR(50) NOT NULL CHECK (amount_level IN ('high', 'medium', 'low')),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```
- [ ] `condition_logs` 테이블 정의
- [ ] `ai_reports` 테이블 정의
- [ ] 인덱스 추가 (`user_id`, `recorded_at`, `log_date` 등)
- [ ] Supabase SQL Editor에서 스키마 실행

### 3. RLS 정책 설정
- [ ] `intake_logs` RLS 정책
  - SELECT: 자신의 기록만 조회
  - INSERT: 자신의 기록만 생성
  - DELETE: 자신의 기록만 삭제
- [ ] `condition_logs` RLS 정책
  - SELECT, INSERT, UPDATE: 자신의 기록만
- [ ] `ai_reports` RLS 정책
  - SELECT, INSERT: 자신의 리포트만
- [ ] 모든 테이블에 RLS 활성화

### 4. Supabase 클라이언트 생성
- [ ] `lib/supabase.ts` 파일 생성
- [ ] Server Component용 클라이언트 함수 구현
  ```typescript
  import { createServerClient } from '@supabase/ssr'
  import { cookies } from 'next/headers'

  export function createServerSupabaseClient() {
    const cookieStore = cookies()
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          // ...
        },
      }
    )
  }
  ```

### 5. 환경 변수 설정
- [ ] `.env.local.example` 파일 생성
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```
- [ ] `.env.local` 파일 생성 (실제 값 입력)
- [ ] `.gitignore`에 `.env.local` 추가 확인

### 6. Supabase 의존성 설치
- [ ] `@supabase/ssr` 패키지 설치
  ```bash
  npm install @supabase/ssr @supabase/supabase-js
  ```

---

## 완료 조건

### 필수 조건
1. ✅ `lib/supabase.ts` 파일이 생성되고 클라이언트 함수가 정상 동작
2. ✅ `supabase/schema.sql` 파일이 생성되고 Supabase에 스키마가 적용됨
3. ✅ `.env.local.example` 파일 생성
4. ✅ `.env.local` 파일에 실제 Supabase 키 설정
5. ✅ RLS 정책이 모든 테이블에 활성화됨

### 검증 방법
```typescript
// lib/supabase.ts를 임포트하여 테스트
import { createServerSupabaseClient } from '@/lib/supabase'

const supabase = createServerSupabaseClient()
const { data, error } = await supabase.from('intake_logs').select('*').limit(1)
// error가 RLS 정책 관련이면 성공 (인증 전이므로 정상)
```

---

## 제약사항

### 금지 사항
- ❌ Server Actions 파일 생성하지 않음 (`actions/` 폴더)
- ❌ 프론트엔드 컴포넌트 수정하지 않음
- ❌ Gemini API 관련 코드 작성하지 않음

### 주의 사항
- ⚠️ RLS 정책을 반드시 활성화할 것 (보안)
- ⚠️ 환경 변수를 `.gitignore`에 추가할 것
- ⚠️ `auth.users` 테이블은 Supabase에서 기본 제공 (생성 불필요)

---

## 참고 자료

- [Supabase Quick Start](https://supabase.com/docs/guides/getting-started)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [docs/software_design.md](file:///Users/hahahoho/Desktop/workspace/251220-water-log-v5/docs/software_design.md) - 데이터베이스 설계 섹션

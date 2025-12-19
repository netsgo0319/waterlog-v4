# 🏗️ Task Plan: Foundation

> **목표**: Supabase 연동 및 데이터베이스 스키마 구축

## ✅ Checklist
- [x] **환경 변수 설정**: `.env.local` 파일 템플릿 작성 및 필요한 키 정의
- [x] **Supabase 클라이언트**: `lib/supabase.ts` 생성 (Server Action용/Client Component용 구분 필요 시 고려)
- [x] **유틸리티 설정**: 인증이 제외된 MVP를 위한 `FIXED_USER_ID` 또는 개발용 Mock Auth 유틸리티(`lib/auth.ts`) 마련 (Implemented in `lib/supabase.ts`)
- [x] **DB 스키마 작성**: `supabase/schema.sql` 파일 작성 (Software Design 문서 기반)
- [ ] **타입 정의**: `types/scheduler.ts` 또는 글로벌 타입 파일에 DB 테이블 타입 정의 (Supabase CLI로 생성하거나 수동 정의)

## 📝 상세 가이드

### 1. Supabase 클라이언트 (`lib/supabase.ts`)
- `@supabase/ssr` 패키지를 사용할지, 기본 `supabase-js`를 사용할지 결정해야 합니다. (Next.js App Router에는 `@supabase/ssr` 권장)
- 다만 간단한 MVP 구현을 위해 `createClient`를 `lib/supabase.ts`에서 export 하는 방식을 사용할 수도 있습니다.

### 2. Mock Auth (`lib/auth.ts`)
- 현재 User Stories에 따라 Auth는 MVP 제외입니다.
- 하지만 DB는 `user_id`를 요구하므로, `getUserId()` 같은 헬퍼 함수를 만들어 고정된 UUID를 반환하게 하세요.
- 하지만 DB는 `user_id`를 요구하므로, `getUserId()` 같은 헬퍼 함수를 만들어 고정된 UUID를 반환하게 하세요.
- 예: `export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';` (Completed: `FIXED_USER_ID` in `lib/supabase.ts`)

### 3. Schema (`supabase/schema.sql`)
- `users`, `intake_logs`, `condition_logs`, `ai_reports` 4개 테이블 생성 쿼리 작성.
- RLS(Row Level Security)는 일단 disable 하거나, public access를 허용하는 정책을 넣어두는 것이 개발에 편합니다 (보안상 추후 수정 필요).

## 🏃 실행 프롬프트
이 문서를 바탕으로 Foundation 작업을 시작하려면 에이전트에게 아래와 같이 요청하세요.

```
@[docs/tasks/task-foundation-plan.md] 문서를 참고하여 Foundation 작업을 수행해줘. 
Supabase 설정과 테이블 스키마, 그리고 개발용 Mock User ID 설정을 포함해야 해.
```

# 🗺️ Task Integration Guide - Backend Development

이 문서는 Water Log 프로젝트의 백엔드 개발을 위한 통합 가이드입니다.
이미 개발된 프론트엔드 코드(Next.js App Router)에 맞춰 서버 액션(Server Actions)과 데이터베이스(Supabase), 그리고 AI(Gemini) 기능을 단계별로 구현합니다.

---

## 🏗️ 개발 단계 (Phases)

프로젝트는 다음 4단계로 진행하며, 각 단계는 순차적으로 의존성을 가집니다.
특히 **Foundation** 단계는 모든 작업의 기초가 되므로 가장 먼저 완료되어야 합니다.

| 단계 | 작업 유닛 (Task Unit) | 주요 내용 | 의존성 |
|:---:|---------------------|----------|-------|
| 1 | **Foundation** | Supabase 설정, DB 스키마 생성, 공통 유틸리티 | 없음 |
| 2 | **Intake & Condition** | 물 섭취 기록 및 컨디션 메모 백엔드, 메인 페이지 연동 | Foundation |
| 3 | **History** | 기간별 데이터 조회, 캘린더/차트 데이터 바인딩 | Intake |
| 4 | **AI Report** | Gemini API 연동, 리포트 생성 및 저장 로직 | Intake, History |

---

## 🧩 작업 단위별 가이드

### 1. Foundation (기초 공사)
- **목표**: 데이터베이스 테이블 생성 및 프로젝트 환경 설정
- **관련 파일**: `lib/supabase.ts`, `.env.local`, `supabase/schema.sql`
- **핵심**: `docs/software_design.md`에 정의된 4개 테이블(`users`, `intake_logs`, `condition_logs`, `ai_reports`)을 정확히 생성해야 합니다.

### 2. Intake & Condition (기록 기능)
- **목표**: 메인 페이지(`app/page.tsx`)의 기록 기능 활성화
- **관련 파일**: `actions/intake.ts`, `actions/condition.ts`, `components/features/intake/*`
- **핵심**: 프론트엔드 컴포넌트(`IntakeRecorder`)에서 호출할 Server Action을 만들고 연결합니다. 

### 3. History (조회 기능)
- **목표**: 히스토리 페이지(`app/history/page.tsx`)의 데이터 시각화
- **관련 파일**: `actions/history.ts`, `components/features/history/*`
- **핵심**: 날짜 범위(Range) 쿼리를 효율적으로 작성하고, 클라이언트 컴포넌트에 데이터를 전달합니다.

### 4. AI Report (AI 리포트)
- **목표**: Gemini 2.5 Flash 모델을 이용한 리포트 생성 및 조회
- **관련 파일**: `actions/report.ts`, `lib/ai/gemini.ts`, `app/reports/*`
- **핵심**: **반드시 `gemini-2.5-flash` 모델을 사용**합니다. 프롬프트 엔지니어링을 통해 "공감적이고 긍정적인" 톤을 유지해야 합니다.

---

## ⚠️ 공통 규칙 (Rules)

1. **언어**: 모든 응답과 주석은 **한국어**로 작성합니다.
2. **기술 스택**: Next.js App Router, Server Actions, Supabase, Gemini API를 사용합니다.
3. **디자인 준수**: `docs/software_design.md`의 설계를 따르되, 구현상 이슈가 있다면 사용자에게 알리고 조정합니다.
4. **모델 고정**: Gemini API 호출 시 모델명은 반드시 `gemini-2.5-flash`로 설정합니다.
5. **문서화**: 각 단계 완료 후 주요 변경 사항을 요약하여 알립니다.

---

## 🚀 단계별 프롬프트 (Integration Prompts)

각 작업을 수행하는 에이전트는 아래 지침을 참고하여 작업을 시작하세요.

### Task 1: Foundation
```markdown
**Context**: 프로젝트의 기초를 다지는 단계입니다.
**Goal**: Supabase 클라이언트 설정과 DB 테이블 생성을 완료해주세요.
**Input**: `docs/software_design.md`의 "3. 데이터베이스 설계" 섹션
**Output**: `lib/supabase.ts`, `supabase/schema.sql`, 환경변수 가이드
**Warning**: Auth 기능은 MVP에서 제외되지만, 테이블 스키마에는 `user_id`가 포함되어 있습니다. 개발용 더미 User ID를 상수(`FIXED_USER_ID`)로 정의하여 사용할 수 있도록 준비해주세요.
```

### Task 2: Intake & Condition
```markdown 
**Context**: 사용자가 물과 컨디션을 기록하는 코어 기능입니다.
**Goal**: `app/page.tsx`와 연동되는 `createIntakeLog`, `upsertConditionLog` Server Action을 구현하세요.
**Input**: `docs/software_design.md`의 "5.1 Server Actions 설계" 및 `components/features/intake/` 코드
**Output**: `actions/intake.ts`, `actions/condition.ts` 및 컴포넌트 연동 수정
**Constraint**: 프론트엔드 UI를 크게 수정하지 말고, Server Action 연결 위주로 작업하세요.
```

### Task 3: History
```markdown
**Context**: 기록된 데이터를 시각화하는 단계입니다.
**Goal**: `app/history/page.tsx`에서 필요한 기간별 데이터를 조회하는 Action을 구현하세요.
**Input**: `docs/software_design.md`의 "5.1 Server Actions 설계"
**Output**: `actions/history.ts`, `components/features/history/` 내부 데이터 바인딩
**Constraint**: 날짜 처리는 `date-fns`를 사용하세요.
```

### Task 4: AI Report
```markdown
**Context**: 축적된 데이터를 분석하여 리포트를 제공하는 핵심 차별화 기능입니다.
**Goal**: Gemini API를 연동하여 리포트를 생성하고 저장/조회하는 기능을 구현하세요.
**Input**: `docs/software_design.md`의 "5.2 Gemini API 통합 설계"
**Output**: `actions/report.ts`, `lib/ai/gemini.ts`
**Critical**:
1. Gemini 모델은 `gemini-2.5-flash`를 사용하세요.
2. 프롬프트는 "평가하지 않고 공감하는 톤"을 유지해야 합니다.
3. 최소 3일 데이터가 없으면 적절한 에러(또는 안내)를 반환하세요.
```

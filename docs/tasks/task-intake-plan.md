# 💧 Task Plan: Intake & Condition

> **목표**: 물 섭취 및 컨디션 기록 기능 구현 (Server Actions & Component Integration)

## ✅ Checklist
- [ ] **Intake Server Action**: `actions/intake.ts` 구현 (`createIntakeLog`, `getIntakeLogsByDate`, `deleteIntakeLog`)
- [ ] **Condition Server Action**: `actions/condition.ts` 구현 (`upsertConditionLog`, `getConditionByDate`)
- [ ] **Component 연동**: 
    - `components/features/intake/intake-recorder.tsx` → `createIntakeLog` 연결
    - `components/features/intake/today-intake-list.tsx` → `getIntakeLogsByDate` 연결 (초기 로딩 및 업데이트 처리)
- [ ] **에러 핸들링**: DB 저장 실패 시 사용자에게 Toast 알림 표시 (`sonner` 등 활용)
- [ ] **Optimistic Update**: 가능하면 `useOptimistic` 등을 사용하여 반응성 향상 (선택 사항)

## 📝 상세 가이드

### 1. Server Actions
- 모든 Action은 `docs/software_design.md`의 "5.1 Server Actions 설계"를 따르세요.
- `user_id`는 `lib/auth.ts`의 `getUserId()`를 import하여 사용하세요.

### 2. Component Integration
- 기존 프론트엔드 코드는 UI만 구현되어 있을 가능성이 높습니다.
- 이벤트 핸들러(`onClick`) 내부에 Server Action 호출 로직을 주입하세요.
- 데이터 갱신을 위해 `revalidatePath('/')`를 Action 성공 시 호출해야 합니다.

## 🏃 실행 프롬프트
이 문서를 바탕으로 Intake 작업을 시작하려면 에이전트에게 아래와 같이 요청하세요.

```
@[docs/tasks/task-intake-plan.md] 문서를 참고하여 물 섭취 기록 기능을 구현해줘.
actions 폴더에 필요한 파일을 생성하고, 기존 컴포넌트와 연결해서 실제 DB에 저장되도록 해줘.
```

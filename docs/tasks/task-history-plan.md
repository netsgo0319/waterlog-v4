# 📊 Task Plan: History

> **목표**: 과거 기록 조회 및 시각화

## ✅ Checklist
- [ ] **History Server Action**: `actions/history.ts` 구현 (`getIntakeLogsByDateRange`)
- [ ] **Condition History**: `getConditionsByDateRange` 구현 (필요 시 `actions/condition.ts` 활용)
- [ ] **캘린더 연동**: `app/history/page.tsx` 또는 `CalendarView` 컴포넌트에 데이터 바인딩
- [ ] **날짜 네비게이션**: 월 변경 시 해당 월의 데이터 Fetching 로직 구현 (Server Component vs Client Component Fetching 결정)

## 📝 상세 가이드

### 1. Data Fetching Strategy
- Server Component인 `app/history/page.tsx`에서 초기 데이터(이번 달)를 Fetching 하여 Client Component에 prop으로 전달하는 방식을 권장합니다.
- 월 변경 시에는 URL Query Parameter(`?month=2025-12`)를 업데이트하여 페이지를 리로드하거나, Client Side Fetching을 사용할 수 있습니다. 여기서는 Next.js 패턴에 따라 URL 파라미터 방식을 우선 고려하세요.

### 2. Visualization
- 가져온 로그 데이터를 날짜별로 그룹화하여 캘린더에 색상/아이콘으로 표시해야 합니다.
- `date-fns` 라이브러리를 적극 활용하여 날짜 계산을 수행하세요.

## 🏃 실행 프롬프트
이 문서를 바탕으로 History 작업을 시작하려면 에이전트에게 아래와 같이 요청하세요.

```
@[docs/tasks/task-history-plan.md] 문서를 참고하여 히스토리 페이지 기능을 구현해줘.
기간별 데이터를 조회하는 Action을 만들고, 캘린더 뷰에 데이터를 표시해줘.
```

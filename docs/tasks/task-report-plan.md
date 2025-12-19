# 🤖 Task Plan: AI Report

> **목표**: Gemini 2.5 Flash 기반의 AI 리포트 생성 및 관리

## ✅ Checklist
- [ ] **Gemini Client**: `lib/ai/gemini.ts` 구현 (GoogleGenerativeAI 클라이언트 설정)
- [ ] **Report Server Action**: `actions/report.ts` 구현 (`generateAIReport`, `getReportList`, `getReportById`)
- [ ] **Data Aggregation**: 리포트 생성을 위해 최근 3일~7일간의 Intake/Condition 로그를 조회하는 로직 작성
- [ ] **Prompt Engineering**: 공감적 톤앤매너를 위한 시스템 프롬프트 작성
- [ ] **UI Integration**: `app/reports/page.tsx`에서 생성 버튼 및 리스트 표시

## 📝 상세 가이드

### 1. Gemini Configuration
- **Model**: `gemini-2.5-flash` (필수 요구사항)
- API Key는 `process.env.GEMINI_API_KEY`를 사용합니다.

### 2. Prompt Structure
- 입력 데이터: 날짜별 물 섭취량, 컨디션 메모, 지난 리포트 내용(선택)
- 지시 사항: 
  - "사용자는 물 마시기를 어려워함"
  - "실패라는 단어 사용 금지"
  - "작은 변화를 칭찬할 것"
  - "한국어로 작성할 것"

### 3. Error Handling
- 데이터가 부족한 경우(예: 기록이 1일치밖에 없음) API를 호출하지 말고 "데이터가 더 필요해요" 메시지를 반환하세요.
- API 호출 실패 시 적절한 폴백(Fallback) 메시지를 보여주세요.

## 🏃 실행 프롬프트
이 문서를 바탕으로 AI Report 작업을 시작하려면 에이전트에게 아래와 같이 요청하세요.

```
@[docs/tasks/task-report-plan.md] 문서를 참고하여 AI 리포트 기능을 구현해줘.
Gemini 2.5 Flash 모델을 사용해야 하며, 프롬프트 규칙을 정확히 지켜야 해.
```

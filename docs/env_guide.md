# 환경변수 설정 가이드

이 프로젝트를 실행하기 위해서는 다음 환경변수들이 필요합니다.
`.env.local` 파일을 프로젝트 루트에 생성하고 아래 내용을 채워주세요.

## 1. Supabase 설정
Supabase 프로젝트 대시보드 -> Settings -> API 에서 확인 가능합니다.

- `NEXT_PUBLIC_SUPABASE_URL`: 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `anon` public key

## 2. Gemini API 설정
Google AI Studio에서 API Key를 발급받아야 합니다.

- `GEMINI_API_KEY`: Google Gemini API Key

## 예시 (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxh...
GEMINI_API_KEY=AIza...
```

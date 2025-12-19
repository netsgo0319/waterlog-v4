
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// 개발용 더미 User ID (Auth MVP 제외로 인한 조치)
// 실제 Auth 구현 전까지 이 ID를 사용하여 데이터를 저장하고 조회합니다.
export const FIXED_USER_ID = '00000000-0000-0000-0000-000000000000';


-- 1. intake_logs (물 섭취 기록)
CREATE TABLE IF NOT EXISTS intake_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_level VARCHAR(50) NOT NULL CHECK (amount_level IN ('high', 'medium', 'low')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intake_logs_user_id ON intake_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_intake_logs_recorded_at ON intake_logs (recorded_at);

-- RLS 정책
ALTER TABLE intake_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own intake logs"
  ON intake_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intake logs"
  ON intake_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own intake logs"
  ON intake_logs FOR DELETE
  USING (auth.uid() = user_id);


-- 2. condition_logs (컨디션 메모)
CREATE TABLE IF NOT EXISTS condition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  condition_type VARCHAR(50) NOT NULL CHECK (condition_type IN ('fatigue', 'swelling', 'skin', 'energy', 'sleep', 'other')),
  condition_value VARCHAR(50) NOT NULL CHECK (condition_value IN ('very_good', 'good', 'normal', 'bad', 'very_bad')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 하루에 한 번만 기록 가능
  UNIQUE(user_id, log_date, condition_type)
);

CREATE INDEX IF NOT EXISTS idx_condition_logs_user_id ON condition_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_condition_logs_date ON condition_logs (log_date);

-- RLS 정책
ALTER TABLE condition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own condition logs"
  ON condition_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own condition logs"
  ON condition_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own condition logs"
  ON condition_logs FOR UPDATE
  USING (auth.uid() = user_id);


-- 3. ai_reports (AI 리포트)
CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  report_type VARCHAR(50) NOT NULL DEFAULT 'weekly' CHECK (report_type IN ('weekly', 'custom', 'monthly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_reports_user_id ON ai_reports (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_created_at ON ai_reports (created_at);

-- RLS 정책
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON ai_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON ai_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

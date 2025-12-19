-- users 테이블 (추후 확장 대비)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- intake_logs 테이블
CREATE TABLE IF NOT EXISTS intake_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level VARCHAR(50) NOT NULL CHECK (level IN ('high', 'medium', 'low')),
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성 (중복 방지를 위해 IF NOT EXISTS 체크 필요하지만, SQL에서는 기본적으로 CREATE INDEX IF NOT EXISTS 지원하므로 추가)
CREATE INDEX IF NOT EXISTS idx_intake_user_recorded ON intake_logs(user_id, recorded_at DESC);

-- condition_logs 테이블
CREATE TABLE IF NOT EXISTS condition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  condition_type VARCHAR(50) NOT NULL,
  note TEXT,
  log_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_condition_user_date ON condition_logs(user_id, log_date DESC);

-- ai_reports 테이블
CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('weekly', 'manual')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_created ON ai_reports(user_id, created_at DESC);

-- 개발용 더미 사용자 삽입
INSERT INTO users (id, email)
VALUES ('00000000-0000-0000-0000-000000000000', 'test@example.com')
ON CONFLICT (id) DO NOTHING;

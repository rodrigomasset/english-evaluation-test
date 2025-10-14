DO $$ BEGIN
  CREATE TYPE level_enum AS ENUM ('basico1','basico2','intermediario1','intermediario2','avancado1','avancado2','expert');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS masters (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS professors (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  student_password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  level level_enum NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index SMALLINT NOT NULL CHECK (correct_index BETWEEN 0 AND 4),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tests (
  id BIGSERIAL PRIMARY KEY,
  professor_id BIGINT REFERENCES professors(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  assigned_level level_enum NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_tests_professor_created ON tests(professor_id, created_at DESC);

CREATE TABLE IF NOT EXISTS test_items (
  id BIGSERIAL PRIMARY KEY,
  test_id BIGINT REFERENCES tests(id) ON DELETE CASCADE,
  question_id BIGINT REFERENCES questions(id) ON DELETE RESTRICT,
  order_index SMALLINT NOT NULL CHECK (order_index BETWEEN 0 AND 14),
  chosen_option_index SMALLINT CHECK (chosen_option_index BETWEEN 0 AND 4),
  is_correct BOOLEAN
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_type TEXT CHECK (actor_type IN ('master','professor')),
  actor_id BIGINT,
  action TEXT CHECK (action IN ('VIEW_TEST','RESEND_EMAIL','DELETE_TEST','CREATE_PROFESSOR','UPDATE_PROFESSOR','DELETE_PROFESSOR')),
  target_type TEXT CHECK (target_type IN ('TEST','PROFESSOR')),
  target_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO masters (email, password) VALUES
  ('rodrigocmasset@gmail.com', '6722')
ON CONFLICT (email) DO NOTHING;

INSERT INTO professors (code, email, password, student_password) VALUES
  ('01', 'carolduba@hotmail.com', 'duba2025', 'aluno2026')
ON CONFLICT (email) DO NOTHING;

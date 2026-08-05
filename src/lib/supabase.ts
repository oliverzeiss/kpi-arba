/**
 * Supabase Client Configuration & Helpers
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return {
    url,
    anonKey,
    isConfigured: Boolean(
      url &&
        anonKey &&
        url.startsWith('https://') &&
        !url.includes('YOUR_SUPABASE')
    ),
  };
}

/**
 * SQL Schema DDL string for manual execution in Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `
-- 1. Tabel Divisi
CREATE TABLE IF NOT EXISTS divisions (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Jabatan
CREATE TABLE IF NOT EXISTS positions (
  id VARCHAR PRIMARY KEY,
  division_id VARCHAR REFERENCES divisions(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Master Template KPI per Jabatan
CREATE TABLE IF NOT EXISTS kpi_templates (
  id VARCHAR PRIMARY KEY,
  position_id VARCHAR REFERENCES positions(id) ON DELETE CASCADE,
  position_title VARCHAR NOT NULL,
  division_name VARCHAR NOT NULL,
  evaluation_cycle VARCHAR DEFAULT 'Bulanan',
  active_period VARCHAR NOT NULL DEFAULT 'Juli 2026',
  active_year INT DEFAULT 2026,
  active_month INT DEFAULT 7,
  active_quarter VARCHAR DEFAULT 'Q3',
  indicators_json JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Submission KPI (Self-Assessment & Supervisor Assessment)
CREATE TABLE IF NOT EXISTS kpi_submissions (
  id VARCHAR PRIMARY KEY,
  employee_name VARCHAR NOT NULL,
  position_id VARCHAR REFERENCES positions(id),
  position_title VARCHAR NOT NULL,
  division_name VARCHAR NOT NULL,
  period VARCHAR NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  quarter VARCHAR NOT NULL,

  -- Self-Assessment Karyawan
  self_scores_json JSONB NOT NULL,
  self_total_score NUMERIC(5,2) NOT NULL,
  self_grade VARCHAR(5) NOT NULL,
  self_grade_description VARCHAR NOT NULL,

  -- Supervisor Assessment Atasan (Modal Review)
  supervisor_scores_json JSONB,
  supervisor_total_score NUMERIC(5,2),
  supervisor_grade VARCHAR(5),
  supervisor_grade_description VARCHAR,

  -- Final Score (= supervisor_score setelah Approved)
  final_total_score NUMERIC(5,2),
  final_grade VARCHAR(5),
  final_grade_description VARCHAR,

  -- Review & Workflow Status (submitted | reviewed | approved)
  status VARCHAR DEFAULT 'submitted',
  reviewer_notes TEXT,
  reviewed_by VARCHAR,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  achievement_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Mencegah double submission untuk karyawan, jabatan & periode yang sama
  CONSTRAINT unique_employee_period UNIQUE (employee_name, position_id, period)
);

-- Index Performa Query
CREATE INDEX IF NOT EXISTS idx_submissions_status ON kpi_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_period ON kpi_submissions(year, month);
CREATE INDEX IF NOT EXISTS idx_submissions_division ON kpi_submissions(division_name);
CREATE INDEX IF NOT EXISTS idx_submissions_position ON kpi_submissions(position_id);

-- 5. Tabel Pengaturan Aplikasi (App Settings)
CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR PRIMARY KEY,
  company_kpi_target NUMERIC(5,2) DEFAULT 75,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if not exists
INSERT INTO app_settings (id, company_kpi_target) 
VALUES ('default', 75) 
ON CONFLICT (id) DO NOTHING;
`;

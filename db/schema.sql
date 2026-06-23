CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  repo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_id UUID REFERENCES targets(id) ON DELETE CASCADE,
  profile TEXT NOT NULL CHECK (profile IN ('fast', 'full', 'deep', 'scheduled')),
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'passed', 'failed', 'error')),
  unified_score NUMERIC DEFAULT 0,
  qa_score NUMERIC DEFAULT 0,
  security_score NUMERIC DEFAULT 0,
  verdict TEXT DEFAULT 'fail',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
  finding_id TEXT NOT NULL,
  stable_key TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('qa', 'security')),
  test_type TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'warn')),
  location JSONB DEFAULT '{}',
  evidence JSONB DEFAULT '{}',
  reproduction JSONB DEFAULT '[]',
  remediation TEXT NOT NULL,
  owasp TEXT,
  triage_state TEXT DEFAULT 'open',
  suppression_justification TEXT,
  suppression_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(run_id, finding_id)
);

CREATE TABLE matrix_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
  browser TEXT NOT NULL,
  viewport TEXT NOT NULL,
  os TEXT NOT NULL,
  test_type TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
  finding_id TEXT,
  type TEXT NOT NULL, -- screenshot, video, sarif, raw-report, request-response
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE suppressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stable_key TEXT NOT NULL,
  reason TEXT NOT NULL,
  owner TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_runs_target ON runs(target_id);
CREATE INDEX idx_runs_status ON runs(status);
CREATE INDEX idx_findings_run ON findings(run_id);
CREATE INDEX idx_findings_stable_key ON findings(stable_key);
CREATE INDEX idx_findings_severity ON findings(severity);

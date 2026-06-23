export type RunProfile = 'fast' | 'full' | 'deep' | 'scheduled';
export type RunStatus = 'queued' | 'running' | 'passed' | 'failed' | 'error';
export type FindingType = 'qa' | 'security';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type FindingStatus = 'pass' | 'fail' | 'warn';
export type TestType = 'smoke' | 'functional' | 'responsive' | 'accessibility' | 'performance' | 'visual' | 'e2e' | 'sast' | 'sca' | 'secrets' | 'dast';

export interface TargetInput {
  url: string;
  repoUrl?: string;
  profile: RunProfile;
  expectedText?: string;
  scope?: { includePaths?: string[]; excludePaths?: string[] };
  auth?: {
    strategy: 'none' | 'basic' | 'form' | 'token';
    username?: string;
    passwordSecretRef?: string;
    tokenSecretRef?: string;
  };
}

export interface RunTarget extends TargetInput { id: string; name: string }
export interface FindingLocation { url?: string; selector?: string; file?: string; line?: number; endpoint?: string; parameter?: string }
export interface FindingEvidence { screenshotUrl?: string; videoUrl?: string; request?: string; response?: string; codeSnippet?: string; rawTool?: string }

export interface NormalizedFinding {
  findingId: string;
  type: FindingType;
  testType: TestType;
  category: string;
  severity: FindingSeverity;
  status: FindingStatus;
  location: FindingLocation;
  evidence: FindingEvidence;
  reproduction: string[];
  remediation: string;
  owasp?: string;
  stableKey: string;
}

export interface RunScores { unified: number; qa: number; security: number }
export interface MatrixResult { id: string; browser: 'chromium' | 'firefox' | 'webkit'; viewport: string; os: string; testType: TestType; status: FindingStatus; durationMs: number }
export interface SarifLog { version: '2.1.0'; runs: Array<{ tool: { driver: { name: string; informationUri?: string; rules: Array<{ id: string; name: string; shortDescription: { text: string } }> } }; results: Array<{ ruleId: string; level: string; message: { text: string }; locations: Array<{ physicalLocation: { artifactLocation: { uri: string }; region?: { startLine?: number } } }> }> }> }

export interface RunResult {
  runId: string;
  status: RunStatus;
  target: RunTarget;
  profile: RunProfile;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  score: RunScores;
  verdict: 'pass' | 'fail';
  findings: NormalizedFinding[];
  matrix: MatrixResult[];
  sarif: SarifLog;
}

export interface RunRecord {
  id: string;
  status: RunStatus;
  profile: RunProfile;
  target: RunTarget;
  createdAt: string;
  updatedAt: string;
  result?: RunResult;
  error?: string;
}

import { createHash } from 'crypto';
import type { MatrixResult, NormalizedFinding, RunProfile, RunResult, RunTarget, SarifLog } from './types';
import { shouldGate } from './profiles';

export function stableFindingId(parts: string[]) {
  return `f_${createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16)}`;
}

export function emptySarif(): SarifLog {
  return {
    version: '2.1.0',
    runs: [{
      tool: { driver: { name: 'Unified QA Security Platform', informationUri: 'https://owasp.org', rules: [] } },
      results: [],
    }],
  };
}

export function sarifFromFindings(findings: NormalizedFinding[]): SarifLog {
  const securityFindings = findings.filter((f) => f.type === 'security');
  const rules = securityFindings.map((f) => ({ id: f.findingId, name: f.category, shortDescription: { text: f.remediation } }));
  const results = securityFindings.map((f) => ({
    ruleId: f.findingId,
    level: f.severity === 'critical' || f.severity === 'high' ? 'error' : f.severity === 'medium' ? 'warning' : 'note',
    message: { text: `${f.category}: ${f.remediation}` },
    locations: [{ physicalLocation: { artifactLocation: { uri: f.location.file ?? f.location.url ?? 'target' }, region: { startLine: f.location.line ?? 1 } } }],
  }));
  return { version: '2.1.0', runs: [{ tool: { driver: { name: 'Unified QA Security Platform', informationUri: 'https://owasp.org', rules } }, results }] };
}

export function computeScores(findings: NormalizedFinding[]) {
  const penalty = (finding: NormalizedFinding) => ({ critical: 40, high: 30, medium: 15, low: 5, info: 1 }[finding.severity] ?? 0);
  const qaPenalty = findings.filter((f) => f.type === 'qa' && f.status !== 'pass').reduce((sum, f) => sum + penalty(f), 0);
  const secPenalty = findings.filter((f) => f.type === 'security' && f.status !== 'pass').reduce((sum, f) => sum + penalty(f), 0);
  const qa = Math.max(0, 100 - qaPenalty);
  const security = Math.max(0, 100 - secPenalty);
  return { qa, security, unified: Math.round((qa + security) / 2) };
}

export function normalizeRun(params: { runId: string; target: RunTarget; profile: RunProfile; findings: NormalizedFinding[]; matrix: MatrixResult[]; startedAt: string; finishedAt: string }): RunResult {
  const score = computeScores(params.findings);
  const blocked = params.findings.some((f) => shouldGate(params.profile, f.severity, f.status));
  const started = new Date(params.startedAt).getTime();
  const finished = new Date(params.finishedAt).getTime();
  return {
    runId: params.runId,
    target: params.target,
    profile: params.profile,
    status: blocked ? 'failed' : 'passed',
    verdict: blocked ? 'fail' : 'pass',
    startedAt: params.startedAt,
    finishedAt: params.finishedAt,
    durationMs: Math.max(0, finished - started),
    score,
    findings: params.findings,
    matrix: params.matrix,
    sarif: sarifFromFindings(params.findings),
  };
}

export function qaFinding(input: { targetUrl: string; testType: NormalizedFinding['testType']; status: NormalizedFinding['status']; severity?: NormalizedFinding['severity']; category: string; selector?: string; evidence?: string; remediation: string; reproduction: string[] }): NormalizedFinding {
  const stableKey = ['qa', input.testType, input.targetUrl, input.selector ?? input.category].join('|');
  return {
    findingId: stableFindingId([stableKey]),
    stableKey,
    type: 'qa',
    testType: input.testType,
    category: input.category,
    severity: input.severity ?? (input.status === 'fail' ? 'high' : 'info'),
    status: input.status,
    location: { url: input.targetUrl, selector: input.selector },
    evidence: { rawTool: input.evidence },
    reproduction: input.reproduction,
    remediation: input.remediation,
  };
}

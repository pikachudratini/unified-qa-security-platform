import { describe, expect, it } from 'vitest';
import { computeScores, normalizeRun, qaFinding, stableFindingId } from './normalizer';
import type { RunTarget } from './types';

const target: RunTarget = { id: 'target-example', name: 'example.com', url: 'https://example.com', profile: 'fast' };

describe('stableFindingId', () => {
  it('returns deterministic IDs for the same stable key', () => {
    expect(stableFindingId(['qa', 'smoke', 'https://example.com'])).toBe(stableFindingId(['qa', 'smoke', 'https://example.com']));
  });
});

describe('qaFinding', () => {
  it('builds an agent-readable normalized finding', () => {
    const finding = qaFinding({
      targetUrl: 'https://example.com',
      testType: 'smoke',
      status: 'fail',
      category: 'Smoke: target loads',
      remediation: 'Fix the app server.',
      reproduction: ['GET /'],
    });
    expect(finding.findingId).toMatch(/^f_/);
    expect(finding.type).toBe('qa');
    expect(finding.location.url).toBe('https://example.com');
    expect(finding.remediation).toContain('Fix');
  });
});

describe('computeScores', () => {
  it('penalizes failing findings by severity', () => {
    const findings = [
      qaFinding({ targetUrl: 'https://example.com', testType: 'smoke', status: 'fail', severity: 'high', category: 'Smoke failed', remediation: 'Start server.', reproduction: ['GET /'] }),
      qaFinding({ targetUrl: 'https://example.com', testType: 'functional', status: 'warn', severity: 'low', category: 'Minor visual issue', remediation: 'Review.', reproduction: ['Open /'] }),
    ];
    expect(computeScores(findings).qa).toBe(65);
  });
});

describe('normalizeRun', () => {
  it('fails the run when a high severity finding gates', () => {
    const finding = qaFinding({ targetUrl: target.url, testType: 'smoke', status: 'fail', severity: 'high', category: 'Smoke failed', remediation: 'Start server.', reproduction: ['GET /'] });
    const run = normalizeRun({ runId: 'run-1', target, profile: 'fast', findings: [finding], matrix: [], startedAt: '2026-01-01T00:00:00.000Z', finishedAt: '2026-01-01T00:00:01.000Z' });
    expect(run.status).toBe('failed');
    expect(run.verdict).toBe('fail');
    expect(run.durationMs).toBe(1000);
  });

  it('passes the run when all findings pass', () => {
    const finding = qaFinding({ targetUrl: target.url, testType: 'smoke', status: 'pass', severity: 'info', category: 'Smoke passed', remediation: 'No action needed.', reproduction: ['GET /'] });
    const run = normalizeRun({ runId: 'run-2', target, profile: 'fast', findings: [finding], matrix: [], startedAt: '2026-01-01T00:00:00.000Z', finishedAt: '2026-01-01T00:00:01.000Z' });
    expect(run.status).toBe('passed');
    expect(run.verdict).toBe('pass');
  });
});

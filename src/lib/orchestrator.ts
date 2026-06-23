import type { MatrixResult, NormalizedFinding, RunRecord } from './types';
import { profileConfig, viewports } from './profiles';
import { normalizeRun, qaFinding } from './normalizer';
import { updateRun } from './store';

export async function executePhaseOneRun(record: RunRecord) {
  const startedAt = new Date().toISOString();
  updateRun(record.id, { status: 'running' });

  const findings: NormalizedFinding[] = [];
  const matrix: MatrixResult[] = [];
  const config = profileConfig[record.profile];
  const start = Date.now();

  try {
    const response = await fetch(record.target.url, { redirect: 'follow' });
    const html = await response.text();
    const alive = response.ok && html.length > 0;
    findings.push(qaFinding({
      targetUrl: record.target.url,
      testType: 'smoke',
      status: alive ? 'pass' : 'fail',
      severity: alive ? 'info' : 'high',
      category: 'Smoke: target loads',
      evidence: `HTTP ${response.status}, ${html.length} bytes`,
      remediation: alive ? 'No action needed.' : 'Verify the target URL is reachable and returns a rendered HTML response.',
      reproduction: [`GET ${record.target.url}`, 'Assert HTTP status is 2xx and body is non-empty'],
    }));

    if (record.target.expectedText) {
      const contains = html.includes(record.target.expectedText);
      findings.push(qaFinding({
        targetUrl: record.target.url,
        testType: 'functional',
        status: contains ? 'pass' : 'fail',
        severity: contains ? 'info' : 'high',
        category: 'Functional: expected text exists',
        evidence: contains ? `Found ${record.target.expectedText}` : `Missing ${record.target.expectedText}`,
        remediation: contains ? 'No action needed.' : 'Update the target page or test assertion so the expected text is present.',
        reproduction: [`Open ${record.target.url}`, `Search rendered HTML for ${record.target.expectedText}`],
      }));
    }
  } catch (error) {
    findings.push(qaFinding({
      targetUrl: record.target.url,
      testType: 'smoke',
      status: 'fail',
      severity: 'high',
      category: 'Smoke: target unreachable',
      evidence: error instanceof Error ? error.message : 'Unknown fetch error',
      remediation: 'Start the application, deploy a reachable target, or fix DNS/network errors.',
      reproduction: [`GET ${record.target.url}`],
    }));
  }

  for (const browser of config.browsers) {
    for (const viewport of viewports.slice(0, record.profile === 'fast' ? 1 : viewports.length)) {
      matrix.push({ id: `${record.id}_${browser}_${viewport.id}_smoke`, browser, viewport: viewport.id, os: browser === 'webkit' ? 'macOS/iOS emulated' : 'linux emulated', testType: 'smoke', status: findings.some((f) => f.status === 'fail') ? 'fail' : 'pass', durationMs: Date.now() - start });
    }
  }

  const finishedAt = new Date().toISOString();
  const result = normalizeRun({ runId: record.id, target: record.target, profile: record.profile, findings, matrix, startedAt, finishedAt });
  return updateRun(record.id, { status: result.status, result });
}

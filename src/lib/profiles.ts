import type { RunProfile, TestType } from './types';

export const viewports = [
  { id: 'mobile-small', width: 360, height: 640 },
  { id: 'mobile-large', width: 414, height: 896 },
  { id: 'tablet', width: 768, height: 1024 },
  { id: 'laptop', width: 1366, height: 768 },
  { id: 'desktop', width: 1920, height: 1080 },
];

export const profileConfig: Record<RunProfile, { browsers: Array<'chromium' | 'firefox' | 'webkit'>; testTypes: TestType[]; securityLayers: TestType[]; description: string }> = {
  fast: { browsers: ['chromium'], testTypes: ['smoke', 'functional'], securityLayers: ['sast', 'sca', 'secrets'], description: 'Commit and pull request profile. Fast QA smoke plus static, dependency, and secrets checks.' },
  full: { browsers: ['chromium', 'firefox', 'webkit'], testTypes: ['smoke', 'functional', 'responsive', 'accessibility', 'performance'], securityLayers: ['sast', 'sca', 'secrets', 'dast'], description: 'Post-deploy staging profile with cross browser QA and runtime attack scan.' },
  deep: { browsers: ['chromium', 'firefox', 'webkit'], testTypes: ['smoke', 'functional', 'responsive', 'accessibility', 'performance', 'visual', 'e2e'], securityLayers: ['sast', 'sca', 'secrets', 'dast'], description: 'Pre-release profile with full matrix and deeper security checks.' },
  scheduled: { browsers: ['chromium'], testTypes: ['smoke', 'accessibility', 'performance'], securityLayers: ['sca', 'dast'], description: 'Nightly or weekly profile for new CVEs, baseline DAST, and trend tracking.' },
};

export function shouldGate(profile: RunProfile, severity: string, status: string) {
  if (status === 'pass') return false;
  if (severity === 'critical' || severity === 'high') return true;
  if (profile === 'fast' && status === 'fail') return true;
  return false;
}

import type { RunRecord, TargetInput } from './types';

const runs = new Map<string, RunRecord>();

export function createRun(input: TargetInput): RunRecord {
  const id = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const target = { ...input, id: `target_${new URL(input.url).hostname.replace(/[^a-z0-9]/gi, '_')}`, name: new URL(input.url).hostname };
  const record: RunRecord = { id, status: 'queued', profile: input.profile, target, createdAt: now, updatedAt: now };
  runs.set(id, record);
  return record;
}

export function getRun(id: string) { return runs.get(id); }
export function listRuns() { return [...runs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
export function updateRun(id: string, patch: Partial<RunRecord>) {
  const existing = runs.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  runs.set(id, updated);
  return updated;
}

export function seedDemoRun(record: RunRecord) { runs.set(record.id, record); }

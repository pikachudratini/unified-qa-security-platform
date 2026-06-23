import { NextResponse } from 'next/server';
import { getRun, updateRun } from '@/lib/store';
import { executePhaseOneRun } from '@/lib/orchestrator';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = getRun(id);
  if (!run) return NextResponse.json({ error: 'RUN_NOT_FOUND' }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const findingIds = Array.isArray(body.findingIds) ? body.findingIds : [];
  updateRun(id, { status: 'queued' });
  const updated = await executePhaseOneRun(run);
  return NextResponse.json({ runId: id, retestedFindingIds: findingIds, status: updated?.status, resultUrl: `/api/runs/${id}/result` });
}

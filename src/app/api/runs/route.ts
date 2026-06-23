import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRun } from '@/lib/store';
import { executePhaseOneRun } from '@/lib/orchestrator';

const StartRunSchema = z.object({
  url: z.string().url(),
  repoUrl: z.string().url().optional(),
  profile: z.enum(['fast', 'full', 'deep', 'scheduled']).default('fast'),
  expectedText: z.string().optional(),
  scope: z.object({ includePaths: z.array(z.string()).optional(), excludePaths: z.array(z.string()).optional() }).optional(),
  auth: z.object({ strategy: z.enum(['none', 'basic', 'form', 'token']), username: z.string().optional(), passwordSecretRef: z.string().optional(), tokenSecretRef: z.string().optional() }).optional(),
});

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = StartRunSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() }, { status: 422 });
  }
  const run = createRun(parsed.data);
  await executePhaseOneRun(run);
  return NextResponse.json({ runId: run.id, statusUrl: `/api/runs/${run.id}`, resultUrl: `/api/runs/${run.id}/result` }, { status: 202 });
}

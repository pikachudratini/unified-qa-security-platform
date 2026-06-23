import { NextResponse } from 'next/server';
import { getRun } from '@/lib/store';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = getRun(id);
  if (!run?.result) return NextResponse.json({ error: 'SARIF_NOT_FOUND' }, { status: 404 });
  return NextResponse.json(run.result.sarif);
}

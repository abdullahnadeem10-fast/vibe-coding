import { NextResponse } from 'next/server';
import { loadSharedScenarioByToken } from '@/lib/scenarios/service';

export async function GET(
  _request: Request,
  context: { params: { token: string } },
) {
  const scenario = await loadSharedScenarioByToken(context.params.token);

  if (!scenario) {
    return NextResponse.json({ error: 'Share token not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: scenario.id,
    name: scenario.name,
    summary: scenario.summary,
    weeklySnapshots: scenario.weeklySnapshots,
    createdAt: scenario.createdAt,
    parentScenarioId: scenario.parentScenarioId,
    branchFromDay: scenario.branchFromDay,
  });
}

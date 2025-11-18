import { NextResponse } from 'next/server';
import { getBinnacle } from '@/lib/api/binnacles';

export async function GET(
  request: Request,
  context: { params?: Promise<{ id?: string }> }
) {
  const resolvedParams = context?.params ? await context.params : undefined;
  const routeId = resolvedParams?.id;

  const url = new URL(request.url);
  const q = url.searchParams;

  // Prefer explicit query params, fall back to route `id` for userName
  const userName = q.get('userName') ?? routeId ?? undefined;
  const startDate = q.get('startDate') ?? undefined; // 'YYYY-MM-DD'
  const endDate = q.get('endDate') ?? undefined; // 'YYYY-MM-DD'
  const startTime = q.get('startTime') ?? undefined; // 'HH:MM[:SS]'
  const endTime = q.get('endTime') ?? undefined; // 'HH:MM[:SS]'
  const changeType = q.get('changeType') ?? undefined;

  // Build params object only with provided values
  const params: Record<string, unknown> = {};
  if (userName) params.userName = userName;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (startTime) params.startTime = startTime;
  if (endTime) params.endTime = endTime;
  if (changeType) params.changeType = changeType;

  const { data, error } = await getBinnacle(Object.keys(params).length ? params : undefined);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}
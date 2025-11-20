import { NextResponse } from 'next/server';
import { getPointsSummary } from '@/lib/api/statistics';

/**
 * GET /api/statistics/bypointssummary
 * Query params:
 *  - start: ISO date string (yyyy-mm-dd or full ISO) optional
 *  - end: ISO date string optional
 *
 * Example: /api/statistics/bypointssummary?start=2025-01-01&end=2025-12-31
 */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');

  // Call getPointsSummary with start/end (strings or null)
  const { data, error } = await getPointsSummary(start ?? null, end ?? null);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
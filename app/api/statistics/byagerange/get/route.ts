import { NextResponse } from 'next/server';
import { statsUsersByAgeRanges } from '@/lib/api/statistics';

/**
 * GET /api/statistics/statsbyagerange
 * Query params:
 *  - start: ISO date string (yyyy-mm-dd or full ISO) optional
 *
 * Example: /api/statistics/statsbyagerange?start=2025-01-01
 */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const start = url.searchParams.get('start');

  // Normalize start: treat empty string as null
  const refDate = start && start.trim() !== '' ? start.trim() : null;

  // If provided, validate basic YYYY-MM-DD or ISO format (simple check)
  if (refDate) {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T.*)?$/;
    if (!isoDateRegex.test(refDate)) {
      return NextResponse.json({ error: 'Invalid date format for `start`. Use YYYY-MM-DD or ISO.' }, { status: 400 });
    }
  }

  // Call statsUsersByAgeRanges with refDate (string or null)
  const { data, error } = await statsUsersByAgeRanges(refDate);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
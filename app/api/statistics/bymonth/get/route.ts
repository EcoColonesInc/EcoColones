import { NextResponse } from 'next/server';
import { statsProductsRedeemedByMonth } from '@/lib/api/statistics';

/**
 * GET /api/statistics/bymonth
 * Query params:
 *  - year: number optional
 *
 * Example: /api/statistics/bymonth?year=2025
 */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const yearParam = url.searchParams.get('year');
  const year = yearParam ? parseInt(yearParam, 10) : null;

  // Call statsProductsRedeemedByMonth with year (number or null)
  const { data, error } = await statsProductsRedeemedByMonth(year);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
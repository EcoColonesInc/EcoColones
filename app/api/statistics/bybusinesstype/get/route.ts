import { NextResponse } from 'next/server';
import { statsAffiliatedByType } from '@/lib/api/statistics';

export async function GET() {
  const { data, error } = await statsAffiliatedByType();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}
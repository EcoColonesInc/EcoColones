import { NextResponse } from 'next/server';
import { statsProductsRedeemedByYear } from '@/lib/api/statistics';

export async function GET() {
  const { data, error } = await statsProductsRedeemedByYear();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}
import { NextResponse } from 'next/server';
import { getDefaultCurrency } from '@/lib/api/currencies';

export async function GET() {
  const { data, error } = await getDefaultCurrency();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
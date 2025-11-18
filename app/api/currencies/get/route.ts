import { NextResponse } from 'next/server';
import { getAllCurrencies } from '@/lib/api/currencies';

export async function GET(request: Request) {
  const { data, error } = await getAllCurrencies();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
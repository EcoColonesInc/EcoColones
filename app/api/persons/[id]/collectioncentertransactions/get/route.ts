import { NextResponse } from 'next/server';
import { getUserCenterTransactions } from '@/lib/api/transactions';

export async function GET(request: Request) {
  const { data, error } = await getUserCenterTransactions();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
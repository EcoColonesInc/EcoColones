import { NextResponse } from 'next/server';
import { getAllAffiliatedBusinessTransactions } from '@/lib/api/transactions';

export async function GET(request: Request) {
  const { data, error } = await getAllAffiliatedBusinessTransactions();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
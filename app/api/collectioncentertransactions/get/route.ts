import { NextResponse } from 'next/server';
import { getAllCollectionCentersTransactions } from '@/lib/api/transactions';

export async function GET() {
  const { data, error } = await getAllCollectionCentersTransactions();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
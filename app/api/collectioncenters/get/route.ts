import { NextResponse } from 'next/server';
import { getAllCollectionCenters } from '@/lib/api/collectioncenters';

export async function GET(request: Request) {
  const { data, error } = await getAllCollectionCenters();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
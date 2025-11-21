import { NextResponse } from 'next/server';
import { getUserCollectionCenter } from '@/lib/api/collectioncenters';

export async function GET() {
  const { data, error } = await getUserCollectionCenter();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}

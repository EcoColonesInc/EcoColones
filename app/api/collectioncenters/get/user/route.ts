import { NextResponse } from 'next/server';
import { getUserCollectionCenter } from '@/lib/api/collectioncenters';

export async function GET() {
  const { data, error } = await getUserCollectionCenter();

  if (error) {
    return NextResponse.json({ error }, { status: error === 'Unauthorized' ? 401 : 404 });
  }

  return NextResponse.json(data);
}

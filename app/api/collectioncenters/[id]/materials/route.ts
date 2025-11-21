import { NextResponse } from 'next/server';
import { getCollectionCenterRecycledMaterials } from '@/lib/api/collectioncenters';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || undefined;
  const year = searchParams.get('year') || undefined;

  const { data, error } = await getCollectionCenterRecycledMaterials(id, month, year);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

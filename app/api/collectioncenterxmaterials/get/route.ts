import { NextResponse } from 'next/server';
import { getAllColletionCentersXMaterials, getMaterialsByCollectionCenterId } from '@/lib/api/materials';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const centerId = searchParams.get('centerId');

  if (centerId) {
    const { data, error } = await getMaterialsByCollectionCenterId(centerId);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }
    return NextResponse.json(data);
  }

  const { data, error } = await getAllColletionCentersXMaterials();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
import { NextResponse } from 'next/server';
import { getAllColletionCentersXMaterials } from '@/lib/api/materials';

export async function GET() {
  const { data, error } = await getAllColletionCentersXMaterials();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
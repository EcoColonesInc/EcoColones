import { NextResponse } from 'next/server';
import { getMostRecycledMaterials } from '@/lib/api/materials';

export async function GET() {
  const { data, error } = await getMostRecycledMaterials();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data });
}

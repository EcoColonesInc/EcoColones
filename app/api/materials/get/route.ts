import { NextResponse } from 'next/server';
import { getAllMaterials } from '@/lib/api/materials';

export async function GET(request: Request) {
  const { data, error } = await getAllMaterials();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
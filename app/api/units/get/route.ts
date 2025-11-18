import { NextResponse } from 'next/server';
import { getAllUnits } from '@/lib/api/units';

export async function GET() {
  const { data, error } = await getAllUnits();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
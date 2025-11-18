import { NextResponse } from 'next/server';
import { getAllProvinces } from '@/lib/api/locations';

export async function GET() {
  const { data, error } = await getAllProvinces();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
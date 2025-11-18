import { NextResponse } from 'next/server';
import { getAllDistricts } from '@/lib/api/locations';

export async function GET(request: Request) {
  const { data, error } = await getAllDistricts();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
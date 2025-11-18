import { NextResponse } from 'next/server';
import { getAllBusinessTypes } from '@/lib/api/businesstypes';

export async function GET(request: Request) {
  const { data, error } = await getAllBusinessTypes();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
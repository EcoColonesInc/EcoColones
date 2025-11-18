import { NextResponse } from 'next/server';
import { getAllCountries } from '@/lib/api/locations';

export async function GET() {
  const { data, error } = await getAllCountries();

  if (error) {
	return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
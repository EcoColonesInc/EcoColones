import { NextResponse } from 'next/server';
import { getAllAffiliatedBusiness } from '@/lib/api/affiliatedbusiness';

export async function GET(request: Request) {
  const { data, error } = await getAllAffiliatedBusiness();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json(data);
}
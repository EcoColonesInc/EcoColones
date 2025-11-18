import { NextResponse } from 'next/server';
import { getAffiliatedBusinessById } from '@/lib/api/affiliatedbusiness';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams?.id;
  if (!id) {
    return NextResponse.json({ error: 'Missing affiliated business id' }, { status: 400 });
  }

  const { data, error } = await getAffiliatedBusinessById(id);

  if (error) {
    return NextResponse.json({ error }, { status: 404 });
  }

  return NextResponse.json(data);
}
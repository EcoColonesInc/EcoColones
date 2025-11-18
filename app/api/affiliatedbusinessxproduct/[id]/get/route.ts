import { NextResponse } from 'next/server';
import { getProductsByAffiliatedBusinessId } from '@/lib/api/products';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { data, error } = await getProductsByAffiliatedBusinessId(id);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ data });
}

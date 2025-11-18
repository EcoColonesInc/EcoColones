import { NextResponse, NextRequest } from 'next/server';
import { getProductsByAffiliatedBusinessId } from '@/lib/api/products';

// Ajuste de firma para coincidir con tipos generados que esperan params como Promise
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { data, error } = await getProductsByAffiliatedBusinessId(id);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ data });
}

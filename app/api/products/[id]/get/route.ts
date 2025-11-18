import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/api/products';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams?.id;
  if (!id) {
    return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
  }

  const { data, error } = await getProductById(id);

  if (error) {
    return NextResponse.json({ error }, { status: 404 });
  }

  return NextResponse.json(data);
}
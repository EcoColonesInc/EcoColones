import { NextResponse } from 'next/server';
import { getCurrencyById } from '@/lib/api/currencies';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams?.id;
  if (!id) {
    return NextResponse.json({ error: 'Missing currency id' }, { status: 400 });
  }

  const { data, error } = await getCurrencyById(id);

  if (error) {
    return NextResponse.json({ error }, { status: 404 });
  }

  return NextResponse.json(data);
}
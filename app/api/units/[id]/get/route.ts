import { NextResponse } from 'next/server';
import { getUnitById } from '@/lib/api/units';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams?.id;
  if (!id) {
    return NextResponse.json({ error: 'Missing unit id' }, { status: 400 });
  }

  const { data, error } = await getUnitById(id);

  if (error) {
    return NextResponse.json({ error }, { status: 404 });
  }

  return NextResponse.json(data);
}
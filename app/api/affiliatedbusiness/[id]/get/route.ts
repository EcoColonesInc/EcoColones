import { NextResponse } from 'next/server';
import { getUserAffiliatedBusiness, getAffiliatedBusinessById } from '@/lib/api/affiliatedbusiness';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const id = resolvedParams?.id;
  
  // Si id == 'me', obtener collection center del usuario autenticado
  if (id === 'me') {
    const { data, error } = await getUserAffiliatedBusiness();
    if (error) {
      return NextResponse.json({ error }, { status: error === 'Unauthorized' ? 401 : 404 });
    }
    return NextResponse.json(data);
  }
  
  if (!id) {
    return NextResponse.json({ error: 'Missing collection center id' }, { status: 400 });
  }

  const { data, error } = await getAffiliatedBusinessById(id);

  if (error) {
    return NextResponse.json({ error }, { status: 404 });
  }

  return NextResponse.json(data);
}